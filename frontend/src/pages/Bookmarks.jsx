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
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <p className="text-gray-400">로그인이 필요합니다</p>
        <button onClick={() => navigate('/mypage')} className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg">
          로그인하기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">즐겨찾기</h1>
      {list.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-16">저장한 맛집이 없습니다</p>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {list.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
        </div>
      )}
    </div>
  );
}
