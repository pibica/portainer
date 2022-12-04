import { FileText } from 'lucide-react';
import { Column, CellProps } from 'react-table';

import KubernetesNamespaceHelper from '@/kubernetes/helpers/namespaceHelper';

import { buildExpandColumn } from '@@/datatables/expand-column';
import { Icon } from '@@/Icon';
import { Link } from '@@/Link';

import { KubernetesStack } from '../types';

export const columns: Array<Column<KubernetesStack>> = [
  buildExpandColumn<KubernetesStack>((item) => item.Applications.length > 0),
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
    Cell: ({ value }: CellProps<KubernetesStack, string>) => (
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
    Cell: ({ row: { original: item } }: CellProps<KubernetesStack>) => (
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
