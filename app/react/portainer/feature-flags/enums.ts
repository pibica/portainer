export enum Edition {
  CE,
  BE,
}

export enum FeatureState {
  HIDDEN,
  VISIBLE,
  LIMITED_BE,
}

export enum FeatureId {
  K8S_RESOURCE_POOL_LB_QUOTA = 'k8s-resourcepool-Ibquota',
  K8S_RESOURCE_POOL_STORAGE_QUOTA = 'k8s-resourcepool-storagequota',
  K8S_CREATE_FROM_KUBECONFIG = 'k8s-create-from-kubeconfig',
  K8S_EDIT_YAML = 'k8s-edit-yaml',
  KAAS_PROVISIONING = 'kaas-provisioning',
  NOMAD = 'nomad',
  RBAC_ROLES = 'rbac-roles',
  REGISTRY_MANAGEMENT = 'registry-management',
  K8S_SETUP_DEFAULT = 'k8s-setup-default',
  S3_BACKUP_SETTING = 's3-backup-setting',
  S3_RESTORE = 'restore-s3-form',
  HIDE_INTERNAL_AUTHENTICATION_PROMPT = 'hide-internal-authentication-prompt',
  TEAM_MEMBERSHIP = 'team-membership',
  HIDE_INTERNAL_AUTH = 'hide-internal-auth',
  EXTERNAL_AUTH_LDAP = 'external-auth-ldap',
  ACTIVITY_AUDIT = 'activity-audit',
  FORCE_REDEPLOYMENT = 'force-redeployment',
  HIDE_AUTO_UPDATE_WINDOW = 'hide-auto-update-window',
  STACK_PULL_IMAGE = 'stack-pull-image',
  STACK_WEBHOOK = 'stack-webhook',
  CONTAINER_WEBHOOK = 'container-webhook',
  POD_SECURITY_POLICY_CONSTRAINT = 'pod-security-policy-constraint',
  HIDE_DOCKER_HUB_ANONYMOUS = 'hide-docker-hub-anonymous',
  CUSTOM_LOGIN_BANNER = 'custom-login-banner',
  ENFORCE_DEPLOYMENT_OPTIONS = 'k8s-enforce-deployment-options',
  K8S_ADM_ONLY_USR_INGRESS_DEPLY = 'k8s-admin-only-ingress-deploy',
  K8S_ROLLING_RESTART = 'k8s-rolling-restart',
}
