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
    <div className="flex h-full">

      {/* ── 좌측 패널 ── */}
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
                onSelect={setSelected}
              />
            ))
          )}
        </div>
      </div>

      {/* ── 우측 지도 ── */}
      <div className="flex-1 relative">
        <Map restaurants={filtered} onMarkerClick={setSelected} />

        {selected && (
          <div className="absolute bottom-8 left-8 right-8 z-10">
            <div className="bg-white border border-gray-200 px-6 py-5 relative shadow-md">
              <RestaurantCard restaurant={selected} variant="compact" />
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-5 text-gray-300 hover:text-black transition-colors text-[11px] leading-none"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
