import { capitalize } from 'lib/utils/capitalize';
import { useEffect, useReducer } from 'react';

type InputType = {
  label: string;
  required: boolean;
  register?: (label: string, arg1: object) => object;
  className: string;
  mainName: string;
  error: string;
  type: string;
  addLabel: boolean;
  isTextarea: boolean;
};

const Input = ({
  label,
  required = false,
  register,
  className,
  mainName,
  error,
  type = 'text',
  addLabel = true,
  isTextarea = false,
  ...props
}: InputType): JSX.Element => {
  const InputType = isTextarea ? 'textarea' : 'input';
  return (
    <div>
      {addLabel !== false && (
        <label
          htmlFor={label}
          className=" text-sm font-medium text-primary-blue-400 w-full flex justify-between">
          <span>{mainName || capitalize(label)} </span>{' '}
          <span className="text-red-700">{error && 'Pole wymagane!'}</span>
        </label>
      )}

      <InputType
        type={type}
        id={label}
        className={` focus:ring-primary-blue-200 focus:border-primary-blue-200 block w-full sm:text-sm shadow-sm border-neutral-200 rounded-md ${className}`}
        // placeholder="you@example.com"
        {...(register && register(label, { required }))}
        {...props}
      />
    </div>
  );
};

export default Input;
