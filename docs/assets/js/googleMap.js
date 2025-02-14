let map;

function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 37.5665, lng: 126.978 }, // 서울 좌표
    zoom: 12,
  });

  new google.maps.Marker({
    position: { lat: 37.5665, lng: 126.978 },
    map,
    title: "서울",
  });
}

// 전역에서 호출할 수 있도록 등록
window.initMap = initMap;

window.showLocation = function (location) {
  if (!map) {
    console.error("❌ Google Map is not initialized!");
    return;
  }

  const marker = new google.maps.Marker({
    position: location,
    map: map,
    animation: google.maps.Animation.DROP,
  });

  map.setCenter(location);
  map.setZoom(14);
};
