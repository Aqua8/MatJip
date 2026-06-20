import { useNavigate } from 'react-router-dom';

export default function RestaurantCard({ restaurant, variant = 'grid', isSelected, onSelect }) {
  const navigate = useNavigate();
  const { id, name, address, category, likeCount, avgRating } = restaurant;

  const handleClick = () => {
    if (variant === 'list' && onSelect) {
      onSelect(restaurant);
    } else {
      navigate(`/restaurants/${id}`);
    }
  };

  const ratingBadge = avgRating != null
    ? `★ ${Number(avgRating).toFixed(1)}`
    : null;

  /* ── 리스트형 (사이드바) ── */
  if (variant === 'list') {
    return (
      <div
        onClick={handleClick}
        className={`px-6 py-[18px] border-b border-gray-100 cursor-pointer transition-colors ${
          isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'
        }`}
      >
        <div className="flex items-baseline justify-between gap-3 mb-[6px]">
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="font-semibold text-[15px] leading-snug text-black">{name}</span>
            <span className="text-[13px] text-gray-400 flex-shrink-0 font-light">/{category}</span>
          </div>
          <span className="text-[10px] border border-gray-300 text-gray-500 px-[7px] py-[3px] flex-shrink-0 tracking-[0.06em] uppercase whitespace-nowrap">
            {ratingBadge ?? '없음'}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[12px] text-gray-400 truncate">{address}</span>
          <span className="text-[12px] text-gray-300 flex-shrink-0">♥ {likeCount ?? 0}</span>
        </div>
      </div>
    );
  }

  /* ── 그리드형 (즐겨찾기) ── */
  return (
    <div
      onClick={() => navigate(`/restaurants/${id}`)}
      className="bg-white border border-gray-200 cursor-pointer hover:border-black transition-colors p-5 group"
    >
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-[11px] text-gray-400 tracking-[0.06em]">/{category}</span>
        <span className="text-[11px] text-gray-300 group-hover:text-gray-500 transition-colors">♥ {likeCount ?? 0}</span>
      </div>
      <h3 className="font-semibold text-[15px] text-black mb-1.5 line-clamp-1">{name}</h3>
      <p className="text-[12px] text-gray-400 truncate mb-4">{address}</p>
      <span className="text-[10px] border border-gray-300 text-gray-500 px-[7px] py-[3px] tracking-[0.06em] uppercase">
        {ratingBadge ?? '리뷰없음'}
      </span>
    </div>
  );
}
