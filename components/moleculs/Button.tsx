import { SpinnerButton } from 'components/atoms/SpinnerButton';

import React from 'react';

type Button = {
  readonly isActive?: boolean;
  readonly children: JSX.Element | string;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  readonly type?: 'button' | 'submit';
  readonly onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly typeBtn?: 'support' | 'warning' | 'default' | 'isActive' | 'submit';
  readonly disabled?: boolean;
  readonly isSubmitting?: boolean;
  readonly className?: string;
};

function Button({
  size,
  children,
  type = 'button',
  onClick,
  typeBtn = 'default',
  disabled = false,
  isSubmitting = false,
  className
}: Button): JSX.Element {
  const sizes = {
    xs: 'px-1.5 py-1 text-xs rounded',
    sm: 'px-2.5 py-1.5 text-xs rounded',
    md: 'px-3 py-2 text-sm leading-4 rounded-md',
    lg: 'px-4 py-2 text-sm rounded-md',
    xl: 'px-4 py-2 text-base rounded-md',
    xxl: 'px-6 py-3 text-base rounded-md'
  };

  const colors = {
    isActive: 'text-white bg-primary-blue-400 hover:bg-primary-blue-500 focus:ring-indigo-500',
    default: 'text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500 border border-gray-300',
    support:
      'text-neutrals-blueGray-400 bg-neutrals-blueGray-50 focus:ring-neutrals-blueGray-100 focus:text-neutrals-blueGray-500 focus:text-neutrals-blueGray-600 hover:bg-neutrals-blueGray-100',
    warning:
      'text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
    disabled: 'text-gray-300 bg-gray-200 border border-gray-200 focus:ring-0 shadow-none',
    submit:
      'bg-green-100 text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 '
  };

  const sizeBtn = size ? sizes[size] : sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isSubmitting}
      className={`inline-flex items-center border  border-transparent font-medium  shadow-sm  focus:outline-none focus:ring-2 focus:ring-offset-2 ${sizeBtn} ${
        disabled ? colors['disabled'] : colors[typeBtn]
      } ${disabled && 'cursor-not-allowed'} ${className}`}>
      {isSubmitting ? (
        <>
          <SpinnerButton />
          <span className="ml-2">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
