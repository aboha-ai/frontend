const API_KEY = "AIzaSyBQ6n3ZpaQ8ocsvrog1CqgZBJW1ilgj5Lg";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

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
                text: `다음 정보를 JSON 형식으로 반환해 주세요:
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
                            "photoUrl": "이미지 URL",
                            "location": {"lat": 위도, "lng": 경도}
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
                            "photoUrl": "이미지 URL",
                            "location": {"lat": 위도, "lng": 경도}
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
                            "photoUrl": "이미지 URL",
                            "location": {"lat": 위도, "lng": 경도}
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
    console.log(`📌 ${category} 장소:`, place);

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
      <button onclick='showLocation(${JSON.stringify(
        sanitizedPlace.location
      )})' 
              class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <i class="fas fa-map-marker-alt"></i>
      </button>
    `;

    contentContainer.appendChild(placeElement);
  });
}

window.onload = async () => {
  // 1. 먼저 관광지 데이터를 로드
  await updateContent("관광지");

  // 2. Google Maps API에서 initMap 호출
  if (window.initMap) {
    initMap();
  } else {
    console.error("❌ initMap 함수가 정의되지 않았습니다.");
  }
};
