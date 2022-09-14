import { ReactNode } from 'react';
import { MainProps } from '../types';

export const Main = ({ children }: MainProps) => {
  return <main className="h-screen flex overflow-hidden bg-gray-100">{children}</main>;
};
