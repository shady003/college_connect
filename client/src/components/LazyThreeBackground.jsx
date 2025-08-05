import React, { lazy, Suspense } from 'react';

const ThreeBackground = lazy(() => import('./ThreeBackground'));

const LazyThreeBackground = () => {
  return (
    <Suspense fallback={null}>
      <ThreeBackground />
    </Suspense>
  );
};

export default LazyThreeBackground;