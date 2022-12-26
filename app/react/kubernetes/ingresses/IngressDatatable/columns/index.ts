import { ColumnDef } from '@tanstack/react-table';

import { Ingress } from '../../types';

import { name } from './name';
import { type } from './type';
import { namespace } from './namespace';
import { className } from './className';
import { ingressRules } from './ingressRules';

export const columns = [
  name,
  namespace,
  className,
  type,
  ingressRules,
] as Array<ColumnDef<Ingress>>;
