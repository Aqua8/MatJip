import { useState, useEffect } from 'react';
import Map from '../components/Map';
import RestaurantCard from '../components/RestaurantCard';
import { restaurants as restaurantsApi } from '../api';

const CATEGORIES = ['전체', '한식', '일식', '중식', '양식', '카페', '기타'];

export default function Home() {
  const [list, setList] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [category, setCategory] = useState('전체');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    restaurantsApi.list(keyword).then((res) => setList(res.data)).catch(() => {});
  }, [keyword]);

  const filtered = category === '전체' ? list : list.filter((r) => r.category === category);

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(inputVal.trim());
  };

  return (
    <div className="flex h-screen">
      {/* 사이드바 */}
      <div className="w-80 flex-shrink-0 flex flex-col border-r border-gray-100 bg-white">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900 mb-3">맛집 지도</h1>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="맛집 검색..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
            />
            <button type="submit" className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm">
              검색
            </button>
          </form>
        </div>

        {/* 카테고리 필터 */}
        <div className="flex gap-1.5 p-3 border-b border-gray-100 flex-wrap">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                category === c
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-8">맛집이 없습니다</p>
          ) : (
            filtered.map((r) => <RestaurantCard key={r.id} restaurant={r} />)
          )}
        </div>
      </div>

      {/* 지도 */}
      <div className="flex-1 relative">
        <Map restaurants={filtered} onMarkerClick={setSelected} />
        {selected && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-xl p-3 w-72">
            <RestaurantCard restaurant={selected} />
            <button onClick={() => setSelected(null)} className="absolute top-2 right-2 text-gray-300 hover:text-gray-600">✕</button>
          </div>
        )}
      </div>
    </div>
  );
}
