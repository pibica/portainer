import { useStore } from 'zustand';
import { List, Trash2 } from 'lucide-react';
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
import { Link } from '@@/Link';

import { KubernetesStack } from '../types';

import { columns } from './columns';

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

interface Props {
  dataset: Array<KubernetesStack>;
  onRemove(selectedItems: Array<KubernetesStack>): void;
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
    <ExpandableDatatable<KubernetesStack>
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
