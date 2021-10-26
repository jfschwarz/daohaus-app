import React, { useMemo } from 'react';
import { Select } from '@chakra-ui/react';
import { useSafeCollectibles } from 'react-multisend';
import FieldWrapper from './fieldWrapper';

const groupByAddress = collectibles => {
  const map = new Map();
  collectibles.forEach(collectible => {
    const key = collectible.address;
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [collectible]);
    } else {
      collection.push(collectible);
    }
  });
  return [...map.values()];
};

const serializeValue = value => `${value.address}/${value.tokenId}`;
const parseValue = serialized => {
  const [address, tokenId] = serialized.split('/');
  return { address, tokenId };
};

const SafeCollectibleSelect = props => {
  const {
    htmlFor,
    placeholder = '---',
    name,
    disabled,
    value,
    onChange,
    containerProps,
    mb,
  } = props;
  const [collectibles] = useSafeCollectibles();
  const groups = useMemo(() => groupByAddress(collectibles), [collectibles]);

  return (
    <FieldWrapper {...props} containerProps={containerProps} mb={mb}>
      <Select
        placeholder={placeholder}
        id={htmlFor}
        name={name}
        disabled={disabled}
        value={serializeValue(value)}
        onChange={ev => {
          onChange(parseValue(ev.target.value));
        }}
      >
        {groups.map(group => (
          <optgroup key={group[0].address} label={group[0].tokenName}>
            {group.map(collectible => (
              <option
                key={collectible.id}
                value={serializeValue({
                  address: collectible.address,
                  tokenId: collectible.id,
                })}
              >
                {collectible.name}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
    </FieldWrapper>
  );
};

export default SafeCollectibleSelect;
