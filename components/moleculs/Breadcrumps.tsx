import { ChevronRightIcon, HomeIcon } from '@heroicons/react/solid';
import { capitalize } from 'lib/utils/capitalize';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const convertBreadcrumb = (string: string) => {
  return string
    .replace(/-/g, ' ')
    .replace(/oe/g, 'ö')
    .replace(/ae/g, 'ä')
    .replace(/ue/g, 'ü')
    .replace(/\?\w+./g, ' ')
    .toUpperCase();
};

type PathArrayType = {
  breadcrumb: string;
  href: string;
}[];

type Breadcrumbs = {
  translate?: {
    query: string;
    fullName: string;
  }[];
};

export default function Breadcrumbs({ translate }: Breadcrumbs) {
  const router = useRouter();
  const [breadcrumbs, setBreadcrumbs] = useState<PathArrayType | null>(null);

  useEffect(() => {
    if (router) {
      const linkPath = router.asPath.split('/');
      linkPath.shift();

      if (translate) {
        const regex = /(\[)|(\])/g;
        const linkPathTranslate = router.pathname
          .split('/')
          .map((x) => x.replace(regex, ''))
          .filter((x) => x !== '');

        const pathArray = linkPathTranslate.map((path, i) => {
          const breadcrumb = translate?.find((x) => x.query === path)?.fullName;
          const breadcrumbPath = breadcrumb ? breadcrumb : path;
          return { breadcrumb: breadcrumbPath, href: '/' + linkPath.slice(0, i + 1).join('/') };
        });

        setBreadcrumbs(pathArray);
      } else {
        const pathArray = linkPath
          .map((path, i) => {
            return { breadcrumb: path, href: '/' + linkPath.slice(0, i + 1).join('/') };
          })
          .filter((path) => path.breadcrumb !== '');

        setBreadcrumbs(pathArray);
      }
    }
  }, [router, translate]);

  if (!breadcrumbs) {
    return <></>;
  }

  return (
    <nav className="hidden md:visible md:flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        <li>
          <div>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <HomeIcon className="flex-shrink-0 h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </a>
          </div>
        </li>
        {breadcrumbs.map((breadcrumb) => {
          return (
            <li key={breadcrumb.href}>
              <div className=" flex items-center">
                <ChevronRightIcon
                  className="flex-shrink-0 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                <Link href={breadcrumb.href}>
                  <a
                    className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                    aria-current={router.pathname === breadcrumb.href ? 'page' : undefined}>
                    {capitalize(convertBreadcrumb(breadcrumb.breadcrumb))}
                  </a>
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
