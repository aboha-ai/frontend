const API_KEY = "AIzaSyBQ6n3ZpaQ8ocsvrog1CqgZBJW1ilgj5Lg";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

async function fetchTouristData() {
  const storedData = localStorage.getItem("touristData");

  if (storedData) {
    console.log("📌 로컬 스토리지에서 데이터 로드");
    const parsedData = JSON.parse(storedData);
    console.log("📌 로컬 스토리지 데이터:", parsedData);
    return parsedData;
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
                text: `다음 정보를 JSON 형식으로 호텔, 식당, 관광지 각각 5개씩 총 15개를 반환해 주세요:
                {
                    "hotels": [
                        {
                            "name": "호텔명",
                            "category": "호텔",
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
                            "name": "식당명",
                            "category": "식당",
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
                            "name": "관광지명",
                            "category": "관광지",
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

    localStorage.setItem("touristData", JSON.stringify(parsedData));
    return parsedData;
  } catch (error) {
    console.error("❌ API 요청 실패:", error);
    return { hotels: [], restaurants: [], touristSpots: [] };
  }
}

async function updateTouristSpotContent() {
  const { touristSpots } = await fetchTouristData();

  console.log("📌 관광지 데이터:", touristSpots);

  const contentContainer = document.getElementById("관광지-content");
  contentContainer.innerHTML = "";

  touristSpots.forEach((spot) => {
    console.log("📌 장소:", spot);

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
          <h3 class="font-medium">${spot.name}</h3>
          <div class="text-sm text-gray-600">
              <i class="fas fa-clock text-blue-400"></i> ${
                spot.hours || "운영 시간 없음"
              }
              <span class="ml-2 text-green-500">${spot.price || "무료"}</span>
          </div>
      </div>
      <button onclick='showLocation(${JSON.stringify(spot.location)})' 
              class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <i class="fas fa-map-marker-alt"></i>
      </button>
    `;

    contentContainer.appendChild(placeElement);
  });
}

window.onload = async () => {
  // 1. 먼저 관광지 데이터를 로드
  await updateTouristSpotContent();

  // 2. Google Maps API에서 initMap 호출
  // initMap이 정의되었는지 확인합니다.
  if (window.initMap) {
    initMap();
  } else {
    console.error("❌ initMap 함수가 정의되지 않았습니다.");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("refresh-btn");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      console.log("🔄 새로운 추천을 요청합니다...");

      // 1. 로컬 스토리지 초기화
      localStorage.removeItem("touristData");

      // 2. API 호출하여 새로운 추천 데이터 받아오기
      await updateTouristSpotContent();

      console.log("✅ 새로운 추천이 완료되었습니다!");
    });
  }
});
