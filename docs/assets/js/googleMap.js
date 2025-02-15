let map;
let currentMarker = null; // 현재 표시된 마커를 저장할 변수

// Google Map 초기화
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 37.5665, lng: 126.978 }, // 서울 좌표
    zoom: 12,
  });
}

// 위치 정보가 제공되었을 때 해당 위치로 지도와 마커 업데이트
async function showLocation(location) {
  try {
    // location에 위도(lat)와 경도(lng)가 없다면, name으로 검색
    if (!location.lat || !location.lng) {
      if (location.name) {
        const geolocation = await geocodeByName(location.name); // 이름으로 검색
        location = { ...location, ...geolocation };
      } else {
        console.error("장소 이름이 제공되지 않았습니다.");
        return;
      }
    }

    console.log("위치 정보:", location);

    // 지도 중심 업데이트
    map.setCenter(location);

    // 기존 마커가 있으면 삭제하고 새로운 마커 추가
    if (currentMarker) {
      currentMarker.setMap(null); // 기존 마커 삭제
      currentMarker = null; // 마커를 null로 설정
    }

    // 새로운 마커 생성
    currentMarker = new google.maps.Marker({
      position: location,
      map: map,
    });
  } catch (error) {
    console.error("위치 정보 로딩 실패:", error);
  }
}

// 장소 이름을 위도/경도로 변환하는 함수
async function geocodeByName(name) {
  const geocoder = new google.maps.Geocoder();
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address: name }, (results, status) => {
      if (status === "OK" && results.length > 0) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        reject(`Geocode failed: ${status} - 장소를 찾을 수 없습니다.`);
      }
    });
  });
}
