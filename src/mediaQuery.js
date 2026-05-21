import { useState, useEffect } from 'react';

export default function useMediaQuery() {

  const hasWindow = typeof window !== 'undefined';

  function getWindowDimensions() {
    const width = hasWindow ? window.innerWidth : null;
    const height = hasWindow ? window.innerHeight : null;
    return {
      width,
      height,
      orientation: {
        landscape: width > height,
        portrait: height > width
      },
      ratio: Math.abs(width) / Math.abs(height),
      min: {
        width: w => { return w > width },
        height: h => { return h > height }
      },
      max: {
        width: w => { return w < width },
        height: h => { return h < height }
      }
    };
  }

  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  useEffect(() => {
    if (hasWindow) {
      function handleResize() {
        setWindowDimensions(getWindowDimensions());
      }

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [hasWindow]);

  return windowDimensions;
}