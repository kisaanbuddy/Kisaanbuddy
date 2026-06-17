import type { Metadata } from 'next';
import WorkerConnectClient from './WorkerConnectClient';

export const metadata: Metadata = {
  title: 'Worker Connect - Hire Farm Labours & Find Jobs | कृषि मजदूर सेवा',
  description: 'Connect with local farm owners looking to hire workers, or post agricultural job openings for harvesting, sowing, weeding, and tractor operations.',
  alternates: {
    canonical: '/worker-connect',
  },
  openGraph: {
    title: 'Worker Connect - Hire Farm Labours & Find Jobs | कृषि मजदूर सेवा',
    description: 'Connect with local farm owners looking to hire workers, or post agricultural job openings for harvesting, sowing, weeding, and tractor operations.',
    url: '/worker-connect',
    type: 'website',
  },
};

export default function WorkerConnectPage() {
  return <WorkerConnectClient />;
}
