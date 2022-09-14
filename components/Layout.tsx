import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  MenuIcon,
  UserIcon,
  ViewGridIcon,
  XIcon,
  UserGroupIcon,
  CogIcon,
  ChevronLeftIcon
} from '@heroicons/react/outline';
import { useState, Fragment, useEffect } from 'react';
import { MainProps } from '../types';
import { classNames } from '../lib/utils/class-names';
import { Logo } from './Logo';
import DialogModal from 'components/moleculs/DialogModal';
import { useAuth } from 'lib/context/auth.context';
import { useRouter } from 'next/router';

import { getData } from '../lib/utils/fetch-wrapper';
import { apiAddress } from 'lib/api-routes/api-address';

// import styles from '../styles/Home.module.css'

{
  /* <div className={styles.container}> */
}

const roles = [
  'PROCESS_MANAGER',
  'SUBCONTRACTOR_ADMIN',
  'SUBCONTRACTOR_WORKER',
  'CLIENT_MANAGER',
  'CLIENT_WORKER'
];

const draftNavigation = [
  {
    name: 'Projekty',
    href: '/client-projects',
    icon: HomeIcon,
    current: false,
    role: ['CLIENT_MANAGER', 'CLIENT_WORKER']
  },
  {
    name: 'Projekty',
    href: '/projects',
    icon: ViewGridIcon,
    current: false,
    role: ['PROCESS_MANAGER']
  },
  {
    name: 'Klienci',
    href: '/clients',
    icon: UserGroupIcon,
    current: false,
    role: ['PROCESS_MANAGER']
  },
  // {
  //   name: 'Raporty',
  //   href: '/reports',
  //   icon: DocumentReportIcon,
  //   current: false,
  //   role: ['PROCESS_MANAGER', 'CLIENT_MANAGER']
  // },
  {
    name: 'Uzytkownicy',
    href: '/users',
    icon: UserIcon,
    current: false,
    role: ['PROCESS_MANAGER', 'CLIENT_MANAGER', 'SUBCONTRACTOR_ADMIN']
  },
  // {
  //   name: 'Ustawienia',
  //   href: '/settings',
  //   icon: CogIcon,
  //   current: false,
  //   role: ['PROCESS_MANAGER', 'CLIENT_MANAGER']
  // },
  {
    name: 'Lokalizacje',
    href: '/localizations',
    icon: CogIcon,
    current: false,
    role: ['SUBCONTRACTOR_WORKER', 'SUBCONTRACTOR_ADMIN']
  }
];

type Navigation = { name: string; href: string; icon: JSX.Element; current: boolean; role: [] };

const Layout = ({ children, title }: MainProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // @ts-ignore
  const { status, user, signOut } = useAuth();
  const [navigation, setNavigation] = useState<Navigation[]>();
  const router = useRouter();

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const signOutFromApp = async () => {
    const res = await getData(new URL(`${apiAddress}/auth/logout`));
    signOut();
    router.push('/login');
  };

  // useEffect(() => {
  //   const ots = Cookies.get('ots');
  //   const dataAuth = ots && JSON.parse(ots);
  //   if (!dataAuth) {
  //     router.push('/login');
  //   }
  // }, [router, status]);

  useEffect(() => {
    const nav = draftNavigation.filter((n) => n.role.includes(user.role));

    // @ts-ignore
    setNavigation(nav);
  }, [user]);

  if (status === 'unauthorize') {
    return <div></div>;
  }

  return (
    <div className="h-screen flex overflow-hidde">
      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileMenuOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full">
              <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-white focus:outline-none">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0">
                  <div className="absolute top-0 right-0 -mr-12 pt-4">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setMobileMenuOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="pt-5 pb-4">
                  <div className="flex-shrink-0 flex items-center px-4">
                    <div>
                      <Logo color="#2333A8" />
                    </div>
                  </div>
                  <nav aria-label="Sidebar" className="mt-5">
                    <div className="px-2 space-y-1">
                      {navigation &&
                        navigation.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            className="group p-2 rounded-md flex items-center text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                            <item.icon
                              className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500"
                              aria-hidden="true"
                            />

                            {item.name}
                          </a>
                        ))}
                    </div>
                  </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                  <a
                    href="#"
                    className="flex-shrink-0 group block"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openModal();
                    }}>
                    <div className="flex items-center">
                      <div>
                        <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-500">
                          <span className="font-medium leading-none text-white">
                            {user?.firstName[0] + user?.lastName[0]}
                          </span>
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                          {`${user?.firstName} ${user?.lastName}`}
                        </p>
                        <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                          Ustawienia konta
                        </p>
                      </div>
                    </div>
                  </a>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* Force sidebar to shrink to fit close icon */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-28">
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto bg-primary-blue-500">
            <div className="flex-1">
              <div className="bg-primary-blue-500 py-4 flex items-center justify-center mt-6">
                <Logo />
              </div>
              <nav aria-label="Sidebar" className="flex-1 mt-6 w-full px-2 space-y-1">
                {navigation &&
                  navigation.map((item) => (
                    // <a
                    //   key={item.name}
                    //   href={item.href}
                    //   className="flex items-center p-4 rounded-lg text-indigo-200 hover:bg-primary-blue-600">
                    //   <item.icon className="h-6 w-6" aria-hidden="true" />
                    //   <span className="sr-only">{item.name}</span>
                    // </a>
                    <a
                      key={item.href}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? 'bg-primary-blue-600 text-white'
                          : 'text-primary-blue-50 hover:bg-primary-blue-600 hover:xt-primary-blue-50',
                        'group w-full p-3 rounded-md flex flex-col items-center text-xs font-medium'
                      )}
                      aria-current={item.current ? 'page' : undefined}>
                      <item.icon
                        className={classNames(
                          item.current
                            ? 'text-white'
                            : 'text-primary-blue-200 group-hover:text-white',
                          'h-6 w-6'
                        )}
                        aria-hidden="true"
                      />
                      <span className="mt-2">{item.name}</span>
                    </a>
                  ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex pb-5 mb-4">
              <a
                href="#"
                className="flex-shrink-0 w-full flex items-center justify-center"
                onClick={openModal}>
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-gray-500">
                  <span className="font-medium leading-none text-white">
                    {user?.firstName[0] + user?.lastName[0]}
                  </span>
                </span>
                <div className="sr-only">
                  <p>{`${user?.firstName} ${user?.lastName}`}</p>
                  <p>Account settings</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-primary-blue-500">
        {/* Mobile top navigation */}
        <div className="lg:hidden">
          <div className="bg-primary-blue-500 py-2 px-4 flex items-center justify-between sm:px-4 lg:px-8">
            {title ? (
              <>
                <div>
                  <ChevronLeftIcon
                    className="h-5 w-5 text-primary-blue-50"
                    aria-hidden="true"
                    onClick={() => window.history.back()}
                  />
                </div>
                <div className="text-sm font-medium text-primary-blue-50">{title}</div>
              </>
            ) : (
              <Logo />
            )}

            <div>
              <button
                type="button"
                className="-mr-3 h-12 w-12 inline-flex items-center justify-center bg-primary-blue-500 rounded-md text-white hover:bg-primary-blue-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(true)}>
                <span className="sr-only">Open sidebar</span>
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 flex flex-col overflow-scroll md:p-10 lg:mt-4 bg-white md:bg-primary-blue-50 rounded-tl-3xl scroll-smooth ">
          {children}
          <div className="md:mb-20"></div>
        </main>
      </div>
      <DialogModal
        openStatus={isOpen}
        title={'Użytkownik'}
        message={`Zalogowany jako: ${user?.firstName} ${user?.lastName}`}
        closeModal={closeModal}>
        <div className="flex justify-between">
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-primary-blue-50 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-primary-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={signOutFromApp}>
            Wyloguj
          </button>
          <button
            type="button"
            className="inline-flex justify-center rounded-md border border-transparent bg-primary-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-primary-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            onClick={closeModal}>
            Ok
          </button>
        </div>
      </DialogModal>
    </div>
  );
};

export default Layout;
