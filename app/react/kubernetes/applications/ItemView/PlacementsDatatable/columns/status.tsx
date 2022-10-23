import { Check, X } from 'react-feather';
import { CellProps, Column } from 'react-table';

import { Icon } from '@@/Icon';

import { Node } from '../../types';

export const status: Column<Node> = {
  id: 'status',
  Header: '',
  Cell: ({ row }: CellProps<Node>) => (
    <Icon
      icon={row.original.AcceptsApplication ? Check : X}
      mode={row.original.AcceptsApplication ? 'success' : 'danger'}
      size="sm"
    />
  ),
  width: 30,
  disableResizing: true,
  disableFilters: true,
  Filter: () => null,
  canHide: false,
};
