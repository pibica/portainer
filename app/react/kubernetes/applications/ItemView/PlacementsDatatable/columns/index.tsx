import { Column } from 'react-table';

import { buildExpandColumn } from '@@/datatables/expand-column';

import { Node } from '../../types';

import { status } from './status';

export const columns: Column<Node>[] = [
  buildExpandColumn((item) => !item.AcceptsApplication),
  status,
  {
    Header: 'Node',
    accessor: 'Name',
    id: 'node',
    disableFilters: true,
    Filter: () => null,
    canHide: false,
    sortType: 'string',
  },
];
