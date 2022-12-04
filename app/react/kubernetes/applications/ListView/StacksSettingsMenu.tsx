import { Authorized } from '@/react/hooks/useUser';

import { TableSettingsMenu } from '@@/datatables';
import { TableSettingsMenuAutoRefresh } from '@@/datatables/TableSettingsMenuAutoRefresh';
import { Checkbox } from '@@/form-components/Checkbox';

import { type TableSettings } from './types';

export function StacksSettingsMenu({ settings }: { settings: TableSettings }) {
  return (
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
  );
}
