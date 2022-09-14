import { Fragment, SetStateAction, useEffect, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid';
import { capitalize } from 'lib/utils/capitalize';
import { classNames } from '../../lib/utils/class-names';

type InputSelectType = {
  list: { name: string }[];
  className: string;
  label: string;
  mainName: string;
  error: string;
  onChange: (value: SetStateAction<{ name: string }>) => void;
  value?: string;
  dataField: string;
  name?: string;
};

export default function InputSelect({
  list,
  className,
  label,
  mainName,
  error,
  onChange,
  value = '',
  dataField
}: InputSelectType) {
  const [myList, setMyList] = useState<{ name: string }[]>([{ name: '' }]);
  const [selected, setSelected] = useState({ name: '' });

  useEffect(() => {
    setMyList(list);
  }, [list]);

  // problem z przeklikiwaniem miedzy wartosciami
  useEffect(() => {
    if (value !== '' && myList[0].name !== '') {
      setSelected(myList[myList.findIndex((x) => x.name === value)]);
    } else {
      setSelected(myList[0]);
    }
  }, [myList, value]);

  // const prepareList = (listData) => {
  //   return listData.map((item) => {
  //     return { name: item[dataField] };
  //   });
  // };

  const setSelectedOption = (value: { name: string }) => {
    setSelected(value);
    onChange(value);
  };

  return (
    <>
      <label
        htmlFor={label}
        className=" text-sm font-medium text-primary-blue-400 w-full flex justify-between">
        <span>{mainName || capitalize(label)} </span>{' '}
        <span className="text-red-700">{error && 'To pole jest wymagane'}</span>
      </label>
      <Listbox value={selected} onChange={setSelectedOption}>
        <div className={`relative ${className}`}>
          <Listbox.Button className="relative w-full cursor-default h-[38px] rounded-md bg-white py-2 pl-3 pr-10 text-left border-[1px] shadow-sm border-neutral-200 focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-primary-blue-200 sm:text-sm">
            <span className="block truncate">{selected.name}</span>
            <span className="pointer-events-none absolute z-auto inset-y-0 right-0 flex items-center pr-2">
              <SelectorIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <Listbox.Options className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {myList &&
                myList.map((item, itemIdx) => (
                  <Listbox.Option
                    key={itemIdx}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-primary-blue-100 text-primary-blue-400' : 'text-gray-900'
                      }`
                    }
                    value={item}>
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {item.name}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-blue-200">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </>
  );
}
