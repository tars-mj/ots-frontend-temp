// @ts-nocheck

import Input from 'components/atoms/Input';
import Button from 'components/moleculs/Button';
import { postData } from 'lib/utils/fetch-wrapper';
import Image from 'next/image';
import loginPic from 'asset/pexels-photo-12180544.png';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import DialogModal from 'components/moleculs/DialogModal';
import Router from 'next/router';
import { useAuth } from 'lib/context/auth.context';
import { apiAddress } from 'lib/api-routes/api-address';

type Inputs = {
  email: string;
  password: string;
  submitError: string;
};

const Login = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
    clearErrors
  } = useForm<Inputs>();

  const { status, user, signInInit, signInAccept, signOut } = useAuth();

  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const res = await postData(new URL(`${apiAddress}/auth/login`), data);

    if (!res.success) {
      setError('submitError', { type: 'custom', message: 'custom message' });
      reset();
      clearErrors();
      openModal();
    } else {
      const { firstName, lastName, email, role } = res;
      signInAccept({ firstName, lastName, email, role });
      Router.push('/');
      reset();
    }
  };

  return (
    <>
      <div className="w-full h-full overflow-hidden flex bg-primary-blue-50 ">
        <div className="lg:w-1/2 flex justify-center items-center h-screen w-full">
          <div className="mx-auto flex flex-col items-start justify-between ">
            <span className="text-2xl font-light w-full text-center text-primary-blue-500">
              Login to your account
            </span>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-4 bg-white shadow-md h-80 sm:rounded-lg text-left p-16 flex flex-col  items-start justify-between">
                <Input
                  className="w-80"
                  mainName={undefined}
                  label="email"
                  register={register}
                  required
                  error={errors.email}
                />

                <Input
                  className="w-80"
                  mainName={undefined}
                  type="password"
                  label="password"
                  register={register}
                  required
                  error={errors.password}
                />
                <Button size="xl" type="submit" typeBtn="isActive" isSubmitting={isSubmitting}>
                  Zaloguj
                </Button>
              </div>
            </form>
          </div>
        </div>
        <div className="hidden lg:flex basis-1/2  h-screen ">
          <Image src={loginPic} alt="login" objectFit="cover" />
        </div>
      </div>
      {isOpen && (
        <DialogModal
          openStatus={isOpen}
          title={'Błąd autoryzacji'}
          message={'Sprawdz, czy poprawnie wpisujesz login i hasło'}
          closeModal={closeModal}>
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-primary-purple-50 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-primary-purple-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={closeModal}>
            Ok!
          </button>
        </DialogModal>
      )}
    </>
  );
};

export default Login;
