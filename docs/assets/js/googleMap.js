let map;

// Google Map 초기화
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 37.5665, lng: 126.978 }, // 서울 좌표
    zoom: 12,
  });
}

// 마커를 클릭했을 때 장소 정보를 표시
window.showLocation = function (location, name) {
  if (!map) {
    console.error("❌ Google Map is not initialized!");
    return;
  }

  // 기존 마커 제거
  const marker = new google.maps.Marker({
    position: location,
    map: map,
    animation: google.maps.Animation.DROP,
    title: name || "이 장소", // 마커에 표시될 제목
  });

  // 지도 중앙을 클릭한 장소로 이동
  map.setCenter(location);
  map.setZoom(14);

  // 구글 장소 검색 서비스
  const service = new google.maps.places.PlacesService(map);
  const request = {
    location: location,
    radius: 500, // 반경 500m 이내에서 검색
  };

  // 장소 검색 - 반경 내의 장소 검색
  service.nearbySearch(request, function (results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // 검색 결과로 첫 번째 장소 표시
      const result = results[0];
      const infoWindow = new google.maps.InfoWindow({
        content: `<div><strong>${result.name}</strong><br>${result.vicinity}</div>`,
      });

      // 마커 클릭 시 정보 창을 표시하도록 설정
      marker.addListener("click", function () {
        infoWindow.open(map, marker);
      });
    } else {
      console.error("❌ 구글 장소 검색 실패:", status);
    }
  });
};
