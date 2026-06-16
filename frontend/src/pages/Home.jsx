import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import RestaurantCard from '../components/RestaurantCard';
import { restaurants as restaurantsApi } from '../api';

const CATEGORIES = ['전체', '한식', '일식', '중식', '양식', '카페', '기타'];

export default function Home({ sidebarOpen, onSidebarClose }) {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [category, setCategory] = useState('전체');
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    restaurantsApi.list(keyword).then((res) => setList(res.data)).catch(() => {});
  }, [keyword]);

  const filtered = category === '전체' ? list : list.filter((r) => r.category === category);

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(inputVal.trim());
  };

  const handleSelect = (r) => {
    setSelected(r);
    if (isMobile && sidebarOpen) onSidebarClose();
  };

  const handleDeselect = () => setSelected(null);

  return (
    <div className="flex h-full relative overflow-hidden">

      {/* ── 모바일 사이드바 backdrop ── */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/30 z-10"
          onClick={onSidebarClose}
        />
      )}

      {/* ── 좌측 패널 ── */}
      <div
        className={[
          'flex flex-col bg-white border-r border-gray-200 flex-shrink-0',
          'transition-transform duration-300',
          // 모바일: fixed 오버레이, 데스크탑: static
          'fixed inset-y-0 left-0 z-20 w-[300px]',
          'md:relative md:inset-auto md:z-auto md:w-[360px]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full',
          !sidebarOpen && 'md:hidden',
        ].join(' ')}
      >
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

      {/* ── 지도 + 우측 패널 ── */}
      <div className="flex-1 flex min-w-0 relative">
        {/* 지도 */}
        <div className="flex-1 relative">
          <Map restaurants={filtered} onMarkerClick={handleSelect} />
        </div>

        {/* ── 우측 디테일 패널 (데스크탑) ── */}
        {selected && !isMobile && (
          <div className="w-[360px] flex-shrink-0 flex flex-col bg-white border-l border-gray-200">
            <DetailPanel
              restaurant={selected}
              onClose={handleDeselect}
              onNavigate={() => navigate(`/restaurants/${selected.id}`)}
            />
          </div>
        )}
      </div>

      {/* ── 하단 시트 (모바일) ── */}
      {selected && isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 shadow-lg max-h-[55vh] flex flex-col">
          <DetailPanel
            restaurant={selected}
            onClose={handleDeselect}
            onNavigate={() => navigate(`/restaurants/${selected.id}`)}
            compact
          />
        </div>
      )}

    </div>
  );
}

function DetailPanel({ restaurant, onClose, onNavigate, compact }) {
  const { name, category, address, avgRating, likeCount } = restaurant;

  return (
    <>
      {/* 이미지 */}
      {!compact && (
        <div className="relative bg-gray-100 h-[200px] flex-shrink-0 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black transition-colors text-[11px]"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* 제목 */}
        <div className={`px-6 border-b border-gray-100 flex items-start justify-between gap-3 ${compact ? 'pt-4 pb-4' : 'pt-6 pb-4'}`}>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <h2 className="text-[17px] font-bold text-black">{name}</h2>
              <span className="text-[13px] text-gray-400 font-light">/{category}</span>
            </div>
            {avgRating && (
              <p className="text-[13px] text-gray-500">★ {Number(avgRating).toFixed(1)} 평균</p>
            )}
          </div>
          {compact && (
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-300 hover:text-black transition-colors text-[13px] mt-0.5"
              aria-label="닫기"
            >
              ✕
            </button>
          )}
        </div>

        {/* 정보 */}
        <div className="px-6 py-4 border-b border-gray-100 space-y-3">
          <DetailRow label="카테고리" value={category} />
          <DetailRow label="주소" value={address} />
          {likeCount != null && <DetailRow label="좋아요" value={`${likeCount}개`} />}
        </div>

        {/* 버튼 */}
        <div className={`px-6 pb-6 ${compact ? 'pt-4' : 'mt-auto pt-4'}`}>
          <button
            onClick={onNavigate}
            className="w-full bg-black text-white text-[12px] font-semibold tracking-[0.15em] py-4 hover:bg-gray-900 transition-colors"
          >
            상세 보기
          </button>
        </div>
      </div>
    </>
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
