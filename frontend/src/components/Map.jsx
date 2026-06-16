import { useEffect, useRef } from 'react';

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;

export default function Map({ restaurants = [], onMarkerClick, onBoundsChange, flyTo }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const clustererRef = useRef(null);
  const markersRef = useRef([]);
  const myLocationRef = useRef(null);

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
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 7,
        });
        mapRef.current = map;

        // 마커 클러스터러
        clustererRef.current = new window.kakao.maps.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 7,
          gridSize: 60,
          minClusterSize: 2,
        });

        // idle 이벤트 → 지도 범위 전달
        window.kakao.maps.event.addListener(map, 'idle', () => {
          const bounds = map.getBounds();
          const sw = bounds.getSouthWest();
          const ne = bounds.getNorthEast();
          onBoundsChangeRef.current?.({
            sw: { lat: sw.getLat(), lng: sw.getLng() },
            ne: { lat: ne.getLat(), lng: ne.getLng() },
          });
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
