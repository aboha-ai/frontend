// 전역 변수 선언
let currentDay = 1;
let totalDays = 1; // 초기 Day 수
let currentEventEditing = null;

// ※ API 키들은 이제 클라이언트에서는 직접 사용하지 않습니다.
//    GOOGLE_MAP_API는 HTML에서 전역 변수로 주입되어 있다고 가정합니다.
GOOGLE_MAP_API = "AIzaSyCw3yxyhLMb5QkP19vsufRq9Q2Bco2ATks";
const BASE_URL = "https://yellow-atom-tea.glitch.me";
// "HH:MM" 형식을 분 단위로 변환하는 유틸리티 함수
function getTimeInMinutes(timeStr) {
  const parts = timeStr.split(":");
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

// id가 없는 경우 고유 id를 부여하는 함수
function assignUniqueIds(data) {
  data.itinerary.forEach((day) => {
    day.events.forEach((event, index) => {
      if (!event.id) {
        event.id = `event-${day.day}-${index}-${Date.now()}-${Math.floor(
          Math.random() * 1000
        )}`;
      }
    });
  });
  return data;
}

// 빈 상태 메시지 생성 (이벤트가 없을 경우)
function createEmptyMessage(dayNumber) {
  const empty = document.createElement("div");
  empty.className =
    "flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg space-y-6 empty-message";
  empty.innerHTML = `
    <div class="text-gray-500 text-center">
      <h3 class="text-xl font-medium mb-2">No events planned for this day</h3>
      <p>Start by adding events or get suggestions for your itinerary</p>
    </div>
    <div class="flex gap-4">
      <button class="bg-custom text-white px-6 py-2 rounded-button" onclick="openEventModal('add')">
        <i class="fas fa-plus mr-2"></i>Add Event
      </button>
      <button class="bg-blue-500 text-white px-6 py-2 rounded-button" onclick="window.location.href='${BASE_URL}/ai-list'">
        <i class="fas fa-lightbulb mr-2"></i>Get Suggestions
      </button>
    </div>
  `;
  return empty;
}

// Day 버튼 및 콘텐츠 번호 재설정
function updateDayNumbers() {
  const dayButtons = document.querySelectorAll(
    "#day-buttons-container .day-button"
  );
  const dayContents = document.querySelectorAll(
    "#day-contents-container .day-content"
  );
  dayButtons.forEach((btn, index) => {
    const newNum = index + 1;
    btn.innerText = "Day " + newNum;
    btn.id = "day-btn-" + newNum;
    btn.onclick = function () {
      showDayContent(newNum);
    };
  });
  dayContents.forEach((content, index) => {
    const newNum = index + 1;
    content.id = "day" + newNum + "-content";
    const eventsContainer = content.querySelector(".events-container");
    if (eventsContainer) {
      eventsContainer.id = "day" + newNum + "-events-container";
    }
  });
  totalDays = dayButtons.length;
  if (window.tripData) {
    updateTripOverview(window.tripData);
  }
}

// 특정 Day 콘텐츠만 표시 및 버튼 활성화 처리
function showDayContent(dayNumber) {
  document
    .querySelectorAll(".day-content")
    .forEach((el) => el.classList.add("hidden"));
  const content = document.getElementById("day" + dayNumber + "-content");
  if (content) content.classList.remove("hidden");
  document
    .querySelectorAll(".day-button")
    .forEach((btn) => btn.classList.remove("bg-custom", "text-white"));
  const activeBtn = document.getElementById("day-btn-" + dayNumber);
  if (activeBtn) activeBtn.classList.add("bg-custom", "text-white");
  currentDay = dayNumber;
}

// More 버튼 클릭 시, 현재 Day 뒤에 새 Day 추가 및 데이터 업데이트
function addDay() {
  const newDayNumber = totalDays + 1;
  const dayButton = document.createElement("button");
  dayButton.className =
    "day-button px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-button";
  dayButton.innerText = "Day " + newDayNumber;
  dayButton.onclick = function () {
    showDayContent(newDayNumber);
  };

  const currentBtn = document.getElementById("day-btn-" + totalDays);
  currentBtn.insertAdjacentElement("afterend", dayButton);

  const dayContent = document.createElement("div");
  dayContent.className =
    "day-content hidden space-y-8 transition-all duration-300 ease-in-out";
  dayContent.id = "day" + newDayNumber + "-content";
  dayContent.innerHTML = `<div class="events-container border-l-2 border-custom" id="day${newDayNumber}-events-container">
    ${createEmptyMessage(newDayNumber).outerHTML}
  </div>`;
  document.getElementById("day-contents-container").appendChild(dayContent);

  if (window.tripData) {
    window.tripData.itinerary.push({
      day: newDayNumber,
      date: new Date().toISOString().split("T")[0],
      events: [],
    });
    updateLocalStorage();
  }
  updateDayNumbers();
  showDayContent(newDayNumber);
  console.log("Day 추가 후 localStorage:", localStorage.getItem("tripData"));
}

// Delete Day 모달 열기 및 삭제 처리
function openDeleteDayModal() {
  document.getElementById("delete-day-modal-message").innerText =
    "Day " + currentDay + "을 지우시겠습니까?";
  document.getElementById("delete-day-modal").classList.remove("hidden");
  document.getElementById("delete-day-modal").classList.add("flex");
}

function confirmDeleteDay() {
  const btnToRemove = document.getElementById("day-btn-" + currentDay);
  const contentToRemove = document.getElementById(
    "day" + currentDay + "-content"
  );
  if (btnToRemove) btnToRemove.remove();
  if (contentToRemove) contentToRemove.remove();

  if (window.tripData) {
    window.tripData.itinerary = window.tripData.itinerary.filter(
      (day) => day.day !== currentDay
    );
    window.tripData.itinerary.forEach((day, index) => {
      day.day = index + 1;
    });
    updateLocalStorage();
  }
  updateDayNumbers();
  if (document.querySelectorAll(".day-button").length > 0) {
    showDayContent(1);
    currentDay = 1;
  } else {
    totalDays = 0;
    addDay();
  }
  console.log("Day 삭제 후 localStorage:", localStorage.getItem("tripData"));
  document.getElementById("delete-day-modal").classList.add("hidden");
}

// 이벤트 카드 생성 함수 – 상세 정보 및 메모 분리
function createEventElement(dayNumber, eventData) {
  const eventId =
    eventData.id || "event-" + Date.now() + Math.floor(Math.random() * 1000);
  eventData.id = eventId;
  const container = document.createElement("div");
  container.className = "relative pl-8 border-l-2 border-custom event-item";
  container.setAttribute("data-time", eventData.time);
  container.id = eventId;

  let presetHtml = "";
  if (eventData.details) {
    presetHtml = `<ul class="text-gray-600 list-disc pl-5">
          ${
            eventData.details.open_time
              ? `<li>운영시간: ${eventData.details.open_time}</li>`
              : ""
          }
          ${
            eventData.details.cost != null
              ? `<li>예상비용: ${eventData.details.cost}</li>`
              : ""
          }
          ${
            eventData.details.link
              ? `<li>홈페이지: <a href="${eventData.details.link}" target="_blank" class="text-blue-500">${eventData.details.link}</a></li>`
              : ""
          }
          ${
            eventData.details.tips
              ? `<li>Tips: ${eventData.details.tips}</li>`
              : ""
          }
        </ul>`;
  } else {
    presetHtml = `<p class="text-gray-600">${eventData.description || ""}</p>`;
  }

  let memoHtml = "";
  if (eventData.memo) {
    memoHtml = `<div class="memo-section mt-2 p-2 border-t border-gray-300">
                  <strong>메모:</strong> ${eventData.memo}
                </div>`;
  }

  // 지도 iframe – GOOGLE_MAP_API는 HTML에서 전역 변수로 주입됨
  const mapIframe = `<iframe 
      src="https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAP_API}&q=${encodeURIComponent(
    eventData.location
  )}" 
      width="100%" 
      height="200" 
      style="border:0;" 
      allowfullscreen 
      loading="lazy">
    </iframe>`;

  container.innerHTML = `
        <div class="absolute -left-2 top-0 w-4 h-4 rounded-full bg-custom"></div>
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center gap-3 mb-2">
            <i class="fas fa-clock text-custom"></i>
            <p class="text-sm text-gray-600">${eventData.time}</p>
            <span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Confirmed</span>
          </div>
          <h3 class="text-lg font-medium mb-2">${eventData.title}</h3>
          <p class="text-gray-600 mb-4">${eventData.location}</p>
          <div class="flex justify-between items-start">
            <div class="flex gap-2">
              <button class="detail-btn text-custom hover:bg-custom/10 px-3 py-1.5 rounded-button" onclick="toggleDetails('${eventId}-details')">
                <i class="far fa-file-alt mr-2"></i>Details
              </button>
              <button class="reservation-btn bg-blue-500 text-white hover:bg-blue-600 px-3 py-1.5 rounded-button" onclick="window.location.href='${BASE_URL}/stays'">
                Reservation Assistant
              </button>
            </div>
            <div class="flex gap-2">
              <button class="edit-event-btn text-gray-600 hover:text-red-500 px-3 py-1.5 rounded-button" onclick="openEditEventModal('${eventId}')">
                <i class="fas fa-pencil-alt"></i>
              </button>
              <button class="delete-event-btn text-gray-600 hover:text-red-500 px-3 py-1.5 rounded-button" onclick="openDeleteEventModal('${eventId}', '${eventData.title}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
          <div id="${eventId}-details" class="hidden transition-all duration-300 mt-4 p-4 bg-white rounded shadow">
            <div class="grid grid-cols-2 gap-4">
              <div>
                ${presetHtml}
                ${memoHtml}
              </div>
              <div>
                ${mapIframe}
              </div>
            </div>
          </div>
        </div>
      `;
  return container;
}

// 상세 내용 토글
function toggleDetails(detailsId) {
  const elem = document.getElementById(detailsId);
  if (elem) elem.classList.toggle("hidden");
}

// 해당 Day의 이벤트들을 시간순으로 정렬
function sortEvents(dayNumber) {
  const eventsContainer = document.getElementById(
    "day" + dayNumber + "-events-container"
  );
  if (!eventsContainer) return;
  const events = Array.from(
    eventsContainer.getElementsByClassName("event-item")
  );
  events.sort(
    (a, b) =>
      getTimeInMinutes(a.getAttribute("data-time")) -
      getTimeInMinutes(b.getAttribute("data-time"))
  );
  events.forEach((eventElem) => eventsContainer.appendChild(eventElem));
}

// Add/Edit Event 모달 열기
function openEventModal(mode, eventId = null) {
  const modal = document.getElementById("add-event-modal");
  document.getElementById("event-description").readOnly = true;
  updateEventDayOptions();

  if (mode === "add") {
    document.getElementById("event-modal-title").innerText = "Add New Event";
    document.getElementById("event-id").value = "";
    document.getElementById("event-form").reset();
    document.getElementById("event-day").value = currentDay;
  } else if (mode === "edit" && eventId) {
    document.getElementById("event-modal-title").innerText = "Edit Event";
    const eventElem = document.getElementById(eventId);
    if (!eventElem) return;
    const title = eventElem.querySelector("h3").innerText;
    const time = eventElem.getAttribute("data-time");
    const location = eventElem.querySelector("p.text-gray-600.mb-4").innerText;
    let description = "";
    const presetElem = eventElem.querySelector('div[id$="-details"] ul');
    if (presetElem) {
      description = presetElem.innerText;
    } else {
      const pElem = eventElem.querySelector('div[id$="-details"] p');
      description = pElem ? pElem.innerText : "";
    }
    let memo = "";
    const detailContainer = eventElem.querySelector('div[id$="-details"]');
    if (detailContainer) {
      const pElements = detailContainer.querySelectorAll("p.text-gray-600");
      pElements.forEach((p) => {
        if (p.innerText.trim().startsWith("메모:")) {
          memo = p.innerText.replace("메모:", "").trim();
        }
      });
    }
    document.getElementById("event-id").value = eventId;
    document.getElementById("event-title").value = title;
    document.getElementById("event-time").value = time;
    document.getElementById("event-location").value = location;
    document.getElementById("event-description").value = description;
    document.getElementById("event-memo").value = memo;
    document.getElementById("event-day").value = currentDay;
  }
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  loadGoogleMapsApi(initializeEventLocationAutocomplete);
}

function openAddEventModal() {
  openEventModal("add");
}

function openEditEventModal(eventId) {
  openEventModal("edit", eventId);
}

// 이벤트 제출 처리 – 선택된 Day에 따라 이벤트 이동
function eventModalSubmit(e) {
  e.preventDefault();
  const eventId = document.getElementById("event-id").value;
  const title = document.getElementById("event-title").value;
  const time = document.getElementById("event-time").value;
  const location = document.getElementById("event-location").value;
  let description = document.getElementById("event-description").value;
  const memo = document.getElementById("event-memo").value;
  const selectedDay = parseInt(document.getElementById("event-day").value);

  if (eventId) {
    const dayData = window.tripData.itinerary.find(
      (day) => day.day === currentDay
    );
    if (dayData) {
      const existingEvent = dayData.events.find((e) => e.id === eventId);
      if (
        existingEvent &&
        existingEvent.description &&
        description.trim() === ""
      ) {
        description = existingEvent.description;
      }
    }
  }

  const eventData = {
    id: eventId
      ? eventId
      : "event-" + Date.now() + Math.floor(Math.random() * 1000),
    title,
    time,
    location,
    description,
    memo,
  };

  if (eventId && selectedDay !== currentDay) {
    const oldDayData = window.tripData.itinerary.find(
      (day) => day.day === currentDay
    );
    if (oldDayData) {
      oldDayData.events = oldDayData.events.filter((e) => e.id !== eventId);
    }
    const newDayData = window.tripData.itinerary.find(
      (day) => day.day === selectedDay
    );
    if (newDayData) {
      newDayData.events.push(eventData);
    }
    const eventElem = document.getElementById(eventId);
    if (eventElem) eventElem.remove();
    const newEventsContainer = document.getElementById(
      "day" + selectedDay + "-events-container"
    );
    if (newEventsContainer)
      newEventsContainer.appendChild(
        createEventElement(selectedDay, eventData)
      );
  } else {
    let eventsContainer = document.getElementById(
      "day" + currentDay + "-events-container"
    );
    if (!eventsContainer) {
      const dayContent = document.getElementById(
        "day" + currentDay + "-content"
      );
      dayContent.innerHTML = "";
      eventsContainer = document.createElement("div");
      eventsContainer.className = "events-container";
      eventsContainer.id = "day" + currentDay + "-events-container";
      dayContent.appendChild(eventsContainer);
    }
    let dayData = window.tripData.itinerary.find(
      (day) => day.day === currentDay
    );
    if (!dayData) {
      dayData = {
        day: currentDay,
        date: new Date().toISOString().split("T")[0],
        events: [],
      };
      window.tripData.itinerary.push(dayData);
    }
    if (eventId) {
      const existingEventIndex = dayData.events.findIndex(
        (e) => e.id === eventId
      );
      if (existingEventIndex !== -1)
        dayData.events[existingEventIndex] = eventData;
      const eventElem = document.getElementById(eventId);
      if (eventElem)
        eventElem.replaceWith(createEventElement(currentDay, eventData));
    } else {
      dayData.events.push(eventData);
      eventsContainer.appendChild(createEventElement(currentDay, eventData));
    }
  }

  let dayData = window.tripData.itinerary.find(
    (day) =>
      day.day ===
      (eventId && selectedDay !== currentDay ? selectedDay : currentDay)
  );
  if (dayData)
    dayData.events.sort(
      (a, b) => getTimeInMinutes(a.time) - getTimeInMinutes(b.time)
    );
  sortEvents(selectedDay !== currentDay ? selectedDay : currentDay);
  updateLocalStorage();
  document.getElementById("event-id").value = "";
  document.getElementById("event-form").reset();
  document.getElementById("add-event-modal").classList.add("hidden");
}

// Delete Event 모달 처리
function openDeleteEventModal(eventId, eventTitle) {
  const modal = document.getElementById("delete-event-modal");
  modal.setAttribute("data-event-id", eventId);
  document.getElementById("delete-event-modal-message").innerText =
    eventTitle + "을 지우시겠습니까?";
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function confirmDeleteEvent() {
  const modal = document.getElementById("delete-event-modal");
  const eventId = modal.getAttribute("data-event-id");
  if (window.tripData) {
    const currentDayData = window.tripData.itinerary.find(
      (day) => day.day === currentDay
    );
    if (currentDayData) {
      currentDayData.events = currentDayData.events.filter(
        (event) => event.id !== eventId
      );
    }
  }
  const eventElem = document.getElementById(eventId);
  if (eventElem) eventElem.remove();
  const eventsContainer = document.getElementById(
    "day" + currentDay + "-events-container"
  );
  if (
    eventsContainer &&
    eventsContainer.getElementsByClassName("event-item").length === 0
  ) {
    eventsContainer.innerHTML = "";
    eventsContainer.appendChild(createEmptyMessage(currentDay));
  }
  updateLocalStorage();
  modal.classList.add("hidden");
}

// 여행 개요 업데이트 (여행 기간, 출발 장소, 배경이미지, 날씨 등)
function updateTripOverview(data) {
  let startDate = new Date(data.location.arrival_time);
  let duration = totalDays;
  let endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + duration - 1);
  const options = { month: "short", day: "numeric", year: "numeric" };
  let startStr = startDate.toLocaleDateString("en-US", options);
  let endStr = endDate.toLocaleDateString("en-US", options);
  const overviewContainer = document.querySelector(
    ".bg-white.rounded-lg.shadow-sm.p-6.mb-6"
  );
  if (overviewContainer) {
    const durationBlock = overviewContainer.querySelectorAll(
      ".flex.items-center.gap-3"
    )[0];
    if (durationBlock) {
      const durationText = durationBlock.querySelector("p.font-medium");
      if (durationText)
        durationText.innerText = `${duration} Days (${startStr} - ${endStr})`;
    }
    const startingBlock = overviewContainer.querySelectorAll(
      ".flex.items-center.gap-3"
    )[1];
    if (startingBlock) {
      const startingText = startingBlock.querySelector("p.font-medium");
      if (startingText)
        startingText.innerText =
          data.location.country + ", " + data.location.city;
    }
  }
  const headerRoute = document.getElementById("header-route");
  if (
    headerRoute &&
    data.location &&
    data.location.country &&
    data.location.city
  ) {
    headerRoute.innerText = data.location.country + ", " + data.location.city;
  }
  updateBackgroundImage(
    data.location.city || data.location.country || "Travel"
  );
}

// Unsplash API를 통한 백그라운드 이미지 업데이트 (서버 프록시 사용)
function updateBackgroundImage(travelLocation) {
  const cacheKey = "backgroundImage_" + travelLocation;
  const cachedImage = localStorage.getItem(cacheKey);
  if (cachedImage) {
    setHeaderBackground(cachedImage);
  } else {
    const imageUrl = `${BASE_URL}/api/image?query=${encodeURIComponent(
      travelLocation
    )}`;

    fetch(imageUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.imageUrl) {
          setHeaderBackground(data.imageUrl);
          localStorage.setItem(cacheKey, data.imageUrl);
        }
      })
      .catch((error) =>
        console.error("Error fetching background image:", error)
      );
  }
}

function setHeaderBackground(imageUrl) {
  const header = document.querySelector("header");
  if (header) {
    header.style.backgroundImage = `url(${imageUrl})`;
    header.style.backgroundSize = "cover";
    header.style.backgroundPosition = "center";
  }
}

// 구글 번역 – 이제 서버 프록시 (/api/google)를 통해 요청
async function translateToEnglish(text) {
  try {
    const response = await fetch(`${BASE_URL}/api/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const result = await response.json();
    return result.translatedText;
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
}

// 날씨 정보 업데이트 – 한글 도시명은 번역 후 서버 프록시(/api/weather) 호출
async function updateWeatherForecast(data) {
  let tripLocation =
    data.location.englishCity ||
    data.location.city ||
    data.location.englishCountry ||
    data.location.country ||
    "Tokyo";
  if (/[\u3131-\u3163\uac00-\ud7a3]/.test(tripLocation)) {
    try {
      tripLocation = await translateToEnglish(tripLocation);
    } catch (error) {
      console.error("Translation error:", error);
    }
  }
  const weatherApiUrl = `${BASE_URL}/api/weather?location=${encodeURIComponent(
    tripLocation
  )}`;

  console.log("Weather API URL:", weatherApiUrl);
  fetch(weatherApiUrl)
    .then((response) => response.json())
    .then((weatherData) => {
      const forecastContainer = document.querySelector(".weather-forecast");
      if (!forecastContainer) return;
      forecastContainer.innerHTML = `<div class="text-lg font-medium mb-2">${tripLocation} 날씨</div>`;
      weatherData.days.forEach((day) => {
        const date = new Date(day.datetime);
        const options = { month: "short", day: "numeric", year: "numeric" };
        const dateStr = date.toLocaleDateString("ko-KR", options);
        const weatherHTML = `
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <i class="fas fa-sun text-yellow-500 text-2xl"></i>
              <div>
                <p class="font-medium">${dateStr}</p>
                <p class="text-sm text-gray-600">${day.conditions}</p>
              </div>
            </div>
            <p class="text-lg font-medium">${Math.round(day.temp)}°C</p>
          </div>
        `;
        forecastContainer.innerHTML += weatherHTML;
      });
    })
    .catch((error) => console.error("Error fetching weather data:", error));
}

// localStorage 업데이트
function updateLocalStorage() {
  if (window.tripData)
    localStorage.setItem("tripData", JSON.stringify(window.tripData));
}

// 헤더 타이틀 편집 활성화
function enableEditableTitle() {
  const headerTitle = document.querySelector("header h1");
  if (headerTitle) {
    headerTitle.contentEditable = "true";
    headerTitle.style.cursor = "text";
    headerTitle.addEventListener("blur", function () {
      if (window.tripData) {
        window.tripData.title = headerTitle.innerText;
        updateLocalStorage();
      }
    });
  }
}

// 여행 개요 수정 모달 – 나라와 도시 분리
function openOverviewModal() {
  const modal = document.getElementById("overview-modal");
  if (!modal) return;
  if (window.tripData && window.tripData.location) {
    document.getElementById("overview-country").value =
      window.tripData.location.country || "";
    document.getElementById("overview-city").value =
      window.tripData.location.city || "";
    if (window.tripData.location.arrival_time) {
      document.getElementById("overview-start-date").value =
        window.tripData.location.arrival_time.split("T")[0];
    }
  }
  document.getElementById("overview-travelers").value =
    window.tripData.travelers || "1";
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  loadGoogleMapsApi(initializeLocationAutocomplete);
}

function closeOverviewModal() {
  const modal = document.getElementById("overview-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function overviewModalSubmit(e) {
  e.preventDefault();
  const startDate = document.getElementById("overview-start-date").value;
  const country = document.getElementById("overview-country").value;
  const city = document.getElementById("overview-city").value;
  const travelers = document.getElementById("overview-travelers").value;
  if (window.tripData && window.tripData.location) {
    window.tripData.location.arrival_time = startDate + "T00:00:00";
    window.tripData.location.country = country;
    window.tripData.location.city = city;
    window.tripData.location.address =
      country && city ? country + ", " + city : country || city;
  }
  window.tripData.travelers = travelers;
  updateLocalStorage();
  updateTripUI(window.tripData);
  closeOverviewModal();
}

// Google Places Autocomplete – 나라와 도시 입력 필드
function initializeLocationAutocomplete() {
  const countryInput = document.getElementById("overview-country");
  if (countryInput) {
    const countryAutocomplete = new google.maps.places.Autocomplete(
      countryInput,
      { types: ["(regions)"] }
    );
    countryAutocomplete.addListener("place_changed", function () {
      const place = countryAutocomplete.getPlace();
      if (place && place.address_components) {
        const countryComp = place.address_components.find((comp) =>
          comp.types.includes("country")
        );
        if (countryComp) {
          countryInput.value = countryComp.long_name;
          if (!window.tripData.location) window.tripData.location = {};
          window.tripData.location.country = countryComp.long_name;
          window.tripData.location.englishCountry = countryComp.short_name;
        }
      }
    });
  }
  const cityInput = document.getElementById("overview-city");
  if (cityInput) {
    const cityAutocomplete = new google.maps.places.Autocomplete(cityInput, {
      types: ["(cities)"],
    });
    cityAutocomplete.addListener("place_changed", function () {
      const place = cityAutocomplete.getPlace();
      if (place && place.address_components) {
        let cityName = "";
        let englishCityName = "";
        place.address_components.forEach((comp) => {
          if (comp.types.includes("locality")) {
            cityName = comp.long_name;
            englishCityName = comp.short_name;
          }
        });
        if (!cityName) {
          place.address_components.forEach((comp) => {
            if (comp.types.includes("administrative_area_level_1")) {
              cityName = comp.long_name;
              englishCityName = comp.short_name;
            }
          });
        }
        cityInput.value = cityName;
        if (!window.tripData.location) window.tripData.location = {};
        window.tripData.location.city = cityName;
        window.tripData.location.englishCity = englishCityName;
      }
    });
  }
}

// Google Maps API 동적 로드 – GOOGLE_MAP_API는 HTML에서 주입됨
function loadGoogleMapsApi(callback) {
  const existingScript = document.getElementById("googleMaps");
  if (!existingScript) {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAP_API}&libraries=places`;
    script.id = "googleMaps";
    script.async = true;
    script.defer = true;
    script.onload = callback;
    document.head.appendChild(script);
  } else {
    if (callback) callback();
  }
}

// 이벤트 모달의 event-location Autocomplete
function initializeEventLocationAutocomplete() {
  const input = document.getElementById("event-location");
  if (!input) return;
  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["geocode"],
  });
  autocomplete.addListener("place_changed", function () {
    const place = autocomplete.getPlace();
    if (place.formatted_address) {
      input.value = place.formatted_address;
    }
  });
}

// 이벤트 모달의 "Day" select 옵션 업데이트
function updateEventDayOptions() {
  const select = document.getElementById("event-day");
  if (!select) return;
  select.innerHTML = "";
  for (let i = 1; i <= totalDays; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.text = "Day " + i;
    select.appendChild(option);
  }
}

// 여행 개요 영역 클릭 시 모달 열기
function enableEditableOverview() {
  const overviewEl = document.getElementById("trip-overview");
  if (overviewEl) {
    overviewEl.style.cursor = "pointer";
    overviewEl.addEventListener("click", openOverviewModal);
  }
}

// 전체 여행 UI 업데이트
function updateTripUI(data) {
  const headerTitle = document.querySelector("header h1");
  if (headerTitle && data.title) headerTitle.innerText = data.title;
  const overviewEl = document.getElementById("trip-overview");
  if (overviewEl && data.location) {
    const durationEl = overviewEl.querySelector("#trip-duration");
    if (durationEl) durationEl.innerText = `${totalDays} Days`;
    const startingPointEl = overviewEl.querySelector("#starting-point");
    if (startingPointEl)
      startingPointEl.innerText =
        data.location.country + ", " + data.location.city;
    const travelersEl = overviewEl.querySelector("#trip-travelers");
    if (travelersEl)
      travelersEl.innerText = data.travelers ? `${data.travelers}명` : "1명";
  }
  const overviewElems = document.querySelectorAll(".fa-map-marker-alt");
  overviewElems.forEach((el) => {
    const parent = el.parentNode;
    if (parent)
      parent.querySelector("p.font-medium").innerText =
        data.location.country + ", " + data.location.city;
  });
  const dayButtonsContainer = document.getElementById("day-buttons-container");
  const dayContentsContainer = document.getElementById(
    "day-contents-container"
  );
  dayButtonsContainer.innerHTML = "";
  dayContentsContainer.innerHTML = "";
  data.itinerary.forEach((dayData, index) => {
    const dayNumber = index + 1;
    const dayButton = document.createElement("button");
    dayButton.className =
      "day-button px-4 py-2 " +
      (dayNumber === 1
        ? "bg-custom text-white"
        : "text-gray-600 hover:bg-gray-100 rounded-button");
    dayButton.id = "day-btn-" + dayNumber;
    dayButton.innerText = "Day " + dayNumber;
    dayButton.onclick = function () {
      showDayContent(dayNumber);
    };
    dayButtonsContainer.appendChild(dayButton);
    const dayContent = document.createElement("div");
    dayContent.id = "day" + dayNumber + "-content";
    dayContent.className =
      "day-content " +
      (dayNumber === 1 ? "" : "hidden") +
      " space-y-8 transition-all duration-300 ease-in-out";
    const eventsContainer = document.createElement("div");
    eventsContainer.className = "events-container border-l-2 border-custom";
    eventsContainer.id = "day" + dayNumber + "-events-container";
    if (dayData.events && dayData.events.length > 0) {
      dayData.events.forEach((eventData) => {
        const eventObj = {
          id:
            eventData.id ||
            "event-" + Date.now() + Math.floor(Math.random() * 1000),
          time: eventData.time,
          title: eventData.title,
          location: eventData.location,
          details: eventData.details,
          memo: eventData.memo || "",
        };
        eventsContainer.appendChild(createEventElement(dayNumber, eventObj));
      });
    } else {
      eventsContainer.appendChild(createEmptyMessage(dayNumber));
    }
    dayContent.appendChild(eventsContainer);
    dayContentsContainer.appendChild(dayContent);
  });
  // More 버튼을 마지막에 추가
  const moreButton = document.createElement("button");
  moreButton.className =
    "px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-button";
  moreButton.innerText = "More";
  moreButton.onclick = addDay;
  dayButtonsContainer.appendChild(moreButton);
  updateDayNumbers();
  showDayContent(1);
  window.tripData = data;
  updateTripOverview(data);
  updateWeatherForecast(data);
  enableEditableOverview();
}

// DOMContentLoaded – 초기화
document.addEventListener("DOMContentLoaded", function () {
  updateDayNumbers();
  showDayContent(1);
  const timeInput = document.getElementById("event-time");
  if (timeInput) {
    timeInput.addEventListener("focus", () => timeInput.showPicker());
    timeInput.addEventListener("input", () => {
      let [hours, minutes] = timeInput.value.split(":");
      hours = parseInt(hours, 10);
      if (isNaN(hours) || hours < 0 || hours > 23) timeInput.value = "00:00";
    });
  }
  const localData = localStorage.getItem("tripData");
  if (localData) {
    try {
      let data = JSON.parse(localData);
      data = assignUniqueIds(data);
      window.tripData = data;
      updateLocalStorage();
      updateTripUI(window.tripData);
    } catch (e) {
      console.error("Local data 파싱 에러:", e);
    }
  } else {
    console.warn("localStorage에 tripData가 없습니다.");
  }
  updateDayNumbers();
  showDayContent(1);
  enableEditableTitle();
  enableEditableOverview();
});
