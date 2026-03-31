import { lazy, Suspense, useState } from 'react';

// Just import when needed
const ReportModal = lazy(() =>
  // Simulate delay for showing the loading fallback
  new Promise(resolve => setTimeout(resolve, 2000))
    .then(() => import('./Chart'))
);

// Preloads when mouse entered the open button
const preloadReport = () => import('./Chart')

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onMouseEnter={preloadReport} onClick={() => setOpen(true)}>
        View Report
      </button>
      {open && <Suspense fallback={<div>Loading...</div>}>
        <ReportModal onClose={() => setOpen(false)} />
      </Suspense>}
    </div>
  );
}