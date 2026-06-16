import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import RestaurantCard from '../components/RestaurantCard';
import { restaurants as restaurantsApi } from '../api';

const CATEGORIES = ['전체', '한식', '일식', '중식', '양식', '카페', '기타'];

export default function Home({ sidebarOpen }) {
  const navigate = useNavigate();
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

  const handleSelect = (r) => setSelected(r);
  const handleDeselect = () => setSelected(null);

  return (
    <div className="flex h-full">

      {/* ── 좌측 패널 ── */}
      {sidebarOpen && (
        <div className="w-[360px] flex-shrink-0 flex flex-col bg-white border-r border-gray-200">

          {/* 검색 */}
          <div className="px-6 pt-9 pb-6">
            <form onSubmit={handleSearch}>
              <input
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="음식 종류나 식당 이름 검색..."
                className="w-full border-b border-gray-300 pb-3 text-[13px] bg-transparent outline-none placeholder-gray-400 focus:border-black transition-colors"
              />
            </form>
          </div>

          {/* 카테고리 필터 */}
          <div className="px-6 pb-6 flex gap-2 overflow-x-auto scrollbar-none flex-nowrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-[11px] px-3.5 py-[5px] border font-semibold tracking-[0.08em] transition-colors whitespace-nowrap flex-shrink-0 ${
                  category === c
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:border-black'
                }`}
              >
                {c === '전체' ? 'NEARBY' : c.toUpperCase()}
              </button>
            ))}
          </div>

          {/* 리스트 */}
          <div className="flex-1 overflow-y-auto border-t border-gray-200 scrollbar-none">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-xs text-gray-400">검색 결과가 없습니다</p>
              </div>
            ) : (
              filtered.map((r) => (
                <RestaurantCard
                  key={r.id}
                  restaurant={r}
                  variant="list"
                  isSelected={selected?.id === r.id}
                  onSelect={handleSelect}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ── 지도 영역 ── */}
      <div className="flex-1 flex min-w-0">
        <div className="flex-1 relative">
          <Map restaurants={filtered} onMarkerClick={handleSelect} />
        </div>

        {/* ── 우측 디테일 패널 ── */}
        {selected && (
          <div className="w-[360px] flex-shrink-0 flex flex-col bg-white border-l border-gray-200">
            {/* 이미지 */}
            <div className="relative bg-gray-100 h-[200px] flex-shrink-0 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              <button
                onClick={handleDeselect}
                className="absolute top-3 right-3 w-7 h-7 bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black transition-colors text-[11px]"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            {/* 정보 */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="flex items-baseline gap-2 mb-1">
                  <h2 className="text-[18px] font-bold text-black">{selected.name}</h2>
                  <span className="text-[13px] text-gray-400 font-light">/{selected.category}</span>
                </div>
                {selected.avgRating && (
                  <p className="text-[13px] text-gray-500">★ {Number(selected.avgRating).toFixed(1)} 평균</p>
                )}
              </div>

              <div className="px-6 py-4 border-b border-gray-100 space-y-3">
                <DetailRow label="카테고리" value={selected.category} />
                <DetailRow label="주소" value={selected.address} />
                {selected.likeCount != null && (
                  <DetailRow label="좋아요" value={`${selected.likeCount}개`} />
                )}
              </div>

              <div className="mt-auto px-6 pb-6 pt-4">
                <button
                  onClick={() => navigate(`/restaurants/${selected.id}`)}
                  className="w-full bg-black text-white text-[12px] font-semibold tracking-[0.15em] py-4 hover:bg-gray-900 transition-colors"
                >
                  상세 보기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-[12px] text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-[12px] text-black text-right">{value ?? '—'}</span>
    </div>
  );
}
