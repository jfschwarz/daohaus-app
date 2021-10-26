import React, { useMemo } from 'react';
import { useSafeBalances } from 'react-multisend';
import { utils } from 'ethers';

import InputSelect from './inputSelect';
import ModButton from './modButton';

const SafePaymentInput = props => {
  const { name, selectName, localForm } = props;
  const { setValue, watch } = localForm || {};
  const [balances] = useSafeBalances();

  const token = watch(selectName) || '';

  const balance = balances.find(b => b.tokenAddress === (token || null));
  const decimals = balance?.token?.decimals || '18';

  const options = useMemo(
    () =>
      balances.map(b => ({
        value: b.tokenAddress || '',
        name: b.token ? b.token.symbol : 'ETH',
      })),
    [balances],
  );

  const maxAmount = balance
    ? utils.formatUnits(balance.balance, decimals)
    : null;

  return (
    <InputSelect
      {...props}
      options={options}
      btn={
        maxAmount !== null && (
          <ModButton
            text={`Max: ${maxAmount}`}
            fn={() => setValue(name, maxAmount)}
          />
        )
      }
    />
  );
};

export default SafePaymentInput;
