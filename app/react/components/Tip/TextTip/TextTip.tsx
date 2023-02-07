import { PropsWithChildren } from 'react';
import { AlertCircle } from 'lucide-react';
import clsx from 'clsx';

import { Icon, IconMode } from '@@/Icon';

type Color = 'orange' | 'blue';

export interface Props {
  icon?: React.ReactNode;
  color?: Color;
  inline?: boolean;
}

export function TextTip({
  color = 'orange',
  icon = AlertCircle,
  inline = true,
  children,
}: PropsWithChildren<Props>) {
  return (
    <p
      className={clsx(
        'small items-center gap-1',
        inline ? 'inline-flex' : 'flex'
      )}
    >
      <Icon icon={icon} mode={getMode(color)} className="shrink-0" />

      <span className="text-muted">{children}</span>
    </p>
  );
}

function getMode(color: Color): IconMode {
  switch (color) {
    case 'blue':
      return 'primary';
    case 'orange':
    default:
      return 'warning';
  }
}
