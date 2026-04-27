import DestinationDetail from './DestinationDetail';
import type { Destination } from '@/types';
import destinationsData from '../../../../public/data/destinations.json';

const destinations = destinationsData as Destination[];

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export default function DestinationPage() {
  return <DestinationDetail />;
}
