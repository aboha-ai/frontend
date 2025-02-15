const GEO_API_KEY = "AIzaSyAuQhWQkZgxQeWiDVO0aklq91W00amtJUI"; // Geocoding API 키
const API_KEY = "AIzaSyBQ6n3ZpaQ8ocsvrog1CqgZBJW1ilgj5Lg";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
const GEO_API_URL = "https://maps.googleapis.com/maps/api/geocode/json"; // Geocoding API URL

// null 값을 'null' 문자열로 변환하고, 값이 null인 키는 출력하지 않도록 처리
function sanitizeObject(obj) {
  const sanitizedObj = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] === null) {
      sanitizedObj[key] = "null";
    } else if (obj[key]) {
      sanitizedObj[key] = obj[key];
    }
  });
  return sanitizedObj;
}

// Geocoding API를 사용해 장소 이름으로 위도/경도 가져오기
async function fetchGeolocationFromName(name) {
  console.log("📌 Geocoding API에 전달된 장소 이름:", name); // 전달된 name 값 확인

  const geocodingAPIUrl = `${GEO_API_URL}?address=${encodeURIComponent(
    name
  )}&key=${GEO_API_KEY}`;
  const response = await fetch(geocodingAPIUrl);
  const data = await response.json();
  console.log("📌 Geocoding API 응답:", data); // 응답 내용 확인

  if (data.status === "OK") {
    const location = data.results[0].geometry.location;
    return { lat: location.lat, lng: location.lng };
  } else {
    console.error(`❌ Geocoding API 오류: ${data.status}`);
    throw new Error("장소를 찾을 수 없습니다.");
  }
}

async function fetchTouristData() {
  const storedData = localStorage.getItem("touristData");

  if (storedData) {
    console.log("📌 로컬 스토리지에서 데이터 로드");
    return JSON.parse(storedData);
  }

  try {
    console.log("🌐 API 호출 실행...");
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `현지인이 자주 가고 풍경 위주의 평화로운 여행을 원하는 사람이 갈만한 "country" 의 "city" 에 있는 "hotel", "restaurants", "touristSpot"를 JSON 형식으로 각각 5개씩 총 15개를 반환해 주세요:
                {
                    "hotels": [
                        {
                            "name": "이름",
                            "link": "웹사이트 URL",
                            "price": "1박 가격",
                            "address": "상세 주소",
                            "country": "국가",
                            "city": "도시",
                            "description": "설명",
                            "hours": "체크인/체크아웃 시간",
                            "photoUrl": "이미지 URL"
                        }
                    ],
                    "restaurants": [
                        {
                            "name": "이름",
                            "link": "웹사이트 URL",
                            "price": "평균 가격",
                            "address": "상세 주소",
                            "country": "국가",
                            "city": "도시",
                            "description": "설명",
                            "hours": "운영 시간",
                            "photoUrl": "이미지 URL"
                        }
                    ],
                    "touristSpots": [
                        {
                            "name": "이름",
                            "link": "웹사이트 URL",
                            "price": "입장료",
                            "address": "상세 주소",
                            "country": "국가",
                            "city": "도시",
                            "description": "설명",
                            "hours": "운영 시간",
                            "photoUrl": "이미지 URL"
                        }
                    ]
                }`,
              },
            ],
          },
        ],
        generationConfig: { response_mime_type: "application/json" },
      }),
    });

    if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

    const jsonResponse = await response.json();
    const rawData = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawData) throw new Error("No response from Gemini API");

    const parsedData = JSON.parse(rawData);

    console.log("✅ API 데이터 저장:", parsedData);

    // ✅ **카테고리를 수작업으로 할당**
    parsedData.hotels.forEach((hotel) => (hotel.category = "호텔"));
    parsedData.restaurants.forEach(
      (restaurant) => (restaurant.category = "식당")
    );
    parsedData.touristSpots.forEach((spot) => (spot.category = "관광지"));

    localStorage.setItem("touristData", JSON.stringify(parsedData));
    return parsedData;
  } catch (error) {
    console.error("❌ API 요청 실패:", error);
    return { hotels: [], restaurants: [], touristSpots: [] };
  }
}

async function updateContent(category) {
  const { hotels, restaurants, touristSpots } = await fetchTouristData();
  const dataMap = {
    호텔: hotels,
    식당: restaurants,
    관광지: touristSpots,
  };

  console.log(`📌 ${category} 데이터:`, dataMap[category]);

  const contentContainer = document.getElementById(`${category}-content`);
  contentContainer.innerHTML = ""; // 기존 내용 초기화

  dataMap[category].forEach((place) => {
    console.log(`📌 ${category} 장소:`, place); // 장소 객체 전체 출력
    console.log(`📌 장소 이름: ${place.name}`); // 이름만 출력

    // sanitize the place object to handle null values
    const sanitizedPlace = sanitizeObject(place);

    const placeElement = document.createElement("div");
    placeElement.classList.add(
      "flex",
      "gap-4",
      "p-4",
      "border-b",
      "border-gray-200"
    );

    placeElement.innerHTML = `
      <div class="flex-1">
          <h3 class="font-medium">${sanitizedPlace.name || "null"}</h3>
          <div class="text-sm text-gray-600">
              <i class="fas fa-clock text-blue-400"></i> ${
                sanitizedPlace.hours || "운영 시간 정보 없음"
              }
              <span class="ml-2 text-green-500">${
                sanitizedPlace.price || "무료"
              }</span>
          </div>
      </div>
      <button onclick='handleMarkerClick("${sanitizedPlace.name}")' 
              class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <i class="fas fa-map-marker-alt"></i>
      </button>
    `;

    contentContainer.appendChild(placeElement);
  });
}

async function handleMarkerClick(name) {
  console.log("📌 클릭된 장소 이름:", name); // name 값 확인

  try {
    const location = await fetchGeolocationFromName(name);
    console.log("📌 위치 정보:", location);

    if (window.initMap) {
      initMap(location); // 위치 정보를 initMap 함수로 전달
    } else {
      console.error("❌ initMap 함수가 정의되지 않았습니다.");
    }
  } catch (error) {
    console.error("❌ 위치를 찾을 수 없습니다:", error);
    alert("위치를 찾을 수 없습니다. 장소 이름을 다시 확인해 주세요.");
  }
}

// initMap 함수 구현: 구글 맵을 초기화하고, 마커를 지도에 추가하는 기능을 담당
function initMap(location) {
  // 지도 초기화: 지도 중심을 전달된 위치로 설정
  const map = new google.maps.Map(document.getElementById("map"), {
    center: location,
    zoom: 14,
  });

  // 마커 생성: 클릭한 장소의 위치에 마커를 추가
  const marker = new google.maps.Marker({
    position: location,
    map: map,
    title: "클릭된 장소",
  });

  // 마커 클릭 시 상세 정보 표시할 수 있게 추가
  const infoWindow = new google.maps.InfoWindow({
    content: `<h4>${marker.title}</h4>`,
  });

  marker.addListener("click", function () {
    infoWindow.open(map, marker);
  });
}

window.onload = async () => {
  // 1. 먼저 관광지 데이터를 로드
  await updateContent("관광지");
};
