import { useEffect, useRef } from 'react';

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_APP_KEY;

export default function Map({ restaurants = [], onMarkerClick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!KAKAO_APP_KEY) return;

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        const map = new window.kakao.maps.Map(containerRef.current, {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 5,
        });
        mapRef.current = map;
        addMarkers(map, restaurants);
      });
    };
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  useEffect(() => {
    if (mapRef.current) addMarkers(mapRef.current, restaurants);
  }, [restaurants]);

  const addMarkers = (map, list) => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    list.forEach((r) => {
      if (!r.lat || !r.lng) return;
      const marker = new window.kakao.maps.Marker({
        map,
        position: new window.kakao.maps.LatLng(r.lat, r.lng),
        title: r.name,
      });
      markersRef.current.push(marker);
      window.kakao.maps.event.addListener(marker, 'click', () => onMarkerClick?.(r));
    });
  };

  if (!KAKAO_APP_KEY) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
        카카오맵 API 키가 필요합니다 (VITE_KAKAO_APP_KEY)
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
}
