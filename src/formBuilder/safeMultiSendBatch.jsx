import React, { useEffect, useState } from 'react';
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
  ProvideMultiSendContext,
  isValid,
} from 'react-multisend';

import { useDao } from '../contexts/DaoContext';
import ContentBox from '../components/ContentBox';
import FieldWrapper from './fieldWrapper';
import GenericSelect from './genericSelect';
import SafePaymentInput from './safePaymentInput';
import AddressInput from './addressInput';
import SafeCollectibleSelect from './safeCollectibleSelect';

const defaultTransactionType = TransactionType.transferFunds;

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
        {...{ label, htmlFor, name, required, disabled, containerProps, mb }}
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
  console.log({ value });
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
          label='There are some missing or invalid inputs'
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
    <ContentBox mb='2'>
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
    // case TransactionType.callContract:
    //   return (
    //     <CallContract
    //       value={value}
    //       onChange={onChange}
    //       network={network}
    //       blockExplorerApiKey={blockExplorerApiKey}
    //     />
    //   );
    // case TransactionType.raw:
    //   return <RawTransaction value={value} onChange={onChange} />;
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
      placeholder='0'
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
