const dataCache = {}; // 데이터를 캐시할 객체
// api.js
const GEO_API_KEY = process.env.GOOGLE_MAPS_API_KEY; // 환경 변수에서 키 가져오기
const GEO_API_URL = GEO_API_KEY
  ? `https://maps.googleapis.com/maps/api/geocode/json?key=${GEO_API_KEY}`
  : null; // API 키가 없으면 null

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

async function fetchTouristData(country, city) {
  try {
    const response = await fetch("/api/tourist-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country, city }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("관광 데이터 가져오기 오류:", error);
    return null; // 또는 빈 객체 {} 반환
  }
}

async function updateContent(category, tabData) {
  // 데이터가 캐시에 있으면 사용
  if (
    dataCache[category] &&
    dataCache[category]["한국"] &&
    dataCache[category]["한국"]["서울"]
  ) {
    tabData[category] = JSON.parse(
      JSON.stringify(dataCache[category]["한국"]["서울"])
    );
    renderContent(category, tabData[category]); // 화면에 데이터 반영
    return;
  }

  const country = "한국"; // 예시
  const city = "서울"; // 예시
  const touristData = await fetchTouristData(country, city);

  if (!touristData) {
    console.error("관광 데이터가 없습니다.");
    const contentContainer = document.getElementById(`${category}-content`);
    contentContainer.innerHTML = `<p>Gemini API 오류 또는 데이터가 없습니다.</p>`;
    return;
  }

  // 받은 데이터 캐시에 저장
  if (!dataCache[category]) {
    dataCache[category] = {};
  }
  if (!dataCache[category][country]) {
    dataCache[category][country] = {};
  }
  dataCache[category][country][city] = touristData;

  tabData[category] = JSON.parse(JSON.stringify(touristData));

  const dataMap = {
    hotels: touristData.hotels,
    restaurants: touristData.restaurants,
    touristSpots: touristData.touristSpots,
  };

  if (!dataMap[category] || dataMap[category].length === 0) {
    console.error(`${category} 데이터가 없습니다.`);
    const contentContainer = document.getElementById(`${category}-content`);
    contentContainer.innerHTML = `<p>${category} 데이터가 없습니다.</p>`;
    return;
  }

  renderContent(category, dataMap[category]); // 화면에 데이터 반영
}

function renderContent(category, data) {
  const contentContainer = document.getElementById(`${category}-content`);

  // 기존 내용 초기화 (최적화 필요)
  contentContainer.innerHTML = "";

  // data가 배열이 아닌 경우 처리
  if (!Array.isArray(data)) {
    console.error(`${category} 데이터가 배열이 아닙니다:`, data);
    contentContainer.innerHTML = `<p>잘못된 데이터 형식입니다. 데이터를 확인해 주세요.</p>`;
    return;
  }

  data.forEach((place, index) => {
    const placeElement = document.createElement("div");
    placeElement.classList.add("flex", "gap-4", "p-4", "border-b");

    placeElement.innerHTML = `
      <input type="checkbox" class="place-checkbox" data-category="${category}" data-index="${index}">
      <div class="flex-1">
        <h3 class="font-medium">${place.name || ""}</h3>
        <div class="text-sm text-gray-600">
          <i class="fas fa-clock text-blue-400"></i> ${
            place.hours || "운영 시간 정보 없음"
          }
          <span class="ml-2 text-green-500">${place.cost || "무료"}</span>
        </div>
      </div>
      <button class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              onclick="handleMarkerClick('${place.name}', '${
      place.address
    }', '${place.country}')">
        <i class="fas fa-map-marker-alt"></i>
      </button>
    `;

    contentContainer.appendChild(placeElement);
  });
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

async function fetchGeolocationFromDetails(address) {
  try {
    const response = await fetch(
      `${GEO_API_URL}?address=${encodeURIComponent(address)}&key=${GEO_API_KEY}`
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`위치 정보 API 오류: ${response.status} - ${errorText}`);
      return null;
    }
    if (!GEO_API_URL) {
      // API 키가 없으면 에러 처리
      console.error("Google Maps API 키가 없습니다.");
      return null;
    }
    const data = await response.json();
    if (data.status !== "OK") {
      console.error("위치 정보 찾을 수 없음:", data.error_message);
      return null;
    }

    const location = data.results[0].geometry.location;
    return location; // { lat, lng }
  } catch (error) {
    console.error("위치 정보 가져오기 오류:", error);
    return null;
  }
}

async function handleMarkerClick(name, address, country) {
  console.log(" 클릭된 장소 정보:", { name, address, country });

  try {
    const location = await fetchGeolocationFromDetails(name, address, country); // await 키워드 사용
    console.log(" 위치 정보:", location);

    if (window.initMap) {
      initMap(location);
    } else {
      console.error("❌ initMap 함수가 정의되지 않았습니다.");
    }
  } catch (error) {
    console.error("❌ 위치를 찾을 수 없습니다:", error);
    alert("위치를 찾을 수 없습니다. 장소 이름을 다시 확인해 주세요.");
  }
}

function generateTripData(parsedData) {
  const tripData = {
    title: "test", // 제목은 필요에 따라 변경 가능
    location: {
      arrival_time: "2025-04-15T10:00:00", // 도착 시간은 고정
      address: "서울, 대한민국", // 주소는 필요에 따라 변경 가능
      city: "Seoul", // 도시는 필요에 따라 변경 가능
    },
    itinerary: [],
  };

  const categories = ["hotels", "restaurants", "touristSpots"];
  const categoryNames = {
    hotels: "숙소",
    restaurants: "식사",
    touristSpots: "관광",
  };
  const times = ["10:00", "12:00", "18:00"];

  for (let i = 1; i <= 5; i++) {
    // 5일치 일정 생성
    const dayData = {
      day: i,
      date: "2025-02-17", // 날짜는 고정
      events: [],
    };

    categories.forEach((category) => {
      if (
        parsedData &&
        parsedData[category] &&
        Array.isArray(parsedData[category])
      ) {
        parsedData[category].forEach((item) => {
          const randomTime = times[Math.floor(Math.random() * times.length)];
          const eventData = {
            time: randomTime,
            title: categoryNames[category],
            location: item.address,
            details: {
              open_time: item.hours || null,
              cost: item.cost || null,
              link: item.link || null,
            },
          };
          dayData.events.push(eventData);
        });
      }
    });

    tripData.itinerary.push(dayData);
  }
  console.log(tripData); // tripData 콘솔에 출력
  return tripData;
}

function createAndSaveTripData() {
  const touristDataString = localStorage.getItem("touristData");
  if (touristDataString) {
    const touristData = JSON.parse(touristDataString); // touristData로 변경
    const tripData = generateTripData(touristData); // generateTripData에 touristData 전달

    localStorage.setItem("tripData", JSON.stringify(tripData));
    console.log(tripData);
    return tripData; // 생성된 tripData 반환 (필요한 경우)
  } else {
    console.error("로컬 스토리지에 'touristData'가 없습니다.");
    return null; // touristData가 없을 경우 null 반환 (필요한 경우)
  }
}
