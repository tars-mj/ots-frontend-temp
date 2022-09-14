import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { ChildrenProps } from '../../types/index';
import Cookies from 'js-cookie';

// actions
// const setLoading =
//   (dispatch) =>
//   ({ isLoading }: any) => {
//     console.log('KURWA');
//     dispatch({ type: SET_LOADING, payload: { isLoading } });
//   };

// const setError =
//   (dispatch) =>
//   ({ isError }: any) => {
//     dispatch({ type: SET_ERROR_ID, payload: { isError } });
//   };

const SIGN_IN_INIT = 'SIGN_IN_INIT';
const SIGN_IN_ACCEPT = 'SIGN_IN_ACCEPT';
const SIGN_OUT = 'SIGN_OUT';

interface State {
  status: 'loading' | 'authorize' | 'unauthorize';
  user: { email: string; role: string; firstName: string; lastName: string };
}

interface ActionsType {
  signOut: () => void;
}

// Reducer
const authReducer = (state: State, action: any) => {
  switch (action.type) {
    case SIGN_IN_INIT:
      return { ...state, status: 'loading' };
    case SIGN_IN_ACCEPT:
      return { ...state, status: 'authorize', user: { ...action.payload } };
    case SIGN_OUT:
      return {
        ...state,
        status: 'unauthorize',
        user: { email: '', role: '', firstName: '', lastName: '' }
      };
    default:
      throw new Error();
  }
};

// Initial state
const initialState: State = {
  status: 'unauthorize',
  user: {
    email: '',
    role: '',
    firstName: '',
    lastName: ''
  }
};

type StateWithActions = State & ActionsType;

// Provider
const AuthContext = createContext(initialState);

export const SessionProvider = ({ children }: ChildrenProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const signInInit = () => {
    dispatch({ type: SIGN_IN_INIT });
  };

  const signInAccept = ({ email, role, firstName, lastName }) => {
    dispatch({ type: SIGN_IN_ACCEPT, payload: { email, role, firstName, lastName } });
  };

  const signOut = () => {
    dispatch({ type: SIGN_OUT });
  };

  const value = {
    status: state.status,
    user: state.user,
    signInInit,
    signInAccept,
    signOut
  };

  useEffect(() => {
    const ots = Cookies.get('ots');
    const dataAuth = ots && JSON.parse(ots);

    if (dataAuth) {
      signInAccept(dataAuth);
    }

    // if (!document.cookie.includes('ots')) {
    //   signOut();
    // } else {
    //   signInAccept(dataAuth);
    // }

    // const timer = setInterval(() => {
    //   if (!document.cookie.includes('ots')) {
    //     signOut();
    //   } else {
    //     signInAccept(dataAuth);
    //   }
    // }, 1000);
    // return () => clearInterval(timer);
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// hook
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within AuthContext');
  }

  return context;
};
