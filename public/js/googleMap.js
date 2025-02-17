let map;
let currentMarker = null;

// 장소를 클릭할 때 호출되는 함수
async function handleMarkerClick(event) {
  const name = event.target.name;
  const address = event.target.address;
  const country = event.target.country;

  const location = await fetchGeolocationFromDetails(name, address, country);
  if (location) {
    console.log(`위치 정보: ${location.lat}, ${location.lng}`);
    showLocation(location); // 위치 정보가 정상적으로 받아지면 지도 업데이트
  } else {
    console.log("위치 정보를 찾을 수 없습니다.");
  }
}

// 위치를 지도에 표시하는 함수
async function showLocation(location) {
  try {
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
    alert("위치 정보를 로딩할 수 없습니다. 다시 시도해 주세요.");
  }
}

// 장소 이름, 주소, 국가를 위도/경도로 변환하는 함수
async function geocodeByDetails(location) {
  const geocoder = new google.maps.Geocoder();
  const { name, address, country } = location;

  const fullAddress = `${name || ""} ${address || ""} ${country || ""}`.trim();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ address: fullAddress }, (results, status) => {
      if (status === "OK" && results.length > 0) {
        const geoLocation = results[0].geometry.location;
        resolve({
          lat: geoLocation.lat(),
          lng: geoLocation.lng(),
        });
      } else {
        reject(`Geocode failed: ${status} - 장소를 찾을 수 없습니다.`);
      }
    });
  });
}

async function getApiKey() {
  try {
    const response = await fetch("/api/maps-key");
    const data = await response.json();
    return data.key;
  } catch (error) {
    console.error("Error fetching API Key:", error);
    return null;
  }
}

async function loadGoogleMapsScript() {
  const apiKey = await getApiKey(); // Wait for the key

  if (!apiKey) {
    console.error("No API key available. Stopping map initialization.");
    return;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

window.initMap = async function () {
  try {
    await loadGoogleMapsScript(); // API Key and Script loading

    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 37.5665, lng: 126.978 }, // 기본 위치
      zoom: 12,
    });

    // 예시로, 마커를 생성하고 클릭 이벤트 추가
    const marker = new google.maps.Marker({
      position: { lat: 37.5665, lng: 126.978 },
      map: map,
      title: "Victoria Peak",
    });

    // 마커 클릭 시 handleMarkerClick 함수 호출
    marker.addListener("click", handleMarkerClick);
  } catch (error) {
    console.error("Map initialization error:", error);
  }
};
