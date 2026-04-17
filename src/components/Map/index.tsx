'use client';

import dynamic from 'next/dynamic';

function MapSkeleton() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-stone-100 animate-pulse">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full border-4 border-stone-300 border-t-[#c4956a] animate-spin" />
        <p className="text-stone-500 text-sm font-medium">Cargando mapa...</p>
      </div>
    </div>
  );
}

const DynamicMap = dynamic(() => import('./MapContainer'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default DynamicMap;
