import { useEffect, useRef } from 'react';

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;

const SELECTED_MARKER_SRC = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='38' viewBox='0 0 28 38'%3E%3Cpath d='M14 0C6.3 0 0 6.3 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.3 21.7 0 14 0z' fill='%23000'/%3E%3Ccircle cx='14' cy='14' r='5' fill='%23fff'/%3E%3C/svg%3E";

// 페이지 이동 후 돌아와도 마지막 지도 위치 복원
const mapStateCache = { lat: 37.5665, lng: 126.9780, level: 7 };

export default function Map({ restaurants = [], onMarkerClick, onBoundsChange, flyTo, selectedRestaurant }) {
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
  useEffect(() => { restaurantsRef.current = restaurants; });
  useEffect(() => { onMarkerClickRef.current = onMarkerClick; });
  useEffect(() => { onBoundsChangeRef.current = onBoundsChange; });

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

        // 지도 빈 곳 클릭 → 말풍선 닫기
        window.kakao.maps.event.addListener(map, 'click', () => {
          infoOverlayRef.current?.setMap(null);
          infoOverlayRef.current = null;
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

    const markers = list
      .filter((r) => r.lat && r.lng)
      .map((r) => {
        const marker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(r.lat, r.lng),
          title: r.name,
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
