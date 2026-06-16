import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import RestaurantCard from '../components/RestaurantCard';
import { restaurants as restaurantsApi, bookmarks as bookmarksApi } from '../api';
import { useAuth } from '../store/authStore';

const CATEGORIES = ['전체', '한식', '일식', '중식', '양식', '카페', '기타'];

const mapCategory = (categoryName = '') => {
  if (categoryName.includes('한식')) return '한식';
  if (categoryName.includes('일식') || categoryName.includes('초밥') || categoryName.includes('스시')) return '일식';
  if (categoryName.includes('중식') || categoryName.includes('중국')) return '중식';
  if (categoryName.includes('양식') || categoryName.includes('이탈리아') || categoryName.includes('프랑스') || categoryName.includes('멕시코')) return '양식';
  if (categoryName.includes('카페') || categoryName.includes('커피') || categoryName.includes('베이커리') || categoryName.includes('디저트')) return '카페';
  return '기타';
};

export default function Home({ sidebarOpen, onSidebarClose }) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [list, setList] = useState([]);
  const [category, setCategory] = useState('전체');
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  // 카카오 검색
  const [inputVal, setInputVal] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [kakaoResults, setKakaoResults] = useState([]);

  // 지도 범위 필터
  const [mapBounds, setMapBounds] = useState(null);
  const [boundsFilter, setBoundsFilter] = useState(false);

  // 지도 이동
  const [flyTo, setFlyTo] = useState(null);

  // 즐겨찾기된 kakaoPlaceId Set
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  useEffect(() => {
    if (!isLoggedIn) { setBookmarkedIds(new Set()); return; }
    bookmarksApi.list().then((res) => {
      setBookmarkedIds(new Set(res.data.map((r) => r.kakaoPlaceId).filter(Boolean)));
    }).catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const loadList = () => {
    restaurantsApi.list('').then((res) => setList(res.data)).catch(() => {});
  };

  useEffect(() => { loadList(); }, []);

  const inBounds = (r) => {
    if (!boundsFilter || !mapBounds || !r.lat || !r.lng) return true;
    return (
      r.lat >= mapBounds.sw.lat && r.lat <= mapBounds.ne.lat &&
      r.lng >= mapBounds.sw.lng && r.lng <= mapBounds.ne.lng
    );
  };

  const filtered = list
    .filter((r) => category === '전체' || r.category === category)
    .filter(inBounds);

  // 카카오 검색 실행
  const handleSearch = (e) => {
    e.preventDefault();
    const q = inputVal.trim();
    if (!q) { clearSearch(); return; }
    if (!window.kakao?.maps?.services) return;

    setSearchLoading(true);
    setSearchMode(true);
    setKakaoResults([]);

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(q, (result, status) => {
      setSearchLoading(false);
      if (status === window.kakao.maps.services.Status.OK) {
        setKakaoResults(result.slice(0, 10));
      }
    });
  };

  const clearSearch = () => {
    setInputVal('');
    setSearchMode(false);
    setKakaoResults([]);
  };

  // 카카오 결과 클릭 → DB 등록(로그인 시) → 선택
  const handleKakaoResultClick = async (place) => {
    const lat = parseFloat(place.y);
    const lng = parseFloat(place.x);
    setFlyTo({ lat, lng });

    // DB에 이미 있으면 바로 선택
    const existing = list.find((r) => r.kakaoPlaceId === place.id);
    if (existing) {
      setSelected(existing);
      if (isMobile && sidebarOpen) onSidebarClose();
      clearSearch();
      return;
    }

    // 로그인한 경우만 등록 시도
    if (isLoggedIn) {
      try {
        await restaurantsApi.create({
          kakaoPlaceId: place.id,
          name: place.place_name,
          address: place.road_address_name || place.address_name,
          category: mapCategory(place.category_name),
          lat,
          lng,
        });
      } catch (err) {
        if (err.response?.status !== 409) {
          // 등록 실패 시 선택만 진행
        }
      }

      const res = await restaurantsApi.list('').catch(() => null);
      if (res?.data) {
        setList(res.data);
        const found = res.data.find((r) => r.kakaoPlaceId === place.id);
        if (found) {
          setSelected(found);
          if (isMobile && sidebarOpen) onSidebarClose();
          clearSearch();
          return;
        }
      }
    }

    // 비로그인 or 등록 실패: 임시 객체로 패널 표시
    setSelected({ kakaoPlaceId: place.id, name: place.place_name, address: place.road_address_name || place.address_name, category: mapCategory(place.category_name), lat, lng });
    if (isMobile && sidebarOpen) onSidebarClose();
    clearSearch();
  };

  const handleSelect = (r) => {
    setSelected(r);
    if (isMobile && sidebarOpen) onSidebarClose();
  };

  return (
    <div className="flex h-full relative overflow-hidden">

      {/* 모바일 backdrop */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 bg-black/30 z-10" onClick={onSidebarClose} />
      )}

      {/* ── 좌측 패널 ── */}
      <div
        className={[
          'flex flex-col bg-white border-r border-gray-200 flex-shrink-0',
          'transition-transform duration-300',
          'fixed inset-y-0 left-0 z-20 w-[300px]',
          'md:relative md:inset-auto md:z-auto md:w-[360px]',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full',
          !sidebarOpen && 'md:hidden',
        ].join(' ')}
      >
        {/* 검색 */}
        <div className="px-6 pt-9 pb-5">
          <form onSubmit={handleSearch} className="relative">
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="음식 종류나 식당 이름 검색..."
              className="w-full border-b border-gray-300 pb-3 text-[13px] bg-transparent outline-none placeholder-gray-400 focus:border-black transition-colors pr-6"
            />
            {inputVal && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-0 bottom-3 text-gray-300 hover:text-black transition-colors text-[12px]"
              >
                ✕
              </button>
            )}
          </form>
        </div>

        {/* 카테고리 필터 + 범위 필터 (검색 모드가 아닐 때만) */}
        {!searchMode && (
          <>
            <div className="px-6 pb-3 flex gap-2 overflow-x-auto scrollbar-none flex-nowrap">
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

            <div className="px-6 pb-4">
              <button
                onClick={() => setBoundsFilter((v) => !v)}
                className={`text-[11px] flex items-center gap-1.5 transition-colors ${
                  boundsFilter ? 'text-black font-semibold' : 'text-gray-400 hover:text-black'
                }`}
              >
                <span className={`w-3 h-3 border flex items-center justify-center text-[9px] ${boundsFilter ? 'bg-black border-black text-white' : 'border-gray-300'}`}>
                  {boundsFilter ? '✓' : ''}
                </span>
                지도 범위 내 맛집만
              </button>
            </div>
          </>
        )}

        {/* 리스트 영역 */}
        <div className="flex-1 overflow-y-auto border-t border-gray-200 scrollbar-none">

          {/* 카카오 검색 결과 */}
          {searchMode ? (
            searchLoading ? (
              <div className="flex items-center justify-center h-20">
                <p className="text-xs text-gray-400">검색 중...</p>
              </div>
            ) : kakaoResults.length === 0 ? (
              <div className="flex items-center justify-center h-20">
                <p className="text-xs text-gray-400">검색 결과가 없습니다</p>
              </div>
            ) : (
              kakaoResults.map((place) => (
                <div
                  key={place.id}
                  onClick={() => handleKakaoResultClick(place)}
                  className="px-6 py-[18px] border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-baseline gap-1 mb-[6px] min-w-0">
                    <span className="font-semibold text-[15px] leading-snug text-black truncate">{place.place_name}</span>
                    <span className="text-[13px] text-gray-400 flex-shrink-0 font-light">/{mapCategory(place.category_name)}</span>
                    {bookmarkedIds.has(place.id) && (
                      <span className="text-[12px] text-black flex-shrink-0 ml-auto">★</span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[12px] text-gray-400 truncate">{place.road_address_name || place.address_name}</span>
                    {place.distance && (
                      <span className="text-[12px] text-gray-300 flex-shrink-0">
                        {place.distance >= 1000
                          ? `${(place.distance / 1000).toFixed(1)}km`
                          : `${place.distance}m`}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )

          /* DB 맛집 리스트 */
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <p className="text-xs text-gray-400">
                {boundsFilter ? '지도 범위 내 맛집이 없습니다' : '맛집이 없습니다'}
              </p>
              {boundsFilter && (
                <button onClick={() => setBoundsFilter(false)} className="text-[11px] text-black underline">
                  전체 보기
                </button>
              )}
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
        <div className="flex-1 relative">
          <Map
            restaurants={filtered}
            onMarkerClick={handleSelect}
            onBoundsChange={setMapBounds}
            flyTo={flyTo}
            selectedRestaurant={selected}
          />
        </div>

        {/* 우측 디테일 패널 (데스크탑) */}
        {selected && !isMobile && (
          <div className="w-[360px] flex-shrink-0 flex flex-col bg-white border-l border-gray-200">
            <DetailPanel
              restaurant={selected}
              onClose={() => setSelected(null)}
              onNavigate={() => navigate(`/restaurants/${selected.id}`)}
            />
          </div>
        )}
      </div>

      {/* 하단 시트 (모바일) */}
      {selected && isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-gray-200 shadow-lg max-h-[55vh] flex flex-col">
          <DetailPanel
            restaurant={selected}
            onClose={() => setSelected(null)}
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
      {!compact && (
        <div className="relative bg-gray-100 h-[200px] flex-shrink-0 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 15l-5-5L5 21"/>
          </svg>
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-black transition-colors text-[11px]" aria-label="닫기">✕</button>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className={`px-6 border-b border-gray-100 flex items-start justify-between gap-3 ${compact ? 'pt-4 pb-4' : 'pt-6 pb-4'}`}>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <h2 className="text-[17px] font-bold text-black">{name}</h2>
              <span className="text-[13px] text-gray-400 font-light">/{category}</span>
            </div>
            {avgRating && <p className="text-[13px] text-gray-500">★ {Number(avgRating).toFixed(1)} 평균</p>}
          </div>
          {compact && (
            <button onClick={onClose} className="flex-shrink-0 text-gray-300 hover:text-black transition-colors text-[13px] mt-0.5" aria-label="닫기">✕</button>
          )}
        </div>
        <div className="px-6 py-4 border-b border-gray-100 space-y-3">
          <DetailRow label="카테고리" value={category} />
          <DetailRow label="주소" value={address} />
          {likeCount != null && <DetailRow label="좋아요" value={`${likeCount}개`} />}
        </div>
        <div className={`px-6 pb-6 ${compact ? 'pt-4' : 'mt-auto pt-4'}`}>
          <button onClick={onNavigate} className="w-full bg-black text-white text-[12px] font-semibold tracking-[0.15em] py-4 hover:bg-gray-900 transition-colors">
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
