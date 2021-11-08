import React from 'react';
import { Textarea } from '@chakra-ui/react';
import { Interface } from '@ethersproject/abi';

import FieldWrapper from './fieldWrapper';

const formatAbi = value => {
  if (!value) return '';
  const abiInterface = new Interface(value);
  const formatted = abiInterface.format('full');
  if (typeof formatted === 'string') return formatted;
  return formatted.join('\n');
};

const parseAbi = value => {
  if (!value) return '';

  let input;
  try {
    // try if the value is JSON format
    input = JSON.parse(value);
  } catch (e) {
    // it's not JSON, so maybe it's human readable format
    input = value.split('\n');
  }

  try {
    const abiInterface = new Interface(input);
    return abiInterface.format('json');
  } catch (e) {
    return '';
  }
};

const SimpleAbiInput = props => {
  const { localForm, name, htmlFor, placeholder, h, disabled } = props;
  const { setValue, watch } = localForm;
  const value = watch(name);

  return (
    <FieldWrapper {...props}>
      <Textarea
        id={htmlFor}
        name={name}
        placeholder={placeholder}
        h={h}
        disabled={disabled}
        value={formatAbi(value)}
        onChange={ev => setValue(name, parseAbi(ev.target.value))}
      />
    </FieldWrapper>
  );
};

export default SimpleAbiInput;
