import { CellProps, Column } from 'react-table';
import { useStore } from 'zustand';
import { FileText, List, Trash2 } from 'lucide-react';
import clsx from 'clsx';

import { Authorized, useAuthorizations } from '@/react/hooks/useUser';
import KubernetesNamespaceHelper from '@/kubernetes/helpers/namespaceHelper';
import KubernetesApplicationHelper from '@/kubernetes/helpers/application';

import { ExpandableDatatable } from '@@/datatables/ExpandableDatatable';
import { useSearchBarState } from '@@/datatables/SearchBar';
import {
  BasicTableSettings,
  createPersistedStore,
  refreshableSettings,
  RefreshableTableSettings,
} from '@@/datatables/types';
import { TextTip } from '@@/Tip/TextTip';
import { Button } from '@@/buttons';
import { TableSettingsMenu } from '@@/datatables';
import { TableSettingsMenuAutoRefresh } from '@@/datatables/TableSettingsMenuAutoRefresh';
import { Checkbox } from '@@/form-components/Checkbox';
import { useRepeater } from '@@/datatables/useRepeater';
import { buildExpandColumn } from '@@/datatables/expand-column';
import { Link } from '@@/Link';
import { Icon } from '@@/Icon';

type Application = {
  Name: string;
  ResourcePool: string;
};

type Stack = {
  Name: string;
  ResourcePool: string;
  Applications: Array<Application>;
  Highlighted: boolean;
};

const storageKey = 'kubernetes.applications.stacks';

interface TableSettings extends BasicTableSettings, RefreshableTableSettings {
  showSystem: boolean;
  setShowSystem: (showSystem: boolean) => void;
}

const settingsStore = createPersistedStore<TableSettings>(
  storageKey,
  'name',
  (set) => ({
    showSystem: false,
    setShowSystem: (showSystem: boolean) => set({ showSystem }),
    ...refreshableSettings(set),
  })
);

const columns: Array<Column<Stack>> = [
  buildExpandColumn<Stack>((item) => item.Applications.length > 0),
  {
    id: 'name',
    Header: 'Stack',
    accessor: 'Name',
    disableFilters: true,
    Filter: () => null,
    canHide: false,
  },
  {
    id: 'namespace',
    Header: 'Namespace',
    accessor: 'ResourcePool',
    Cell: ({ value }: CellProps<Stack, string>) => (
      <>
        <Link to="kubernetes.resourcePools.resourcePool" params={{ id: value }}>
          {value}
        </Link>
        {KubernetesNamespaceHelper.isSystemNamespace(value) && (
          <span className="label label-info image-tag label-margins">
            system
          </span>
        )}
      </>
    ),
    disableFilters: true,
    Filter: () => null,
    canHide: false,
  },
  {
    id: 'applications',
    Header: 'Applications',
    accessor: (row) => row.Applications.length,
    disableFilters: true,
    Filter: () => null,
    canHide: false,
  },
  {
    id: 'actions',
    Header: 'Actions',
    disableFilters: true,
    Filter: () => null,
    canHide: false,
    Cell: ({ row: { original: item } }: CellProps<Stack>) => (
      <Link
        to="kubernetes.stacks.stack.logs"
        params={{ namespace: item.ResourcePool, name: item.Name }}
        className="vertical-center"
      >
        <Icon icon={FileText} />
        Logs
      </Link>
    ),
  },
];

interface Props {
  dataset: Array<Stack>;
  onRemove(selectedItems: Array<Stack>): void;
  onRefresh(): Promise<void>;
}

export function ApplicationsStacksDatatable({
  dataset,
  onRemove,
  onRefresh,
}: Props) {
  const settings = useStore(settingsStore);
  const [search, setSearch] = useSearchBarState(storageKey);
  const authorized = useAuthorizations('K8sApplicationsW');
  useRepeater(settings.autoRefreshRate, onRefresh);

  return (
    <ExpandableDatatable<Stack>
      title="Stacks"
      titleIcon={List}
      dataset={dataset}
      columns={columns}
      initialPageSize={settings.pageSize}
      onPageSizeChange={settings.setPageSize}
      initialSortBy={settings.sortBy}
      onSortByChange={settings.setSortBy}
      searchValue={search}
      onSearchChange={setSearch}
      disableSelect={!authorized}
      renderSubRow={(row) => (
        <>
          {row.original.Applications.map((app) => (
            <tr
              className={clsx({
                'datatable-highlighted': row.original.Highlighted,
                'datatable-unhighlighted': !row.original.Highlighted,
              })}
            >
              <td />
              <td colSpan={row.cells.length - 1}>
                <Link
                  to="kubernetes.applications.application"
                  params={{ name: app.Name, namespace: app.ResourcePool }}
                >
                  {app.Name}
                </Link>
                {KubernetesNamespaceHelper.isSystemNamespace(
                  app.ResourcePool
                ) &&
                  KubernetesApplicationHelper.isExternalApplication(app) && (
                    <span className="space-left label label-primary image-tag">
                      external
                    </span>
                  )}
              </td>
            </tr>
          ))}
        </>
      )}
      noWidget
      emptyContentLabel="No stack available."
      description={
        !settings.showSystem && (
          <Authorized adminOnlyCE authorizations="K8sAccessSystemNamespaces">
            <TextTip color="blue">
              System resources are hidden, this can be changed in the table
              settings.
            </TextTip>
          </Authorized>
        )
      }
      renderTableActions={(selectedRows) => (
        <Authorized authorizations="K8sApplicationsW">
          <Button
            disabled={selectedRows.length === 0}
            color="dangerlight"
            onClick={() => onRemove(selectedRows)}
            icon={Trash2}
            data-cy="k8sApp-removeStackButton"
          >
            Remove
          </Button>
        </Authorized>
      )}
      renderTableSettings={() => (
        <TableSettingsMenu>
          <Authorized authorizations="K8sApplicationsW">
            <Checkbox
              id="settings-show-system"
              label="Show system resources"
              checked={settings.showSystem}
              onChange={(e) => settings.setShowSystem(e.target.checked)}
            />
          </Authorized>

          <TableSettingsMenuAutoRefresh
            onChange={settings.setAutoRefreshRate}
            value={settings.autoRefreshRate}
          />
        </TableSettingsMenu>
      )}
      getRowId={(row) => `${row.Name}-${row.ResourcePool}`}
    />
  );
}
