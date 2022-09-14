import React, { useRef, useState } from 'react';
import { TrashIcon } from '@heroicons/react/outline';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';
import 'swiper/css/pagination';

// import required modules
import { FreeMode, Navigation, Thumbs, Zoom, Pagination } from 'swiper';

const Gallery = ({ photos, onDelete = false }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState();

  const screenSm = [Zoom, FreeMode, Navigation, Thumbs, Pagination];
  const screenLg = [Zoom, FreeMode, Navigation, Thumbs];
  return (
    <>
      <Swiper
        style={{
          '--swiper-navigation-color': '#ccc',
          '--swiper-pagination-color': '#ccc'
        }}
        spaceBetween={10}
        navigation={true}
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        modules={window.innerWidth < 768 ? screenSm : screenLg}
        zoom={true}
        pagination={true}
        passiveListeners={false}
        className="mySwiper2 select-none w-full h-[40vh] md:h-[60vh] mb-2 bg-gray-600 md:bg-inherit">
        {photos.map(
          (photo: {
            id: React.Key | null | undefined;
            url: string | undefined;
            author: { firstName: string; lastName: string };
          }) => {
            return (
              <SwiperSlide key={photo.id} className="relative">
                <div className="swiper-zoom-container">
                  <img
                    alt={photo.url}
                    src={photo.url}
                    className="object-contain w-full h-[40vh] md:h-[60vh] object-center"
                  />
                </div>
                {photo.author && (
                  <span className="absolute left-0 top-0 md:top-1 md:left-1 font-medium bg-slate-50 text-slate-400 p-2 ">{`${photo.author.firstName} ${photo.author.lastName}`}</span>
                )}
                {photo.task?.title && (
                  <span className="absolute left-0 top-0 md:top-1 md:left-1 font-medium bg-slate-50 text-slate-400 p-2 ">{`${photo.task.title}`}</span>
                )}
                {onDelete && (
                  <button
                    title="delete"
                    className="absolute right-0 top-0 md:top-1 md:right-1 font-medium p-2 hover:contrast-75 cursor-pointer text-red-700 bg-red-100 hover:bg-red-200 md:focus:outline-none md:focus:ring-2 md:focus:ring-offset-2 md:focus:ring-red-500"
                    onClick={(e) => {
                      e.preventDefault();
                      onDelete(photo.id);
                    }}>
                    <TrashIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                )}
              </SwiperSlide>
            );
          }
        )}
      </Swiper>
      <Swiper
        onSwiper={setThumbsSwiper}
        spaceBetween={10}
        slidesPerView={10}
        freeMode={true}
        watchSlidesProgress={true}
        modules={[FreeMode, Navigation, Thumbs]}
        className="mySwiper w-full hidden md:flex">
        {photos.map((photo: { id: React.Key | null | undefined; url: string | undefined }) => {
          return (
            <SwiperSlide key={photo.id}>
              <img
                alt=""
                src={photo.url}
                className="object-cover object-center  w-[40px] h-[40px] md:w-24 md:h-24 cursor-pointer hover:contrast-50"
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </>
  );
};

export default Gallery;
