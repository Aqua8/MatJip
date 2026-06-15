export default function StarRating({ value = 0, onChange, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'text-3xl' : 'text-xl';
  return (
    <div className={`flex gap-0.5 ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`leading-none transition-colors ${
            onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          } ${star <= value ? 'text-yellow-400' : 'text-gray-200'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
