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