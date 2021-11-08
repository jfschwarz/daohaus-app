import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import {
  Button,
  Box,
  IconButton,
  Tag,
  TagLabel,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { RiErrorWarningLine, RiCheckboxCircleLine } from 'react-icons/ri';
import {
  createTransaction,
  TransactionType,
  useMultiSendContext,
  useContractCall,
  ProvideMultiSendContext,
  isValid,
  encodeSingle,
} from 'react-multisend';

import { getAddress } from '@ethersproject/address';
import { useDao } from '../contexts/DaoContext';
import ContentBox from '../components/ContentBox';
import FieldWrapper from './fieldWrapper';
import GenericSelect from './genericSelect';
import SafePaymentInput from './safePaymentInput';
import AddressInput from './addressInput';
import SafeCollectibleSelect from './safeCollectibleSelect';
import GenericInput from './genericInput';
import SimpleAbiInput from './simpleAbiInput';
import ParamInput from './paramInput';

const defaultTransactionType = TransactionType.transferFunds;

const getEncodingErrorMessage = value => {
  if (value.to) {
    try {
      getAddress(value.to);
    } catch (err) {
      return `${value.to} is not a valid address`;
    }

    try {
      encodeSingle(value);
    } catch (err) {
      if (value.type === 'callContract') {
        return err.message;
      }
    }
  }

  return 'Fill all required fields';
};

const getBlockExplorerApiKey = chainId => {
  switch (chainId) {
    case '0x89': {
      return process.env.REACT_APP_POLYGONSCAN_KEY;
    }
    case '0x64': {
      return undefined;
    }
    default: {
      return process.env.REACT_APP_ETHERSCAN_KEY;
    }
  }
};

const SafeMultiSendBatch = props => {
  const {
    localForm,
    htmlFor,
    label,
    name,
    required,
    disabled,
    containerProps,
    mb,
    error,
  } = props;

  const { daochain } = useParams();
  const { daoOverview } = useDao();

  const { fields, append, remove } = useFieldArray({
    name,
    keyName: 'key',
    control: localForm.control,
  });

  const { setValue } = localForm;

  const selectedMinion = localForm.watch('selectedMinion');

  useEffect(() => {
    setValue(name, []);
  }, [selectedMinion]);

  const handleAdd = () => {
    append(createTransaction(defaultTransactionType));
  };

  const replace = (index, newValue) => {
    localForm.setValue(`${name}[${index}]`, newValue);
  };

  const minion =
    daoOverview.minions &&
    daoOverview.minions.find(m => m.minionAddress === selectedMinion);

  return (
    <ProvideMultiSendContext
      safeAddress={minion?.safeAddress}
      network={`${parseInt(daochain)}`}
      blockExplorerApiKey={getBlockExplorerApiKey(daochain)}
    >
      <FieldWrapper
        {...{
          label,
          htmlFor,
          name,
          required,
          disabled,
          containerProps,
          mb,
          error,
        }}
        helperText={!selectedMinion && 'Please select a minion'}
      >
        {fields.map((field, index) => (
          <Transaction
            key={field.key}
            index={index}
            remove={remove}
            replace={replace}
            localForm={localForm}
            namePrefix={`${name}[${index}]`}
          />
        ))}
        <Button
          variant='outline'
          isDisabled={!selectedMinion}
          onClick={handleAdd}
        >
          Add transaction
        </Button>
      </FieldWrapper>
    </ProvideMultiSendContext>
  );
};

export default SafeMultiSendBatch;

const TransactionHeader = ({
  localForm,
  namePrefix,
  index,
  onClick,
  onRemove,
}) => {
  const { watch } = localForm;
  const value = watch(namePrefix);

  let title;
  switch (value.type) {
    case TransactionType.callContract:
      title = 'Call contract';
      break;
    case TransactionType.transferFunds:
      title = 'Transfer funds';
      break;
    case TransactionType.transferCollectible:
      title = 'Transfer collectible';
      break;
    case TransactionType.raw:
      title = 'Raw transaction';
      break;
    default:
      throw new Error('unexpected type');
  }

  return (
    <div style={{ position: 'relative' }}>
      <Tag
        size='lg'
        colorScheme='red'
        borderRadius='full'
        cursor='pointer'
        onClick={onClick}
      >
        <Box fontFamily='mono' mr='2' width='20px'>
          {index}
        </Box>
        <TagLabel>{title}</TagLabel>
      </Tag>
      {!isValid(value) && (
        <Tooltip
          shouldWrapChildren
          placement='right'
          label={getEncodingErrorMessage(value)}
        >
          <Icon as={RiErrorWarningLine} color='red.500' ml={2} mt={1} />
        </Tooltip>
      )}
      {isValid(value) && (
        <Icon as={RiCheckboxCircleLine} color='green.500' ml={2} mt={1} />
      )}
      <IconButton
        variant='outline'
        size='sm'
        position='absolute'
        top={0}
        right={0}
        aria-label='Remove transaction'
        icon={<FaRegTrashAlt />}
        onClick={onRemove}
      />
    </div>
  );
};

const TX_TYPE_OPTIONS = [
  { name: 'Transfer funds', value: TransactionType.transferFunds },
  { name: 'Transfer collectible', value: TransactionType.transferCollectible },
  { name: 'Call contract', value: TransactionType.callContract },
  { name: 'Raw transaction', value: TransactionType.raw },
];

export const Transaction = ({
  index,
  replace,
  remove,
  localForm,
  namePrefix,
  classNames = {},
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ContentBox mb='2' mx='-6' p='6'>
      <TransactionHeader
        localForm={localForm}
        namePrefix={namePrefix}
        index={index}
        onRemove={() => {
          remove(index);
        }}
        onClick={() => setCollapsed(!collapsed)}
        classNames={classNames}
      />
      {!collapsed && (
        <>
          <GenericSelect
            options={TX_TYPE_OPTIONS}
            name={`${namePrefix}.type`}
            localForm={localForm}
            onChange={ev => {
              replace(index, createTransaction(ev.target.value));
            }}
          />
          <TransactionBody
            namePrefix={namePrefix}
            localForm={localForm}
            // onChange={handleChange}
          />
        </>
      )}
    </ContentBox>
  );
};

const TransactionBody = ({ localForm, namePrefix }) => {
  const type = localForm.watch(`${namePrefix}.type`);
  const { network, blockExplorerApiKey } = useMultiSendContext();
  switch (type) {
    case TransactionType.transferFunds:
      return <TransferFunds localForm={localForm} namePrefix={namePrefix} />;
    case TransactionType.transferCollectible:
      return (
        <TransferCollectible localForm={localForm} namePrefix={namePrefix} />
      );
    case TransactionType.callContract:
      return (
        <CallContract
          localForm={localForm}
          namePrefix={namePrefix}
          network={network}
          blockExplorerApiKey={blockExplorerApiKey}
        />
      );
    // case TransactionType.raw:
    //   return <RawTransaction localForm={localForm} namePrefix={namePrefix} />;
    default:
      throw new Error('unexpected type');
  }
};

const TransferFunds = ({ namePrefix, localForm }) => (
  <>
    <AddressInput
      label='Recipient'
      required
      placeholder='0x'
      name={`${namePrefix}.to`}
      localForm={localForm}
    />
    <SafePaymentInput
      label='Funds'
      required
      placeholder='0.0'
      amountName={`${namePrefix}.amount`}
      tokenName={`${namePrefix}.token`}
      decimalsName={`${namePrefix}.decimals`}
      localForm={localForm}
    />
  </>
);

const TransferCollectible = ({ namePrefix, localForm }) => {
  const { safeAddress } = useMultiSendContext();
  const { setValue, watch } = localForm;
  const address = watch(`${namePrefix}.address`);
  const tokenId = watch(`${namePrefix}.tokenId`);
  return (
    <>
      <AddressInput
        label='Recipient'
        required
        placeholder='0x'
        name={`${namePrefix}.to`}
        localForm={localForm}
      />
      <SafeCollectibleSelect
        label='Collectible'
        required
        value={{ address, tokenId }}
        onChange={({ address, tokenId }) => {
          setValue(`${namePrefix}.address`, address);
          setValue(`${namePrefix}.tokenId`, tokenId);
          setValue(`${namePrefix}.from`, safeAddress);
        }}
      />
    </>
  );
};

const CallContract = ({
  namePrefix,
  localForm,
  network,
  blockExplorerApiKey,
}) => {
  const { watch, setValue } = localForm;
  const value = watch(namePrefix);
  const onChange = useCallback(
    newValue => {
      setValue(namePrefix, newValue);
    },
    [namePrefix, setValue],
  );

  const { functions, payable, inputs, loading, fetchSuccess } = useContractCall(
    {
      value,
      onChange,
      network,
      blockExplorerApiKey,
    },
  );

  const options = useMemo(
    () => functions.map(func => ({ value: func.signature, name: func.name })),
    [functions],
  );

  return (
    <>
      <AddressInput
        label='Contract address'
        required
        placeholder='0x'
        name={`${namePrefix}.to`}
        localForm={localForm}
      />
      {!loading && !fetchSuccess && (
        <SimpleAbiInput
          label='Contract interface ABI'
          name={`${namePrefix}.abi`}
          localForm={localForm}
        />
      )}
      <GenericSelect
        localForm={localForm}
        name={`${namePrefix}.functionSignature`}
        label='Function'
        options={options}
        disabled={loading || !value.abi}
      />
      {payable && (
        <GenericInput
          type='number'
          name={`${namePrefix}.value`}
          label='Value (wei)'
          localForm={localForm}
        />
      )}
      {inputs.map(input => (
        <ParamInput
          key={input.name}
          {...input}
          name={`${namePrefix}.inputValues.${input.name}`}
          label={input.name}
          localForm={localForm}
        />
      ))}
    </>
  );
};
