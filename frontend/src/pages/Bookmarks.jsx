import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RestaurantCard from '../components/RestaurantCard';
import { bookmarks as bookmarksApi } from '../api';
import { useAuth } from '../store/authStore';

export default function Bookmarks() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [list, setList] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) return;
    bookmarksApi.list().then((res) => setList(res.data)).catch(() => {});
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-5">
        <p className="text-sm text-gray-500">로그인이 필요합니다</p>
        <button
          onClick={() => navigate('/mypage')}
          className="text-xs border border-black px-5 py-2.5 font-medium hover:bg-black hover:text-white transition-colors tracking-wider"
        >
          로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-3xl mx-auto px-8 py-8">
        <div className="flex items-baseline gap-3 mb-8">
          <h1 className="text-lg font-bold text-black">저장한 맛집</h1>
          <span className="text-sm text-gray-400">{list.length}</span>
        </div>

        {list.length === 0 ? (
          <div className="border border-gray-200 py-20 text-center">
            <p className="text-xs text-gray-400 mb-4">저장한 맛집이 없습니다</p>
            <button
              onClick={() => navigate('/')}
              className="text-xs text-black underline hover:no-underline"
            >
              맛집 둘러보기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-gray-200">
            {list.map((r) => <RestaurantCard key={r.id} restaurant={r} variant="grid" />)}
          </div>
        )}
      </div>
    </div>
  );
}
