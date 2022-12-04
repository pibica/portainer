import { useStore } from 'zustand';
import { List, Trash2 } from 'lucide-react';

import { Authorized, useAuthorizations } from '@/react/hooks/useUser';

import { ExpandableDatatable } from '@@/datatables/ExpandableDatatable';
import { useSearchBarState } from '@@/datatables/SearchBar';
import { createPersistedStore, refreshableSettings } from '@@/datatables/types';
import { TextTip } from '@@/Tip/TextTip';
import { Button } from '@@/buttons';
import { useRepeater } from '@@/datatables/useRepeater';

import { KubernetesStack } from '../types';

import { columns } from './columns';
import { SubRows } from './SubRows';
import { TableSettings } from './types';
import { StacksSettingsMenu } from './StacksSettingsMenu';

const storageKey = 'kubernetes.applications.stacks';

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
        <SubRows stack={row.original} span={row.cells.length} />
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
      renderTableSettings={() => <StacksSettingsMenu settings={settings} />}
      getRowId={(row) => `${row.Name}-${row.ResourcePool}`}
    />
  );
}
