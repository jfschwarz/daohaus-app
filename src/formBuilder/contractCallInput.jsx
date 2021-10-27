import { React } from 'react';
import { useContractCall } from 'react-multisend';

const ContractCallInput = ({
  abiName,
  functionName,
  valueName,
  inputsName,
  localForm,
}) => {
  const { functions, payable, inputs, loading } = useContractCall(props);

  return (
    <fieldset>
      <label>
        <span>ABI</span>
        <AbiInput
          value={value.abi}
          onChange={ev => onChange({ ...value, abi: ev.target.value })}
          format={AbiFormat.FULL}
        />
      </label>
      <label>
        <span>Method</span>
        <select
          disabled={loading}
          value={value.functionSignature}
          onChange={ev =>
            onChange({
              ...value,
              functionSignature: ev.target.value,
              inputValues: {},
            })
          }
        >
          {functions.map(func => (
            <option key={func.signature} value={func.signature}>
              {func.name}
            </option>
          ))}
        </select>
      </label>
      {payable && (
        <label>
          <span>Value (wei)</span>
          <input
            type='number'
            value={value.value}
            onChange={ev => onChange({ ...value, value: ev.target.value })}
          />
        </label>
      )}
      {inputs.length > 0 ? (
        <fieldset>
          {inputs.map(input => (
            <label key={input.name}>
              {input.name} <i>{input.type}</i>
              <input
                type='text'
                value={`${input.value || ''}`}
                onChange={ev =>
                  onChange({
                    ...value,
                    inputValues: {
                      ...value.inputValues,
                      [input.name]: ev.target.value,
                    },
                  })
                }
              />
            </label>
          ))}
        </fieldset>
      ) : null}
    </fieldset>
  );
};

export default ContractCallInput;
