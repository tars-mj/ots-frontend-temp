import { useEffect, useState } from 'react';
import { Switch } from '@headlessui/react';

type MySwitchType = {
  isActive: boolean;
  mutate: (e: any) => void;
};

export default function MySwitch({ isActive, mutate }: MySwitchType) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(isActive);
  }, [isActive]);

  const setEnableState = (e: boolean | ((prevState: boolean) => boolean)) => {
    setEnabled(e);
    mutate(e);
  };

  return (
    <Switch
      checked={enabled}
      onChange={setEnableState}
      className={`${enabled ? 'bg-primary-blue-200' : 'bg-neutral-300'}
          relative inline-flex h-[29px] w-[64px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}>
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={`${enabled ? 'translate-x-9' : 'translate-x-0'}
            pointer-events-none inline-block h-[24px] w-[24px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
      />
    </Switch>
  );
}
