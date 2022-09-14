export const checkImageSize = (url) =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.src = url;
    img.onload = function () {
      const height = img.height;
      const width = img.width;
      resolve({ width, height });
    };
  });
