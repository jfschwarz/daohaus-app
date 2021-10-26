import React, { useMemo } from 'react';
import { useSafeBalances } from 'react-multisend';
import { utils } from 'ethers';

import InputSelect from './inputSelect';
import ModButton from './modButton';

const ETH_DECIMALS = 18;

const SafePaymentInput = props => {
  const { amountName, tokenName, decimalsName, localForm } = props;
  const { setValue, watch } = localForm || {};
  const [balances] = useSafeBalances();

  const token = watch(tokenName) || '';

  const balance = balances.find(b => b.tokenAddress === (token || null));
  const decimals = balance?.token?.decimals || ETH_DECIMALS;

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
      name={amountName}
      selectName={tokenName}
      selectChange={ev => {
        const balance = balances.find(
          b => b.tokenAddress === (ev.target.value || null),
        );
        if (balance) {
          setValue(decimalsName, balance?.token?.decimals || ETH_DECIMALS);
        }
      }}
      options={options}
      btn={
        maxAmount !== null && (
          <ModButton
            text={`Max: ${maxAmount}`}
            fn={() => setValue(amountName, maxAmount)}
          />
        )
      }
    />
  );
};

export default SafePaymentInput;
