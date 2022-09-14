import { ReactNode } from 'react';

export interface MainProps {
  children: ReactNode;
  title?: string;
}

export interface ChildrenProps {
  children: React.ReactElement;
}

export type Role =
  | 'PROCESS_MANAGER'
  | 'SUBCONTRACTOR_ADMIN'
  | 'SUBCONTRACTOR_WORKER'
  | 'CLIENT_MANAGER'
  | 'CLIENT_WORKER';

export type TaskStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'FINISHED'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'CANCELED'
  | 'ARCHIVED';
