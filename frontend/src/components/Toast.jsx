import { useToasts } from '../store/toastStore';

export default function Toast() {
  const toasts = useToasts();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-black text-white text-[13px] tracking-wide px-5 py-3 shadow-lg whitespace-nowrap"
        >
          {t.type === 'success' ? '✓  ' : ''}{t.message}
        </div>
      ))}
    </div>
  );
}
