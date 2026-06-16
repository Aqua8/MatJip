# 카카오맵 JavaScript API 레퍼런스

> 공식 문서: https://apis.map.kakao.com/web/guide/
> 샘플 코드: https://apis.map.kakao.com/web/sample/
> API 문서: https://apis.map.kakao.com/web/documentation/

---

## 초기 설정

### SDK 로드

```html
<!-- 기본 -->
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KEY"></script>

<!-- 라이브러리 포함 (services: 검색/주소변환, clusterer: 마커 클러스터, drawing: 도형 그리기) -->
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KEY&libraries=services,clusterer,drawing"></script>

<!-- autoload=false: 스크립트 로드 후 수동으로 kakao.maps.load() 호출 (React 등 SPA에서 사용) -->
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KEY&autoload=false"></script>
```

### React에서 동적 로드 (현재 프로젝트 방식)

```js
const script = document.createElement('script');
script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KEY}&autoload=false`;
script.onload = () => {
  window.kakao.maps.load(() => {
    // 지도 초기화
  });
};
document.head.appendChild(script);
```

---

## 지도 (Map)

### 생성

```js
const container = document.getElementById('map');
const options = {
  center: new kakao.maps.LatLng(37.5665, 126.9780), // 위도, 경도
  level: 3, // 확대 레벨 (1~14, 숫자 클수록 넓게)
};
const map = new kakao.maps.Map(container, options);
```

### 주요 메서드

| 메서드 | 설명 |
|--------|------|
| `setCenter(latlng)` | 지도 중심 이동 |
| `getCenter()` | 현재 중심 좌표 반환 |
| `setLevel(level)` | 확대 레벨 변경 |
| `getLevel()` | 현재 레벨 반환 |
| `setBounds(bounds)` | 특정 영역이 보이도록 레벨/중심 자동 조정 |
| `getBounds()` | 현재 화면 영역(LatLngBounds) 반환 |
| `panTo(latlng)` | 부드럽게 이동 |
| `panBy(dx, dy)` | 픽셀 단위로 이동 |
| `setDraggable(bool)` | 드래그 이동 활성/비활성 |
| `setZoomable(bool)` | 확대/축소 활성/비활성 |
| `setMapTypeId(typeId)` | 지도 타입 변경 |
| `addControl(control, position)` | 컨트롤 추가 |
| `relayout()` | 컨테이너 크기 변경 후 재렌더링 |

### 이벤트

```js
kakao.maps.event.addListener(map, 'click', (mouseEvent) => {
  const latlng = mouseEvent.latLng;
});
```

| 이벤트 | 발생 시점 |
|--------|----------|
| `click` | 클릭 |
| `dblclick` | 더블클릭 |
| `rightclick` | 우클릭 |
| `mousemove` | 마우스 이동 |
| `dragstart` / `dragend` | 드래그 시작/종료 |
| `zoom_changed` | 확대 레벨 변경 |
| `center_changed` | 중심 좌표 변경 |
| `bounds_changed` | 화면 영역 변경 |
| `idle` | 지도 이동/확대 완료 후 정지 |
| `tilesloaded` | 타일 로드 완료 |

### 지도 타입 상수

```js
kakao.maps.MapTypeId.ROADMAP    // 일반 지도
kakao.maps.MapTypeId.SKYVIEW    // 스카이뷰
kakao.maps.MapTypeId.HYBRID     // 하이브리드 (스카이뷰 + 도로명)
kakao.maps.MapTypeId.TRAFFIC    // 교통정보 오버레이
kakao.maps.MapTypeId.TERRAIN    // 지형도 오버레이
kakao.maps.MapTypeId.BICYCLE    // 자전거도로 오버레이
```

### 컨트롤

```js
// 지도 타입 컨트롤
const mapTypeControl = new kakao.maps.MapTypeControl();
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

// 줌 컨트롤
const zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
```

**ControlPosition 상수:** `TOP`, `TOPLEFT`, `TOPRIGHT`, `LEFT`, `RIGHT`, `BOTTOMLEFT`, `BOTTOM`, `BOTTOMRIGHT`

---

## 좌표 (Coordinate)

### LatLng

```js
const latlng = new kakao.maps.LatLng(37.5665, 126.9780);
latlng.getLat();  // 위도
latlng.getLng();  // 경도
```

### LatLngBounds — 지도 영역

```js
const bounds = new kakao.maps.LatLngBounds();
bounds.extend(new kakao.maps.LatLng(37.5, 126.9));
bounds.extend(new kakao.maps.LatLng(37.6, 127.0));
map.setBounds(bounds); // 해당 영역이 모두 보이도록 자동 조정

bounds.getSouthWest(); // 남서쪽 좌표
bounds.getNorthEast(); // 북동쪽 좌표
bounds.contain(latlng); // 좌표 포함 여부
```

---

## 마커 (Marker)

### 기본 마커

```js
const marker = new kakao.maps.Marker({
  position: new kakao.maps.LatLng(37.5665, 126.9780),
  map: map,         // 바로 지도에 표시
  title: '툴팁 텍스트',
  draggable: false,
  clickable: true,
  zIndex: 3,
  opacity: 1.0,
});

marker.setMap(map);  // 지도에 표시
marker.setMap(null); // 지도에서 제거
```

### 커스텀 이미지 마커

```js
const imageSrc = '/images/marker.png';
const imageSize = new kakao.maps.Size(64, 69);
const imageOption = { offset: new kakao.maps.Point(27, 69) }; // 마커 기준점

const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

const marker = new kakao.maps.Marker({
  position: latlng,
  image: markerImage,
});
```

### 마커 이벤트

```js
kakao.maps.event.addListener(marker, 'click', () => { /* 클릭 */ });
kakao.maps.event.addListener(marker, 'mouseover', () => { /* 마우스 오버 */ });
kakao.maps.event.addListener(marker, 'mouseout', () => { /* 마우스 아웃 */ });
kakao.maps.event.addListener(marker, 'dragend', () => {
  const pos = marker.getPosition(); // 이동 후 좌표
});
```

### 주요 메서드

| 메서드 | 설명 |
|--------|------|
| `setPosition(latlng)` | 위치 변경 |
| `getPosition()` | 현재 위치 반환 |
| `setImage(markerImage)` | 이미지 변경 |
| `setVisible(bool)` | 표시/숨김 |
| `setDraggable(bool)` | 드래그 가능 여부 |
| `setZIndex(n)` | 레이어 순서 |
| `setOpacity(0~1)` | 투명도 |

---

## 인포윈도우 (InfoWindow)

```js
const infowindow = new kakao.maps.InfoWindow({
  content: '<div style="padding:5px;">안녕하세요</div>',
  removable: true, // X 버튼 표시
});

infowindow.open(map, marker); // 마커 위에 표시
infowindow.open(map);          // 지도 특정 위치에 표시 (position 옵션 필요)
infowindow.close();
infowindow.setContent('<div>새 내용</div>');
```

---

## 커스텀 오버레이 (CustomOverlay)

인포윈도우보다 자유로운 HTML/CSS 표현 가능.

```js
const overlay = new kakao.maps.CustomOverlay({
  position: latlng,
  content: '<div class="custom-overlay">내용</div>',
  map: map,
  yAnchor: 1.0, // 기준점 (0~1, 1=하단)
  zIndex: 3,
  clickable: true,
});

overlay.setMap(map);
overlay.setMap(null);
overlay.setVisible(false);
```

---

## 도형 (Shapes)

### 폴리라인 (선)

```js
const polyline = new kakao.maps.Polyline({
  map: map,
  path: [
    new kakao.maps.LatLng(37.56, 126.97),
    new kakao.maps.LatLng(37.57, 126.98),
  ],
  strokeWeight: 3,
  strokeColor: '#000000',
  strokeOpacity: 0.7,
  strokeStyle: 'solid', // 'solid' | 'shortdash' | 'dot' | 'dashdot' 등
});

polyline.getLength(); // 실제 거리(m) 반환
```

### 폴리곤 (면)

```js
const polygon = new kakao.maps.Polygon({
  map: map,
  path: [ /* LatLng 배열 */ ],
  strokeWeight: 2,
  strokeColor: '#000',
  strokeOpacity: 0.8,
  fillColor: '#fff',
  fillOpacity: 0.5,
});

polygon.getArea(); // 면적(㎡) 반환
```

### 원 (Circle)

```js
const circle = new kakao.maps.Circle({
  map: map,
  center: latlng,
  radius: 500, // 미터
  strokeWeight: 2,
  strokeColor: '#000',
  fillColor: '#fff',
  fillOpacity: 0.5,
});

circle.getRadius(); // 반경 반환
circle.getBounds(); // 원을 감싸는 LatLngBounds 반환
```

---

## 검색 (Services)

> SDK 로드 시 `&libraries=services` 필요

### 키워드 검색

```js
const places = new kakao.maps.services.Places();

places.keywordSearch('스타벅스 강남', (result, status, pagination) => {
  if (status === kakao.maps.services.Status.OK) {
    result.forEach((place) => {
      console.log(place.place_name, place.x, place.y); // x=경도, y=위도
    });
    pagination.nextPage(); // 다음 페이지
  }
});

// 옵션
places.keywordSearch('카페', callback, {
  location: new kakao.maps.LatLng(37.56, 126.97), // 기준 좌표
  radius: 1000,     // 반경(m)
  sort: kakao.maps.services.SortBy.DISTANCE, // 거리순
  page: 1,
  size: 15,         // 한 페이지 결과 수 (최대 15)
});
```

### 카테고리 검색

```js
// 카테고리 코드: MT1(대형마트) CS2(편의점) PS3(어린이집) SC4(학교) AC5(학원)
// PK6(주차장) OL7(주유소) SW8(지하철역) BK9(은행) CT1(문화시설)
// AG2(중개업소) PO3(공공기관) AT4(관광명소) AD5(숙박) FD6(음식점) CE7(카페) HP8(병원) PM9(약국)
places.categorySearch('FD6', callback, {
  useMapBounds: true, // 현재 지도 화면 내에서 검색
});
```

### 주소 ↔ 좌표 변환

```js
const geocoder = new kakao.maps.services.Geocoder();

// 주소 → 좌표
geocoder.addressSearch('서울 강남구 테헤란로', (result, status) => {
  if (status === kakao.maps.services.Status.OK) {
    const { x, y } = result[0]; // x=경도, y=위도
  }
});

// 좌표 → 주소
geocoder.coord2Address(126.97, 37.56, (result, status) => {
  if (status === kakao.maps.services.Status.OK) {
    console.log(result[0].address.address_name); // 도로명주소
  }
});

// 좌표 → 행정구역 코드
geocoder.coord2RegionCode(126.97, 37.56, (result, status) => {
  console.log(result[0].region_1depth_name); // 시/도
  console.log(result[0].region_2depth_name); // 시/군/구
});
```

### 검색 결과 객체 주요 필드

```js
{
  id: 'place_id',
  place_name: '장소명',
  category_name: '음식점 > 한식',
  category_group_code: 'FD6',
  phone: '02-xxx-xxxx',
  address_name: '지번 주소',
  road_address_name: '도로명 주소',
  x: '126.97', // 경도 (문자열!)
  y: '37.56',  // 위도 (문자열!)
  place_url: 'https://place.map.kakao.com/...',
  distance: '100', // 기준 좌표로부터 거리(m, 문자열)
}
```

---

## 마커 클러스터러 (MarkerClusterer)

> SDK 로드 시 `&libraries=clusterer` 필요

```js
const clusterer = new kakao.maps.MarkerClusterer({
  map: map,
  averageCenter: true,   // 클러스터 중심을 마커들의 평균 좌표로
  minLevel: 10,          // 클러스터링 적용 최소 레벨
  gridSize: 60,          // 클러스터링 반경(px)
  minClusterSize: 2,     // 클러스터 최소 마커 수
  styles: [{             // 클러스터 마커 스타일 (배열: 마커 수에 따라 다른 스타일)
    width: '53px', height: '52px',
    background: 'rgba(0,0,0,.5)',
    color: '#fff',
    textAlign: 'center',
    lineHeight: '54px',
  }],
});

clusterer.addMarkers(markers);       // 마커 배열 추가
clusterer.addMarker(marker);         // 마커 개별 추가
clusterer.removeMarker(marker);      // 마커 제거
clusterer.clear();                   // 전체 초기화

kakao.maps.event.addListener(clusterer, 'clusterclick', (cluster) => {
  // 클러스터 클릭 시 해당 영역으로 확대
  map.setBounds(cluster.getBounds());
});
```

---

## 이벤트 유틸리티

```js
// 이벤트 등록
kakao.maps.event.addListener(target, 'eventName', handler);

// 이벤트 제거
kakao.maps.event.removeListener(target, 'eventName', handler);

// 이벤트 한 번만 실행
kakao.maps.event.addListenerOnce(target, 'eventName', handler);

// 커스텀 이벤트 발생
kakao.maps.event.trigger(target, 'eventName', args);
```

---

## 현재 프로젝트에서 자주 쓸 패턴

### 맛집 마커 + 클릭 이벤트

```js
const marker = new kakao.maps.Marker({
  map,
  position: new kakao.maps.LatLng(restaurant.lat, restaurant.lng),
  title: restaurant.name,
});
kakao.maps.event.addListener(marker, 'click', () => {
  onMarkerClick(restaurant);
});
```

### 현재 지도 영역 내 맛집 필터링

```js
const bounds = map.getBounds();
const visible = restaurants.filter((r) =>
  bounds.contain(new kakao.maps.LatLng(r.lat, r.lng))
);
```

### 마커가 있는 영역으로 지도 자동 맞춤

```js
const bounds = new kakao.maps.LatLngBounds();
restaurants.forEach((r) => bounds.extend(new kakao.maps.LatLng(r.lat, r.lng)));
map.setBounds(bounds);
```

### 키워드 검색 결과로 맛집 등록

```js
const places = new kakao.maps.services.Places();
places.keywordSearch(keyword, (result, status) => {
  if (status !== kakao.maps.services.Status.OK) return;
  const place = result[0];
  // POST /api/restaurants 에 넘길 데이터
  const payload = {
    kakaoPlaceId: place.id,
    name: place.place_name,
    address: place.road_address_name || place.address_name,
    category: place.category_group_name,
    lat: parseFloat(place.y),
    lng: parseFloat(place.x),
  };
});
```

---

## 로드뷰 (Roadview) — 참고

```js
const roadview = new kakao.maps.Roadview(container);
const client = new kakao.maps.RoadviewClient();

client.getNearestPanoId(latlng, 50, (panoId) => {
  roadview.setPanoId(panoId, latlng);
});
```

---

## URL 링크 패턴 (외부 카카오맵 연동)

```
# 지도 바로가기
https://map.kakao.com/link/map/장소명,위도,경도

# 길찾기
https://map.kakao.com/link/to/목적지명,위도,경도

# 장소 상세 (place_id 기반)
https://place.map.kakao.com/{place_id}
```
