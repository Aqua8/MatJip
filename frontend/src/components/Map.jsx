import { useEffect, useRef } from 'react';

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;

// 일반 마커: 검정 핀 (22×30)
const NORMAL_MARKER_SRC = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='30' viewBox='0 0 22 30'%3E%3Cpath d='M11 0C4.9 0 0 4.9 0 11c0 8.25 11 19 11 19s11-10.75 11-19C22 4.9 17.1 0 11 0z' fill='%23000'/%3E%3C/svg%3E";
// 내 즐겨찾기 마커: 검정 핀 + 흰 별 (24×33)
const BOOKMARK_MARKER_SRC = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='33' viewBox='0 0 24 33'%3E%3Cpath d='M12 0C5.4 0 0 5.4 0 12c0 9 12 21 12 21s12-12 12-21C24 5.4 18.6 0 12 0z' fill='%23000'/%3E%3Cpolygon points='12,5 13.9,10.5 19.7,10.5 15.1,13.8 16.9,19.3 12,16 7.1,19.3 8.9,13.8 4.3,10.5 10.1,10.5' fill='white'/%3E%3C/svg%3E";
// 선택된 마커: 흰 원 있는 큰 검정 핀 (28×38)
const SELECTED_MARKER_SRC = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='38' viewBox='0 0 28 38'%3E%3Cpath d='M14 0C6.3 0 0 6.3 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.3 21.7 0 14 0z' fill='%23000'/%3E%3Ccircle cx='14' cy='14' r='5' fill='%23fff'/%3E%3C/svg%3E";

// 페이지 이동 후 돌아와도 마지막 지도 위치 복원
const mapStateCache = { lat: 37.5665, lng: 126.9780, level: 7 };

export default function Map({ restaurants = [], bookmarkedIds, onMarkerClick, onBoundsChange, flyTo, selectedRestaurant, onPoiClick, onMapBlankClick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const clustererRef = useRef(null);
  const markersRef = useRef([]);
  const myLocationRef = useRef(null);
  const selectedMarkerRef = useRef(null);
  const infoOverlayRef = useRef(null);

  // 콜백/데이터를 ref로 유지해서 stale closure 방지
  const restaurantsRef = useRef(restaurants);
  const onMarkerClickRef = useRef(onMarkerClick);
  const onBoundsChangeRef = useRef(onBoundsChange);
  const onPoiClickRef = useRef(onPoiClick);
  const onMapBlankClickRef = useRef(onMapBlankClick);
  const bookmarkedIdsRef = useRef(bookmarkedIds);
  useEffect(() => { restaurantsRef.current = restaurants; });
  useEffect(() => { onMarkerClickRef.current = onMarkerClick; });
  useEffect(() => { onBoundsChangeRef.current = onBoundsChange; });
  useEffect(() => { onPoiClickRef.current = onPoiClick; });
  useEffect(() => { onMapBlankClickRef.current = onMapBlankClick; });
  useEffect(() => { bookmarkedIdsRef.current = bookmarkedIds; });

  useEffect(() => {
    if (!KAKAO_APP_KEY) return;

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false&libraries=services,clusterer`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const map = new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(mapStateCache.lat, mapStateCache.lng),
          level: mapStateCache.level,
        });
        mapRef.current = map;

        // 마커 클러스터러 (minLevel 높여서 기본 뷰에서 개별 마커 클릭 가능하게)
        clustererRef.current = new window.kakao.maps.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 10,
          gridSize: 60,
          minClusterSize: 3,
        });

        // idle 이벤트 → 위치 캐시 저장 + 지도 범위 전달
        window.kakao.maps.event.addListener(map, 'idle', () => {
          const center = map.getCenter();
          mapStateCache.lat = center.getLat();
          mapStateCache.lng = center.getLng();
          mapStateCache.level = map.getLevel();

          const bounds = map.getBounds();
          const sw = bounds.getSouthWest();
          const ne = bounds.getNorthEast();
          onBoundsChangeRef.current?.({
            sw: { lat: sw.getLat(), lng: sw.getLng() },
            ne: { lat: ne.getLat(), lng: ne.getLng() },
          });
        });

        // 지도 클릭 → 말풍선 닫기 + 반경 20m 음식점/카페 POI 검색
        const ps = new window.kakao.maps.services.Places();
        window.kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
          infoOverlayRef.current?.setMap(null);
          infoOverlayRef.current = null;

          if (!onPoiClickRef.current) return;
          // FD6=음식점, CE7=카페 순서로 검색 (FD6 결과 있으면 CE7 스킵)
          const opts = { location: mouseEvent.latLng, radius: 20, sort: window.kakao.maps.services.SortBy.DISTANCE };
          ps.categorySearch('FD6', (results, status) => {
            if (status === window.kakao.maps.services.Status.OK && results.length > 0) {
              onPoiClickRef.current?.(results[0]);
              return;
            }
            ps.categorySearch('CE7', (r2, s2) => {
              if (s2 === window.kakao.maps.services.Status.OK && r2.length > 0) {
                onPoiClickRef.current?.(r2[0]);
              } else {
                // 주변에 식당/카페 없음 → 빈 곳 클릭으로 간주
                onMapBlankClickRef.current?.();
              }
            }, opts);
          }, opts);
        });

        // 현위치
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(({ coords }) => {
            const pos = new window.kakao.maps.LatLng(coords.latitude, coords.longitude);
            map.setCenter(pos);
            const el = document.createElement('div');
            el.style.cssText = [
              'width:16px', 'height:16px', 'background:#4285f4',
              'border-radius:50%', 'border:3px solid #fff',
              'box-shadow:0 0 0 3px rgba(66,133,244,0.35)',
            ].join(';');
            myLocationRef.current = new window.kakao.maps.CustomOverlay({
              map, position: pos, content: el, zIndex: 10,
            });
          }, () => {});
        }

        setMarkers(map, restaurantsRef.current);
      });
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
      mapRef.current = null;
      clustererRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) setMarkers(mapRef.current, restaurants);
  }, [restaurants]);

  useEffect(() => {
    if (mapRef.current) setMarkers(mapRef.current, restaurantsRef.current);
  }, [bookmarkedIds]);

  useEffect(() => {
    if (flyTo && mapRef.current) {
      mapRef.current.panTo(new window.kakao.maps.LatLng(flyTo.lat, flyTo.lng));
    }
  }, [flyTo]);

  // selectedRestaurant 없어지면 말풍선도 닫기
  useEffect(() => {
    if (!selectedRestaurant) {
      infoOverlayRef.current?.setMap(null);
      infoOverlayRef.current = null;
    }
  }, [selectedRestaurant]);

  // 선택된 식당 강조 마커
  useEffect(() => {
    if (!mapRef.current || !window.kakao?.maps) return;
    selectedMarkerRef.current?.setMap(null);
    selectedMarkerRef.current = null;

    if (selectedRestaurant?.lat && selectedRestaurant?.lng) {
      const image = new window.kakao.maps.MarkerImage(
        SELECTED_MARKER_SRC,
        new window.kakao.maps.Size(28, 38),
        { offset: new window.kakao.maps.Point(14, 38) }
      );
      selectedMarkerRef.current = new window.kakao.maps.Marker({
        map: mapRef.current,
        position: new window.kakao.maps.LatLng(selectedRestaurant.lat, selectedRestaurant.lng),
        image,
        zIndex: 10,
      });
    }
  }, [selectedRestaurant]);

  function setMarkers(map, list) {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    clustererRef.current?.clear();

    const normalImage = new window.kakao.maps.MarkerImage(
      NORMAL_MARKER_SRC,
      new window.kakao.maps.Size(22, 30),
      { offset: new window.kakao.maps.Point(11, 30) }
    );
    const bookmarkImage = new window.kakao.maps.MarkerImage(
      BOOKMARK_MARKER_SRC,
      new window.kakao.maps.Size(24, 33),
      { offset: new window.kakao.maps.Point(12, 33) }
    );

    const markers = list
      .filter((r) => r.lat && r.lng)
      .map((r) => {
        const isMine = bookmarkedIdsRef.current?.has(r.kakaoPlaceId);
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(r.lat, r.lng),
          title: r.name,
          image: isMine ? bookmarkImage : normalImage,
        });
        window.kakao.maps.event.addListener(marker, 'click', () => {
          // 이전 말풍선 제거
          infoOverlayRef.current?.setMap(null);

          // 말풍선 생성
          const card = document.createElement('div');
          card.style.cssText = 'padding-bottom:44px;position:relative;cursor:pointer;';
          const rating = r.avgRating ? `<span style="font-size:11px;color:#6b7280;margin-left:4px;">★ ${Number(r.avgRating).toFixed(1)}</span>` : '';
          card.innerHTML = `
            <div style="background:#fff;border:1px solid #e5e7eb;padding:10px 14px;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,0.1);position:relative;min-width:120px;">
              <div style="font-weight:700;font-size:13px;color:#000;margin-bottom:3px;">${r.name}</div>
              <div style="display:flex;align-items:center;gap:4px;">
                <span style="font-size:11px;color:#9ca3af;">${r.category}</span>${rating}
              </div>
              <div style="position:absolute;bottom:-7px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:7px solid #e5e7eb;"></div>
              <div style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid #fff;"></div>
            </div>
          `;

          infoOverlayRef.current = new window.kakao.maps.CustomOverlay({
            map: mapRef.current,
            position: marker.getPosition(),
            content: card,
            yAnchor: 1,
            zIndex: 5,
          });

          onMarkerClickRef.current?.(r);
        });
        return marker;
      });

    markersRef.current = markers;
    clustererRef.current?.addMarkers(markers);
  }

  const moveToMyLocation = () => {
    if (!mapRef.current) return;
    if (myLocationRef.current) {
      mapRef.current.panTo(myLocationRef.current.getPosition());
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        mapRef.current?.panTo(new window.kakao.maps.LatLng(coords.latitude, coords.longitude));
      }, () => {});
    }
  };

  if (!KAKAO_APP_KEY) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        카카오맵 API 키가 필요합니다 (VITE_KAKAO_APP_KEY)
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {/* 현재 위치 버튼 */}
      <button
        onClick={moveToMyLocation}
        title="현재 위치로 이동"
        className="absolute bottom-5 right-5 z-10 w-10 h-10 bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="2" x2="12" y2="7" />
          <line x1="12" y1="17" x2="12" y2="22" />
          <line x1="2" y1="12" x2="7" y2="12" />
          <line x1="17" y1="12" x2="22" y2="12" />
        </svg>
      </button>
    </div>
  );
}
