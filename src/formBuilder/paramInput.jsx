import React, { useState } from 'react';
import { Badge } from '@chakra-ui/react';
import { Button } from '@chakra-ui/button';
import { Flex } from '@chakra-ui/layout';

import GenericInput from './genericInput';
import GenericCheck from './genericCheck';

const getPlaceholder = type => {
  if (type.includes('int')) {
    return '0';
  }
  if (type.includes('fixed')) {
    return '0.0';
  }
  if (type === 'address' || type === 'function' || type.includes('bytes')) {
    return '0x';
  }

  return 'Text';
};

const ParamInput = props => {
  const {
    name,
    baseType,
    arrayChildren,
    arrayLength,
    components,
    label,
    type,
    ...rest
  } = props;
  const { watch, setValue } = props.localForm;

  const wrappedLabel =
    typeof label === 'string' ? (
      <>
        {label}
        <Badge variant='subtle' verticalAlign='baseline' ml='2'>
          {type}
        </Badge>
      </>
    ) : (
      label
    );

  switch (baseType) {
    case 'array':
      return (
        <ArrayParamInput
          {...rest}
          name={name}
          arrayChildren={arrayChildren}
          arrayLength={arrayLength}
          label={wrappedLabel}
        />
      );
    case 'tuple':
      return (
        <>
          {components.map((componentType, index) => (
            <ParamInput
              key={index}
              {...rest}
              {...componentType}
              name={`${name}.${componentType.name || `__unnamed_${index}`}`}
              label={`${label}${
                componentType.name ? `.${componentType.name}` : `[${index}]`
              }`}
            />
          ))}
        </>
      );
    case 'bool':
      return (
        <GenericCheck
          {...props}
          placeholder={getPlaceholder(baseType)}
          label={wrappedLabel}
          isChecked={watch(name)}
          onChange={ev => setValue(name, ev.target.checked)}
        />
      );
    default:
      return (
        <GenericInput
          {...props}
          placeholder={getPlaceholder(baseType)}
          label={wrappedLabel}
        />
      );
  }
};

export default ParamInput;

const ArrayParamInput = props => {
  const { name, arrayChildren, arrayLength, ...rest } = props;
  const [inputs, setInputs] = useState([
    {
      name: `${name}[0]`,
      htmlFor: `${name}[0]`,
    },
  ]);

  const addCopy = () => {
    const nextIndex = inputs.length;
    const nextInput = {
      name: `${name}[${nextIndex}]`,
      htmlFor: `${name}[${nextIndex}]`,
    };
    setInputs([...inputs, nextInput]);
  };

  const canAddMore = arrayLength === -1 || inputs.length < arrayLength;
  const getButton = index =>
    index + 1 === inputs.length && canAddMore ? (
      <Button
        onClick={addCopy}
        aria-label='add item'
        background='transparent'
        p='0'
      >
        +
      </Button>
    ) : null;

  return (
    <Flex flexDirection='column' maxH='200px' overflow='auto'>
      {inputs?.map((input, index) => {
        return (
          <ParamInput
            key={index}
            {...rest}
            {...arrayChildren}
            {...input}
            label={index === 0 ? props.label : null}
            append={getButton(index)}
            w='100%'
          />
        );
      })}
    </Flex>
  );
};
