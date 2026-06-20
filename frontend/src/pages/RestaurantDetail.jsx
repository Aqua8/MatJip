import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StarRating from '../components/StarRating';
import ReviewForm from '../components/ReviewForm';
import { restaurants as restaurantsApi, reviews as reviewsApi, likes, bookmarks } from '../api';
import { useAuth } from '../store/authStore';
import { toast } from '../store/toastStore';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, nickname } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [reviewList, setReviewList] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  useEffect(() => {
    restaurantsApi.get(id).then((res) => {
      setRestaurant(res.data);
      setLikeCount(res.data.likeCount ?? 0);
      setLiked(res.data.liked ?? false);
    }).catch(() => navigate('/'));
    loadReviews();
  }, [id]);

  useEffect(() => {
    if (!isLoggedIn) { setBookmarked(false); return; }
    bookmarks.list().then((res) => {
      setBookmarked(res.data.some((r) => r.id === Number(id)));
    }).catch(() => {});
  }, [id, isLoggedIn]);

  const loadReviews = () => {
    reviewsApi.list(id).then((res) => setReviewList(res.data)).catch(() => {});
  };

  const handleLike = async () => {
    if (!isLoggedIn) return toast('로그인이 필요합니다.');
    try {
      const res = await likes.toggle(id);
      setLiked(res.data.liked);
      setLikeCount(res.data.count);
    } catch {}
  };

  const handleBookmark = async () => {
    if (!isLoggedIn) return toast('로그인이 필요합니다.');
    try {
      const res = await bookmarks.toggle(id);
      setBookmarked(res.data.bookmarked);
    } catch {}
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('리뷰를 삭제할까요?')) return;
    try {
      await reviewsApi.delete(reviewId);
      toast('리뷰가 삭제되었습니다.', 'success');
      loadReviews();
    } catch {
      toast('리뷰 삭제에 실패했습니다.');
    }
  };

  const avgRating = reviewList.length
    ? (reviewList.reduce((s, r) => s + r.rating, 0) / reviewList.length).toFixed(1)
    : null;

  if (!restaurant) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-xs text-gray-400">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      {/* 헤더 */}
      <div className="border-b border-gray-200 px-4 md:px-8 pt-8 pb-7">
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-gray-400 hover:text-black transition-colors mb-6 flex items-center gap-1.5"
        >
          ← 뒤로
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <h1 className="text-xl font-bold text-black">{restaurant.name}</h1>
              <span className="text-sm text-gray-400">/{restaurant.category}</span>
            </div>
            <p className="text-sm text-gray-400">{restaurant.address}</p>
          </div>
          {avgRating && (
            <div className="flex flex-col items-end flex-shrink-0">
              <span className="text-2xl font-bold text-black">{avgRating}</span>
              <span className="text-xs text-gray-400 mt-0.5">{reviewList.length}개 리뷰</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl px-4 md:px-8 py-6">
        {/* 액션 버튼 */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={handleLike}
            className={`flex-1 py-3 border text-xs font-medium tracking-wider transition-colors ${
              liked
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300 hover:border-black'
            }`}
          >
            ♥ 좋아요 {likeCount}
          </button>
          <button
            onClick={handleBookmark}
            className={`flex-1 py-3 border text-xs font-medium tracking-wider transition-colors ${
              bookmarked
                ? 'bg-black text-white border-black'
                : 'bg-white text-black border-gray-300 hover:border-black'
            }`}
          >
            {bookmarked ? '★ 저장됨' : '☆ 저장하기'}
          </button>
        </div>

        {/* 리뷰 섹션 */}
        <div>
          <div className="flex justify-between items-center mb-5">
            <span className="text-sm font-semibold text-black">리뷰 {reviewList.length}</span>
            {isLoggedIn && !showReviewForm && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="text-xs text-gray-500 hover:text-black transition-colors border border-gray-300 hover:border-black px-3 py-1.5"
              >
                + 리뷰 작성
              </button>
            )}
          </div>

          {showReviewForm && (
            <div className="mb-5">
              <ReviewForm
                restaurantId={id}
                onSuccess={() => { setShowReviewForm(false); loadReviews(); }}
                onCancel={() => setShowReviewForm(false)}
              />
            </div>
          )}

          <div className="space-y-px">
            {reviewList.map((review) => (
              <div key={review.id} className="border border-gray-200 p-5">
                {editingReviewId === review.id ? (
                  <ReviewForm
                    restaurantId={id}
                    reviewId={review.id}
                    initialData={{ rating: review.rating, content: review.content, imageUrls: review.imageUrls }}
                    onSuccess={() => { setEditingReviewId(null); loadReviews(); }}
                    onCancel={() => setEditingReviewId(null)}
                  />
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 border border-gray-200 flex items-center justify-center text-[11px] font-bold text-black">
                          {review.nickname?.[0]}
                        </div>
                        <span className="text-sm font-medium text-black">{review.nickname}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <StarRating value={review.rating} />
                        <span className="text-xs text-gray-300">{review.createdAt?.slice(0, 10)}</span>
                        {isLoggedIn && review.nickname === nickname && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingReviewId(review.id)}
                              className="text-[11px] text-gray-400 hover:text-black transition-colors"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="text-[11px] text-gray-400 hover:text-black transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>
                    {review.imageUrls?.length > 0 && (
                      <div className="flex gap-2 mt-4">
                        {review.imageUrls.map((url, i) => (
                          <img key={i} src={url} alt="" className="w-20 h-20 object-cover" />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            {reviewList.length === 0 && (
              <div className="border border-gray-200 py-14 text-center">
                <p className="text-xs text-gray-400">아직 리뷰가 없습니다</p>
                {isLoggedIn && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="mt-3 text-xs text-black underline hover:no-underline"
                  >
                    첫 번째 리뷰를 남겨보세요
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
