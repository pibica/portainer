package edgestacks

import (
	"errors"
	"net/http"
	"strconv"

	httperror "github.com/portainer/libhttp/error"
	"github.com/portainer/libhttp/request"
	"github.com/portainer/libhttp/response"
	portainer "github.com/portainer/portainer/api"
	"github.com/portainer/portainer/api/filesystem"
	"github.com/portainer/portainer/api/internal/edge"
	"github.com/portainer/portainer/api/internal/endpointutils"
)

type updateEdgeStackPayload struct {
	StackFileContent string
	Version          *int
	EdgeGroups       []portainer.EdgeGroupID
	DeploymentType   portainer.EdgeStackDeploymentType
	// Uses the manifest's namespaces instead of the default one
	UseManifestNamespaces bool
}

func (payload *updateEdgeStackPayload) Validate(r *http.Request) error {
	if payload.StackFileContent == "" {
		return errors.New("Invalid stack file content")
	}
	if len(payload.EdgeGroups) == 0 {
		return errors.New("Edge Groups are mandatory for an Edge stack")
	}
	return nil
}

// @id EdgeStackUpdate
// @summary Update an EdgeStack
// @description **Access policy**: administrator
// @tags edge_stacks
// @security ApiKeyAuth
// @security jwt
// @accept json
// @produce json
// @param id path string true "EdgeStack Id"
// @param body body updateEdgeStackPayload true "EdgeStack data"
// @success 200 {object} portainer.EdgeStack
// @failure 500
// @failure 400
// @failure 503 "Edge compute features are disabled"
// @router /edge_stacks/{id} [put]
func (handler *Handler) edgeStackUpdate(w http.ResponseWriter, r *http.Request) *httperror.HandlerError {
	stackID, err := request.RetrieveNumericRouteVariableValue(r, "id")
	if err != nil {
		return httperror.BadRequest("Invalid stack identifier route variable", err)
	}

	stack, err := handler.DataStore.EdgeStack().EdgeStack(portainer.EdgeStackID(stackID))
	if err != nil {
		return handler.handlerDBErr(err, "Unable to find a stack with the specified identifier inside the database")
	}

	var payload updateEdgeStackPayload
	err = request.DecodeAndValidateJSONPayload(r, &payload)
	if err != nil {
		return httperror.BadRequest("Invalid request payload", err)
	}

	relationConfig, err := edge.FetchEndpointRelationsConfig(handler.DataStore)
	if err != nil {
		return httperror.InternalServerError("Unable to retrieve environments relations config from database", err)
	}

	relatedEndpointIds, err := edge.EdgeStackRelatedEndpoints(stack.EdgeGroups, relationConfig.Endpoints, relationConfig.EndpointGroups, relationConfig.EdgeGroups)
	if err != nil {
		return httperror.InternalServerError("Unable to retrieve edge stack related environments from database", err)
	}

	endpointsToAdd := map[portainer.EndpointID]bool{}

	if payload.EdgeGroups != nil {
		newRelated, err := edge.EdgeStackRelatedEndpoints(payload.EdgeGroups, relationConfig.Endpoints, relationConfig.EndpointGroups, relationConfig.EdgeGroups)
		if err != nil {
			return httperror.InternalServerError("Unable to retrieve edge stack related environments from database", err)
		}

		oldRelatedSet := endpointutils.EndpointSet(relatedEndpointIds)
		newRelatedSet := endpointutils.EndpointSet(newRelated)

		endpointsToRemove := map[portainer.EndpointID]bool{}
		for endpointID := range oldRelatedSet {
			if !newRelatedSet[endpointID] {
				endpointsToRemove[endpointID] = true
			}
		}

		for endpointID := range endpointsToRemove {
			relation, err := handler.DataStore.EndpointRelation().EndpointRelation(endpointID)
			if err != nil {
				return httperror.InternalServerError("Unable to find environment relation in database", err)
			}

			delete(relation.EdgeStacks, stack.ID)

			err = handler.DataStore.EndpointRelation().UpdateEndpointRelation(endpointID, relation)
			if err != nil {
				return httperror.InternalServerError("Unable to persist environment relation in database", err)
			}
		}

		for endpointID := range newRelatedSet {
			if !oldRelatedSet[endpointID] {
				endpointsToAdd[endpointID] = true
			}
		}

		for endpointID := range endpointsToAdd {
			relation, err := handler.DataStore.EndpointRelation().EndpointRelation(endpointID)
			if err != nil {
				return httperror.InternalServerError("Unable to find environment relation in database", err)
			}

			relation.EdgeStacks[stack.ID] = true

			err = handler.DataStore.EndpointRelation().UpdateEndpointRelation(endpointID, relation)
			if err != nil {
				return httperror.InternalServerError("Unable to persist environment relation in database", err)
			}
		}

		stack.EdgeGroups = payload.EdgeGroups
		relatedEndpointIds = newRelated
	}

	if stack.DeploymentType != payload.DeploymentType {
		// deployment type was changed - need to delete the old file
		err = handler.FileService.RemoveDirectory(stack.ProjectPath)
		if err != nil {
			return httperror.InternalServerError("Unable to clear old files", err)
		}

		stack.EntryPoint = ""
		stack.ManifestPath = ""
		stack.DeploymentType = payload.DeploymentType
	}

	stackFolder := strconv.Itoa(int(stack.ID))

	if payload.DeploymentType == portainer.EdgeStackDeploymentCompose {
		if stack.EntryPoint == "" {
			stack.EntryPoint = filesystem.ComposeFileDefaultName
		}

		_, err := handler.FileService.StoreEdgeStackFileFromBytes(stackFolder, stack.EntryPoint, []byte(payload.StackFileContent))
		if err != nil {
			return httperror.InternalServerError("Unable to persist updated Compose file on disk", err)
		}

		manifestPath, err := handler.convertAndStoreKubeManifestIfNeeded(stackFolder, stack.ProjectPath, stack.EntryPoint, relatedEndpointIds)
		if err != nil {
			return httperror.InternalServerError("Unable to convert and persist updated Kubernetes manifest file on disk", err)
		}

		stack.ManifestPath = manifestPath
	}

	if payload.DeploymentType == portainer.EdgeStackDeploymentKubernetes {
		if stack.ManifestPath == "" {
			stack.ManifestPath = filesystem.ManifestFileDefaultName
		}

		stack.UseManifestNamespaces = payload.UseManifestNamespaces

		hasDockerEndpoint, err := hasDockerEndpoint(handler.DataStore.Endpoint(), relatedEndpointIds)
		if err != nil {
			return httperror.InternalServerError("Unable to check for existence of docker environment", err)
		}

		if hasDockerEndpoint {
			return httperror.BadRequest("Edge stack with docker environment cannot be deployed with kubernetes config", err)
		}

		_, err = handler.FileService.StoreEdgeStackFileFromBytes(stackFolder, stack.ManifestPath, []byte(payload.StackFileContent))
		if err != nil {
			return httperror.InternalServerError("Unable to persist updated Kubernetes manifest file on disk", err)
		}
	}

	versionUpdated := payload.Version != nil && *payload.Version != stack.Version
	if versionUpdated {
		stack.Version = *payload.Version
		stack.Status = map[portainer.EndpointID]portainer.EdgeStackStatus{}
	}

	stack.NumDeployments = len(relatedEndpointIds)

	if versionUpdated {
		stack.Status = make(map[portainer.EndpointID]portainer.EdgeStackStatus)
	}

	err = handler.DataStore.EdgeStack().UpdateEdgeStack(stack.ID, stack)
	if err != nil {
		return httperror.InternalServerError("Unable to persist the stack changes inside the database", err)
	}

	return response.JSON(w, stack)
}
