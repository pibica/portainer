import { BoxSelector } from '@@/BoxSelector';
import { FormSection } from '@@/form-components/FormSection';

import { environmentTypes } from './environment-types';

export type EnvironmentSelectorValue = typeof environmentTypes[number]['id'];

interface Props {
  value: EnvironmentSelectorValue[];
  onChange(value: EnvironmentSelectorValue[]): void;
}

export function EnvironmentSelector({ value, onChange }: Props) {
  return (
    <div className="form-horizontal">
      <FormSection title="Select your environment(s)">
        <p className="text-muted small">
          You can onboard different types of environments, select all that
          apply.
        </p>

        <BoxSelector
          options={environmentTypes}
          isMulti
          value={value}
          onChange={onChange}
          radioName="type-selector"
        />
      </FormSection>
    </div>
  );
}
