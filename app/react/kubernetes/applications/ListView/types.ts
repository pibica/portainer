import {
  BasicTableSettings,
  RefreshableTableSettings,
} from '@@/datatables/types';

export interface TableSettings
  extends BasicTableSettings,
    RefreshableTableSettings {
  showSystem: boolean;
  setShowSystem: (showSystem: boolean) => void;
}
