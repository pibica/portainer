import _ from 'lodash';
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { DockerContainer } from '@/react/docker/containers/types';

import { created } from './created';
import { host } from './host';
import { image } from './image';
import { ip } from './ip';
import { name } from './name';
import { ownership } from './ownership';
import { ports } from './ports';
import { quickActions } from './quick-actions';
import { stack } from './stack';
import { state } from './state';
import { gpus } from './gpus';

export function useColumns(
  isHostColumnVisible: boolean,
  isGPUsColumnVisible: boolean
): Array<ColumnDef<DockerContainer, unknown>> {
  return useMemo(
    () =>
      _.compact([
        name,
        state,
        quickActions,
        stack,
        image,
        created,
        ip,
        isHostColumnVisible && host,
        isGPUsColumnVisible && gpus,
        ports,
        ownership,
      ]),
    [isHostColumnVisible, isGPUsColumnVisible]
  ) as Array<ColumnDef<DockerContainer, unknown>>;
}
