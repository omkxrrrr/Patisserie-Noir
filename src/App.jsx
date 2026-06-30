import { Suspense } from 'react';
import PageLoader from './components/ui/PageLoader';
import AppRoutes from './routes';

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AppRoutes />
    </Suspense>
  );
}
