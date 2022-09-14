/* eslint-disable react/display-name */
import { useAuth } from 'lib/context/auth.context';
import useSession from 'lib/hooks/useSession';
import router from 'next/router';
import React, { useEffect, useContext } from 'react';

const withRole = (allowedRoles) => (WrappedComponent) => (props) => {
  const {
    status,
    user: { role: userRole }
  } = useAuth();

  useEffect(() => {
    if (status === 'unauthorize') {
      Router.push('/permission-denied');
    }
  }, [status]);

  if (userRole.match(allowedRoles)) {
    return <WrappedComponent {...props} />;
  }
  return null;
};

export default withRole;

export const withProcessManagerRole = withRole(['PROCESS_MANAGER']);
export const withClientWorker = withRole(['CLIENT_WORKER']);
export const withAllRoles = withRole([
  'CLIENT_WORKER',
  'PROCESS_MANAGER',
  'CLIENT_MANAGER',
  'SUBCONTRACTOR_ADMIN',
  'SUBCONTRACTOR_WORKER'
]);

//HOC role for function
const withRoleFn = (allowedRoles) => (wrappedFn) => (props) => {
  const {
    status,
    user: { role: userRole }
  } = useAuth();

  if (userRole.match(allowedRoles)) {
    return wrappedFn(props);
  }
  return null;
};

export const withProcessManagerRoleFn = withRoleFn(['PROCESS_MANAGER']);
export const withClientWorkerFn = withRoleFn(['CLIENT_WORKER']);
export const withAllRolesFn = withRoleFn([
  'CLIENT_WORKER',
  'PROCESS_MANAGER',
  'CLIENT_MANAGER',
  'SUBCONTRACTOR_ADMIN',
  'SUBCONTRACTOR_WORKER'
]);

//check role
const isAllowRole = (allowedRoles) => (userCheck) => {
  const { role: userRole } = userCheck;

  if (userRole.match(allowedRoles)) {
    return true;
  }
  return false;
};

export const withProcessManagerRoleAllow = isAllowRole(['PROCESS_MANAGER']);
export const withClientWorkerAllow = isAllowRole(['CLIENT_WORKER']);
export const withAllRolesAllow = isAllowRole([
  'CLIENT_WORKER',
  'PROCESS_MANAGER',
  'CLIENT_MANAGER',
  'SUBCONTRACTOR_ADMIN',
  'SUBCONTRACTOR_WORKER'
]);
