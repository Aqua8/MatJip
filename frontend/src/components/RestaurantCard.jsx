import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';

export default function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();
  const { id, name, address, category, likeCount, avgRating } = restaurant;

  return (
    <div
      onClick={() => navigate(`/restaurants/${id}`)}
      className="bg-white border border-gray-100 rounded-xl p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-gray-900 text-sm">{name}</h3>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{category}</span>
      </div>
      <p className="text-xs text-gray-400 mb-2 truncate">{address}</p>
      <div className="flex items-center justify-between">
        {avgRating != null ? (
          <StarRating value={Math.round(avgRating)} size="sm" />
        ) : (
          <span className="text-xs text-gray-300">리뷰 없음</span>
        )}
        <span className="text-xs text-gray-400">♥ {likeCount ?? 0}</span>
      </div>
    </div>
  );
}
