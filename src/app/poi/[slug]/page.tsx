import { Suspense } from 'react';
import PoiDetail from './PoiDetail';

const POI_SLUGS = [
  'puerta-1',
  'ciudadela',
  'templo-quetzalcoatl',
  'calzada-muertos',
  'piramide-sol',
  'piramide-luna',
  'plaza-luna',
  'palacio-quetzalpapalotl',
  'murales-puma',
  'museo-sitio',
];

export function generateStaticParams() {
  return POI_SLUGS.map((slug) => ({ slug }));
}

export default function PoiPage() {
  return (
    <Suspense>
      <PoiDetail />
    </Suspense>
  );
}
