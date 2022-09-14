import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useRef, useState } from 'react';

type DialogModal = {
  readonly openStatus: boolean;
  readonly children: JSX.Element | string;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'fit' | 'scale' | 'full';
  readonly title: string;
  readonly message: string;
  readonly closeModal: (event: boolean) => void;

  readonly className?: string;
};

export default function DialogModal({
  openStatus,
  title,
  message,
  children,
  closeModal,
  size = 'sm',
  className
}: DialogModal) {
  // const [isOpen, setIsOpen] = useState(false);

  // useEffect(() => {
  //   setIsOpen(openStatus);
  // }, [openStatus]);

  let completeButtonRef = useRef(null);

  const sizes = {
    sm: 'max-w-md w-full',
    md: '',
    lg: 'px-4 py-2 text-sm rounded-md',
    xl: 'px-4 py-2 text-base rounded-md',
    xxl: 'max-w-full',
    fit: 'max-w-fit',
    scale: 'md:w-3/4 max-w-5xl w-full',
    full: 'w-full'
  };

  return (
    <>
      <Transition appear show={openStatus} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10 "
          onClose={(e) => closeModal(false)}
          initialFocus={completeButtonRef}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <div className="fixed inset-0 bg-primary-blue-600 bg-opacity-75 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95">
                <Dialog.Panel
                  className={`  ${sizes[size]} transform  rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all`}>
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {title}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">{message}</p>
                  </div>

                  <div className="mt-4">{children}</div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
