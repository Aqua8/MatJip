import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import { restaurants as restaurantsApi, reviews as reviewsApi, likes, bookmarks } from '../api';
import { useAuth } from '../store/authStore';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [reviewList, setReviewList] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    restaurantsApi.get(id).then((res) => {
      setRestaurant(res.data);
      setLikeCount(res.data.likeCount ?? 0);
    }).catch(() => navigate('/'));
    loadReviews();
  }, [id]);

  const loadReviews = () => {
    reviewsApi.list(id).then((res) => setReviewList(res.data)).catch(() => {});
  };

  const handleLike = async () => {
    if (!isLoggedIn) return alert('로그인이 필요합니다.');
    try {
      const res = await likes.toggle(id);
      setLiked(res.data.liked);
      setLikeCount(res.data.count);
    } catch {}
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) return alert('로그인이 필요합니다.');
    try {
      const res = await bookmarks.toggle(id);
      setBookmarked(res.data.bookmarked);
    } catch {}
  };

  const avgRating = reviewList.length
    ? (reviewList.reduce((s, r) => s + r.rating, 0) / reviewList.length).toFixed(1)
    : null;

  if (!restaurant) return <div className="p-8 text-gray-400 text-center">불러오는 중...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-gray-400 hover:text-gray-700 mb-6">← 뒤로</button>

      {/* 기본 정보 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
          <span className="text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded-full">{restaurant.category}</span>
        </div>
        <p className="text-gray-500 text-sm mb-4">{restaurant.address}</p>

        <div className="flex items-center gap-3">
          {avgRating && (
            <div className="flex items-center gap-1.5">
              <StarRating value={Math.round(avgRating)} />
              <span className="text-sm font-semibold text-gray-700">{avgRating}</span>
              <span className="text-xs text-gray-400">({reviewList.length}개)</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm transition-colors ${
              liked ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-500 hover:border-gray-400'
            }`}
          >
            ♥ {likeCount}
          </button>
          <button
            onClick={handleBookmark}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm transition-colors ${
              bookmarked ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'border-gray-200 text-gray-500 hover:border-gray-400'
            }`}
          >
            {bookmarked ? '★ 저장됨' : '☆ 즐겨찾기'}
          </button>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-900">리뷰 {reviewList.length}개</h2>
          {isLoggedIn && (
            <button
              onClick={() => setShowReviewForm((v) => !v)}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              {showReviewForm ? '취소' : '+ 리뷰 작성'}
            </button>
          )}
        </div>

        {showReviewForm && (
          <div className="mb-4">
            <ReviewForm
              restaurantId={id}
              onSuccess={() => { setShowReviewForm(false); loadReviews(); }}
            />
          </div>
        )}

        <div className="space-y-3">
          {reviewList.map((review) => (
            <div key={review.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{review.nickname}</span>
                <StarRating value={review.rating} />
              </div>
              <p className="text-sm text-gray-600 mb-2">{review.content}</p>
              {review.imageUrls?.length > 0 && (
                <div className="flex gap-2">
                  {review.imageUrls.map((url, i) => (
                    <img key={i} src={url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-300 mt-2">{review.createdAt?.slice(0, 10)}</p>
            </div>
          ))}
          {reviewList.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">아직 리뷰가 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}
