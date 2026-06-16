import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';
import RestaurantCard from '../components/RestaurantCard';
import { restaurants as restaurantsApi } from '../api';
import { useAuth } from '../store/authStore';

const CATEGORIES = ['전체', '한식', '일식', '중식', '양식', '카페', '기타'];

// 카카오 카테고리명 → 앱 카테고리
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
  const [keyword, setKeyword] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [category, setCategory] = useState('전체');
  const [selected, setSelected] = useState(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  // 지도 범위 필터
  const [mapBounds, setMapBounds] = useState(null);
  const [boundsFilter, setBoundsFilter] = useState(false);

  // 맛집 등록
  const [showRegister, setShowRegister] = useState(false);
  const [registerQuery, setRegisterQuery] = useState('');
  const [registerResults, setRegisterResults] = useState([]);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registeringId, setRegisteringId] = useState(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const loadList = () => {
    restaurantsApi.list(keyword).then((res) => setList(res.data)).catch(() => {});
  };

  useEffect(() => { loadList(); }, [keyword]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    setKeyword(inputVal.trim());
  };

  const handleSelect = (r) => {
    setSelected(r);
    if (isMobile && sidebarOpen) onSidebarClose();
  };

  // 카카오 Places 검색
  const handlePlaceSearch = (e) => {
    e.preventDefault();
    if (!registerQuery.trim() || !window.kakao?.maps?.services) return;
    setRegisterLoading(true);
    setRegisterResults([]);
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(registerQuery, (result, status) => {
      setRegisterLoading(false);
      if (status === window.kakao.maps.services.Status.OK) {
        setRegisterResults(result.slice(0, 5));
      }
    }, { category_group_code: '' }); // 음식점 전체
  };

  const handleRegister = async (place) => {
    if (!isLoggedIn) return alert('로그인이 필요합니다.');
    setRegisteringId(place.id);
    try {
      await restaurantsApi.create({
        kakaoPlaceId: place.id,
        name: place.place_name,
        address: place.road_address_name || place.address_name,
        category: mapCategory(place.category_name),
        lat: parseFloat(place.y),
        lng: parseFloat(place.x),
      });
      loadList();
      setShowRegister(false);
      setRegisterQuery('');
      setRegisterResults([]);
    } catch (err) {
      if (err.response?.status === 409) alert('이미 등록된 맛집입니다.');
      else alert('등록 실패. 다시 시도해주세요.');
    } finally {
      setRegisteringId(null);
    }
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
          <form onSubmit={handleSearch}>
            <input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="음식 종류나 식당 이름 검색..."
              className="w-full border-b border-gray-300 pb-3 text-[13px] bg-transparent outline-none placeholder-gray-400 focus:border-black transition-colors"
            />
          </form>
        </div>

        {/* 카테고리 + 등록 버튼 */}
        <div className="px-6 pb-3 flex items-center gap-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-none flex-nowrap flex-1 min-w-0">
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
          {/* 맛집 등록 버튼 */}
          <button
            onClick={() => setShowRegister((v) => !v)}
            title="카카오 검색으로 맛집 등록"
            className={`flex-shrink-0 w-7 h-7 border flex items-center justify-center text-[16px] transition-colors ${
              showRegister ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-400 hover:border-black hover:text-black'
            }`}
          >
            +
          </button>
        </div>

        {/* 지도 범위 필터 토글 */}
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

        {/* 카카오 검색 등록 패널 */}
        {showRegister && (
          <div className="mx-6 mb-4 border border-gray-200 p-4">
            <p className="text-[11px] text-gray-400 mb-3 tracking-wider">카카오 검색으로 맛집 등록</p>
            <form onSubmit={handlePlaceSearch} className="flex gap-2 mb-3">
              <input
                value={registerQuery}
                onChange={(e) => setRegisterQuery(e.target.value)}
                placeholder="장소 이름 검색..."
                className="flex-1 border-b border-gray-300 pb-1.5 text-[12px] bg-transparent outline-none placeholder-gray-400 focus:border-black transition-colors min-w-0"
              />
              <button
                type="submit"
                disabled={registerLoading}
                className="text-[11px] px-3 py-1 bg-black text-white disabled:opacity-50 flex-shrink-0"
              >
                {registerLoading ? '…' : '검색'}
              </button>
            </form>

            {registerResults.length > 0 && (
              <div className="space-y-px">
                {registerResults.map((place) => (
                  <div key={place.id} className="flex items-start justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
                    <div className="min-w-0">
                      <p className="text-[12px] font-medium text-black truncate">{place.place_name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{place.road_address_name || place.address_name}</p>
                    </div>
                    <button
                      onClick={() => handleRegister(place)}
                      disabled={registeringId === place.id}
                      className="flex-shrink-0 text-[10px] border border-gray-300 px-2 py-1 hover:border-black transition-colors disabled:opacity-50"
                    >
                      {registeringId === place.id ? '…' : '등록'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 맛집 리스트 */}
        <div className="flex-1 overflow-y-auto border-t border-gray-200 scrollbar-none">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2">
              <p className="text-xs text-gray-400">
                {boundsFilter ? '지도 영역 내 맛집이 없습니다' : '검색 결과가 없습니다'}
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
