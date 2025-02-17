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

// 화면에 콘텐츠를 렌더링하는 함수
function renderContent(category, data) {
  const contentContainer = document.getElementById(`${category}-content`);

  // 기존 내용 초기화 (최적화 필요)
  contentContainer.innerHTML = "";

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

  // 저장된 데이터가 반영된 후, 다시 콘텐츠 업데이트
  Object.keys(updatedData).forEach((category) => {
    // 해당 카테고리에 대해 데이터가 있으면 업데이트
    if (updatedData[category].length > 0) {
      updateContent(category, updatedData);
    }
  });
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

  const getRandomDate = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const randomTime =
      start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime);
  };

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

  const startDate = "2025-04-15";
  const endDate = "2025-04-17"; // 예시로 3일 여행

  // Hotels에 대한 itinerary 추가
  updatedData.hotels.forEach((hotel, index) => {
    if (hotel && hotel.address) {
      // address가 존재할 때만 추가
      const { time, title } = getRandomTimeAndTitle();
      const randomDate = getRandomDate(startDate, endDate);
      const formattedDate = randomDate.toISOString().split("T")[0];

      const event = createEvent(
        time,
        title,
        hotel.address,
        hotel.link,
        hotel.cost
      );

      if (!tripData.itinerary[index]) {
        tripData.itinerary.push({
          day: index + 1,
          date: formattedDate,
          events: [event],
        });
      } else {
        tripData.itinerary[index].events.push(event);
      }
    }
  });

  // Restaurants에 대한 itinerary 추가
  updatedData.restaurants.forEach((restaurant, index) => {
    if (restaurant && restaurant.address) {
      // address가 존재할 때만 추가
      const { time, title } = getRandomTimeAndTitle();
      const randomDate = getRandomDate(startDate, endDate);
      const formattedDate = randomDate.toISOString().split("T")[0];

      const event = createEvent(
        time,
        title,
        restaurant.address,
        restaurant.link,
        restaurant.cost
      );

      if (!tripData.itinerary[index]) {
        tripData.itinerary.push({
          day: index + 1,
          date: formattedDate,
          events: [event],
        });
      } else {
        tripData.itinerary[index].events.push(event);
      }
    }
  });

  // Tourist Spots에 대한 itinerary 추가
  updatedData.touristSpots.forEach((spot, index) => {
    if (spot && spot.address) {
      // address가 존재할 때만 추가
      const { time, title } = getRandomTimeAndTitle();
      const randomDate = getRandomDate(startDate, endDate);
      const formattedDate = randomDate.toISOString().split("T")[0];

      const event = createEvent(
        time,
        title,
        spot.address,
        spot.link,
        spot.cost
      );

      if (!tripData.itinerary[index]) {
        tripData.itinerary.push({
          day: index + 1,
          date: formattedDate,
          events: [event],
        });
      } else {
        tripData.itinerary[index].events.push(event);
      }
    }
  });

  console.log(tripData); // 최종 결과 확인
}

// ✅ 저장하기 버튼 추가
const saveButton = document.createElement("button");
saveButton.textContent = "저장하기";
saveButton.style.zIndex = "100"; // 다른 요소보다 위에 표시
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
