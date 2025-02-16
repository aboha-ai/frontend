const GEO_API_KEY = "AIzaSyDNRlG7nHslXZrM3YPFAeYY_w7JpRz_oY8"; // Geocoding API 키
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

// Geocoding API를 사용해 장소 이름, 주소, 국가로 위도/경도 가져오기
async function fetchGeolocationFromDetails(name, address, country) {
  console.log("📌 Geocoding API에 전달된 장소 정보:", {
    name,
    address,
    country,
  });

  const geocodingAPIUrl = `${GEO_API_URL}?address=${encodeURIComponent(
    `${name}, ${address}, ${country}`
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
                text: `현지인이 자주 가고 풍경 위주의 평화로운 여행을 원하는 사람이 갈만한 "country" 의 "city" 에 있는 "hotel", "restaurants", "touristSpots"를 JSON 형식으로 각각 5개씩 총 15개를 반환해 주세요:
                {
                    "hotels": [
                        {
                            "name": "이름",
                            "link": "웹사이트 URL",
                            "cost": "1박 가격",
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
                            "cost": "평균 가격",
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
                            "cost": "입장료",
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
    parsedData.hotels.forEach((hotel) => (hotel.category = "hotels"));
    parsedData.restaurants.forEach(
      (restaurant) => (restaurant.category = "restaurants")
    );
    parsedData.touristSpots.forEach((spot) => (spot.category = "touristSpots"));

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
    hotels: hotels,
    restaurants: restaurants,
    touristSpots: touristSpots,
  };

  console.log(`📌 ${category} 데이터:`, dataMap[category]);

  const contentContainer = document.getElementById(`${category}-content`);
  contentContainer.innerHTML = ""; // 기존 내용 초기화

  dataMap[category].forEach((place, index) => {
    console.log(`📌 ${category} 장소:`, place);

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
      <input type="checkbox" class="place-checkbox" data-category="${category}" data-index="${index}">
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
      <button onclick='handleMarkerClick("${sanitizedPlace.name}", "${
      sanitizedPlace.address
    }", "${sanitizedPlace.country}")' 
              class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <i class="fas fa-map-marker-alt"></i>
      </button>
    `;

    contentContainer.appendChild(placeElement);
  });
}

function saveSelectedData() {
  const checkboxes = document.querySelectorAll(".place-checkbox");
  const updatedData = { hotels: [], restaurants: [], touristSpots: [] };
  const deletedData = { hotels: [], restaurants: [], touristSpots: [] };

  let hasChecked = false; // 체크된 항목이 있는지 확인하는 변수

  checkboxes.forEach((checkbox) => {
    const category = checkbox.dataset.category;
    const index = parseInt(checkbox.dataset.index, 10);
    const allData = JSON.parse(localStorage.getItem("touristData")) || {
      hotels: [],
      restaurants: [],
      touristSpots: [],
    };

    if (
      category &&
      updatedData[category] !== undefined &&
      deletedData[category] !== undefined
    ) {
      if (checkbox.checked) {
        updatedData[category].push(allData[category][index]);
        hasChecked = true; // 체크된 항목이 있으면 true로 설정
      } else {
        deletedData[category].push(allData[category][index]);
      }
    } else {
      console.error("❌ 잘못된 category 값:", category);
    }
  });

  if (!hasChecked) {
    alert("저장할 항목을 선택해주세요.");
    return; // 체크된 항목이 없으면 저장하지 않음
  }

  // 로컬 스토리지에 업데이트된 데이터 저장
  localStorage.setItem("touristData", JSON.stringify(updatedData));

  // 삭제된 데이터도 로컬 스토리지에 저장
  localStorage.setItem("deletedTouristData", JSON.stringify(deletedData));

  console.log("✅ 저장된 데이터:", updatedData);
  console.log("❌ 삭제된 데이터:", deletedData);
  changeUpdatedData(updatedData);
}
function changeUpdatedData(updatedData) {
  const tripData = {
    title: "test",
    location: {
      arrival_time: "2025-04-15T10:00:00",
      address: "서울, 대한민국",
      city: "Seoul",
    },
    itinerary: [],
  };

  // 여행 시작 날짜와 끝 날짜를 계산하여 랜덤 day 생성
  const getRandomDate = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const randomTime =
      start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime);
  };

  // time과 title을 랜덤으로 생성
  const getRandomTimeAndTitle = () => {
    const times = ["08:00", "13:00", "18:00"];
    const titles = {
      "08:00": "아침 식사",
      "13:00": "점심 식사",
      "18:00": "저녁 식사",
    };

    const randomTime = times[Math.floor(Math.random() * times.length)];
    return {
      time: randomTime,
      title: titles[randomTime],
    };
  };

  // Hotels, Restaurants, and Tourist Spots을 이벤트로 변환
  const createEvent = (time, title, location, link, cost) => ({
    time: time,
    title: title,
    location: location,
    details: {
      open_time: "24시간",
      cost: cost || null,
      link: link,
    },
  });

  // 여행 시작 날짜와 끝 날짜
  const startDate = "2025-04-15";
  const endDate = "2025-04-17"; // 예시로 3일 여행이라고 가정

  // Hotels에 대한 itinerary 추가
  updatedData.hotels.forEach((hotel, index) => {
    const { time, title } = getRandomTimeAndTitle();
    const randomDate = getRandomDate(startDate, endDate);
    const formattedDate = randomDate.toISOString().split("T")[0]; // YYYY-MM-DD 형식으로 날짜 포맷

    const event = createEvent(
      time,
      title,
      hotel.address,
      hotel.link,
      hotel.cost
    );

    // 기존 itinerary에 맞춰 day와 date를 추가
    if (!tripData.itinerary[index]) {
      tripData.itinerary.push({
        day: index + 1,
        date: formattedDate, // 랜덤 날짜
        events: [event],
      });
    } else {
      tripData.itinerary[index].events.push(event);
    }
  });

  // Restaurants에 대한 itinerary 추가
  updatedData.restaurants.forEach((restaurant, index) => {
    const { time, title } = getRandomTimeAndTitle();
    const randomDate = getRandomDate(startDate, endDate);
    const formattedDate = randomDate.toISOString().split("T")[0]; // YYYY-MM-DD 형식으로 날짜 포맷

    const event = createEvent(
      time,
      title,
      restaurant.address,
      restaurant.link,
      restaurant.price
    );

    // 기존 itinerary에 맞춰 day와 date를 추가
    if (!tripData.itinerary[index]) {
      tripData.itinerary.push({
        day: index + 1,
        date: formattedDate, // 랜덤 날짜
        events: [event],
      });
    } else {
      tripData.itinerary[index].events.push(event);
    }
  });

  // 결과 출력 (테스트용)
  console.log(tripData);
}

// ✅ 저장하기 버튼 추가
const saveButton = document.createElement("button");
saveButton.textContent = "저장하기";
saveButton.classList.add(
  "mt-4",
  "p-2",
  "bg-blue-500",
  "text-white",
  "rounded",
  "fixed",
  "bottom-4",
  "left-4"
);
saveButton.onclick = saveSelectedData;

document.body.appendChild(saveButton);

async function handleMarkerClick(name, address, country) {
  console.log("📌 클릭된 장소 정보:", { name, address, country });

  try {
    const location = await fetchGeolocationFromDetails(name, address, country);
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
