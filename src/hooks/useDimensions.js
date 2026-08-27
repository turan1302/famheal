import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

const getDimensionsState = () => {
  const { width, height } = Dimensions.get('window');
  const orientation = height >= width ? 'portrait' : 'landscape';

  return {
    width,
    height,
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
  };
};

const useDimensions = () => {
  const [dimensions, setDimensions] = useState(getDimensionsState);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      const orientation =
        window.height >= window.width ? 'portrait' : 'landscape';

      setDimensions({
        width: window.width,
        height: window.height,
        orientation,
        isPortrait: orientation === 'portrait',
        isLandscape: orientation === 'landscape',
      });
    });

    return () => subscription.remove();
  }, []);

  return dimensions;
};

export default useDimensions;
