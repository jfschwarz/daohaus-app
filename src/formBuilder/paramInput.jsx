import React, { useState } from 'react';
import { Button } from '@chakra-ui/button';
import { Flex } from '@chakra-ui/layout';

import GenericInput from './genericInput';

const ParamInput = props => {
  const { name, paramType, label } = props;

  switch (paramType.baseType) {
    case 'array':
      return (
        <ArrayParamInput
          {...props}
          name={name}
          childrenType={paramType.arrayChildren}
          fixedLength={paramType.arrayLength}
        />
      ); // TODO
    case 'tuple':
      return (
        <>
          {paramType.components.map((componentType, index) => (
            <ParamInput
              {...props}
              key={index}
              name={`${name}.${componentType.name || `__unnamed_${index}`}`}
              paramType={componentType}
              label={`${label}${
                componentType.name ? `.${componentType.name}` : `[${index}]`
              }`}
            />
          ))}
        </>
      );
    default:
      return <GenericInput name={name} {...props} />;
  }
};

export default ParamInput;

const ArrayParamInput = props => {
  const { name, childrenType, fixedLength, ...rest } = props;
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

  const canAddMore = !fixedLength || inputs.length < fixedLength;
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
            {...rest}
            paramType={childrenType}
            {...input}
            key={index}
            label={index === 0 ? props.label : null}
            append={getButton(index)}
            w='100%'
          />
        );
      })}
    </Flex>
  );
};
