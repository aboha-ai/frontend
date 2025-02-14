// app.js - 최종 개선 코드 (여행 개요 수정 포함)

let currentDay = 1;
let totalDays = 1; // 초기 Day 수
let currentEventEditing = null;
// temp api key
const GOOGLE_MAP_API = "your_key";
const WEATHER_API_KEY = "6JMUS56QRRG2LJMKYWKXTPH7Y";
const accessKey = "jKmpPpL00k6bhiDWQzwXElaHu9DZpB9FjYwqT00yC7I";

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
      <button class="bg-custom text-white px-6 py-2 !rounded-button" onclick="openEventModal('add')">
        <i class="fas fa-plus mr-2"></i>Add Event
      </button>
      <button class="bg-blue-500 text-white px-6 py-2 !rounded-button">
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
  document.querySelectorAll(".day-content").forEach((el) => {
    el.classList.add("hidden");
  });
  const content = document.getElementById("day" + dayNumber + "-content");
  if (content) content.classList.remove("hidden");
  document.querySelectorAll(".day-button").forEach((btn) => {
    btn.classList.remove("bg-custom", "text-white");
  });
  const activeBtn = document.getElementById("day-btn-" + dayNumber);
  if (activeBtn) {
    activeBtn.classList.add("bg-custom", "text-white");
  }
  currentDay = dayNumber;
}

// More 버튼 클릭 시, 현재 Day 뒤에 새 Day 추가 및 데이터 업데이트
function addDay() {
  const newDayNumber = totalDays + 1;
  const dayButton = document.createElement("button");
  dayButton.className =
    "day-button px-4 py-2 text-gray-600 hover:bg-gray-100 !rounded-button";
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
  dayContent.innerHTML = `<div class="events-container border-l-2 border-custom" id="day${newDayNumber}-events-container">${
    createEmptyMessage(newDayNumber).outerHTML
  }</div>`;

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

// Delete Day 모달 열기
function openDeleteDayModal() {
  document.getElementById("delete-day-modal-message").innerText =
    "Day " + currentDay + "을 지우시겠습니까?";
  document.getElementById("delete-day-modal").classList.remove("hidden");
  document.getElementById("delete-day-modal").classList.add("flex");
}

// Delete Day 모달 확인 시 현재 Day 삭제
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

// 이벤트 카드 생성 함수 – preset 상세 내용과 메모를 별도 구획으로 표시
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
            eventData.details.cost !== undefined &&
            eventData.details.cost !== null
              ? `<li>예상비용: ${eventData.details.cost}</li>`
              : ""
          }
          ${
            eventData.details.link
              ? `<li>홈페이지: <a href="${eventData.details.link}" target="_blank" class="text-blue-500">${eventData.details.link}</a></li>`
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
              <button class="detail-btn text-custom hover:bg-custom/10 px-3 py-1.5 !rounded-button" onclick="toggleDetails('${eventId}-details')">
                <i class="far fa-file-alt mr-2"></i>Details
              </button>
              <button class="reservation-btn bg-blue-500 text-white hover:bg-blue-600 px-3 py-1.5 !rounded-button">
                Reservation Assistant
              </button>
            </div>
            <div class="flex gap-2">
              <button class="edit-event-btn text-gray-600 hover:text-red-500 px-3 py-1.5 !rounded-button" onclick="openEditEventModal('${eventId}')">
                <i class="fas fa-pencil-alt"></i>
              </button>
              <button class="delete-event-btn text-gray-600 hover:text-red-500 px-3 py-1.5 !rounded-button" onclick="openDeleteEventModal('${eventId}', '${
    eventData.title
  }')">
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
                ${/* 지도 iframe 부분 주석 처리 */ ""}
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

// 해당 Day의 이벤트들을 시간순으로 정렬 (DOM상 정렬)
function sortEvents(dayNumber) {
  const eventsContainer = document.getElementById(
    "day" + dayNumber + "-events-container"
  );
  if (!eventsContainer) return;
  const events = Array.from(
    eventsContainer.getElementsByClassName("event-item")
  );
  events.sort((a, b) => {
    const timeA = getTimeInMinutes(a.getAttribute("data-time"));
    const timeB = getTimeInMinutes(b.getAttribute("data-time"));
    return timeA - timeB;
  });
  events.forEach((eventElem) => {
    eventsContainer.appendChild(eventElem);
  });
}

// Add/Edit Event 모달 열기
function openEventModal(mode, eventId = null) {
  const modal = document.getElementById("add-event-modal");
  // "event-description" 필드를 readOnly 처리하여 preset 수정은 불가
  document.getElementById("event-description").readOnly = true;
  if (mode === "add") {
    document.getElementById("event-modal-title").innerText = "Add New Event";
    document.getElementById("event-id").value = "";
    document.getElementById("event-form").reset();
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
  }
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}
function openAddEventModal() {
  openEventModal("add");
}
function openEditEventModal(eventId) {
  openEventModal("edit", eventId);
}

function eventModalSubmit(e) {
  e.preventDefault();
  const eventId = document.getElementById("event-id").value;
  const title = document.getElementById("event-title").value;
  const time = document.getElementById("event-time").value;
  const location = document.getElementById("event-location").value;
  let description = document.getElementById("event-description").value;
  const memo = document.getElementById("event-memo").value;
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
    id: eventId || "event-" + Date.now() + Math.floor(Math.random() * 1000),
    title,
    time,
    location,
    description,
    memo,
  };
  let eventsContainer = document.getElementById(
    "day" + currentDay + "-events-container"
  );
  if (!eventsContainer) {
    const dayContent = document.getElementById("day" + currentDay + "-content");
    dayContent.innerHTML = "";
    eventsContainer = document.createElement("div");
    eventsContainer.className = "events-container";
    eventsContainer.id = "day" + currentDay + "-events-container";
    dayContent.appendChild(eventsContainer);
  }
  let dayData = window.tripData.itinerary.find((day) => day.day === currentDay);
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
    if (existingEventIndex !== -1) {
      dayData.events[existingEventIndex] = eventData;
    }
    const eventElem = document.getElementById(eventId);
    if (eventElem) {
      eventElem.replaceWith(createEventElement(currentDay, eventData));
    }
  } else {
    dayData.events.push(eventData);
    eventsContainer.appendChild(createEventElement(currentDay, eventData));
  }
  dayData.events.sort(
    (a, b) => getTimeInMinutes(a.time) - getTimeInMinutes(b.time)
  );
  sortEvents(currentDay);
  updateLocalStorage();
  console.log(
    "이벤트 추가/수정 후 localStorage:",
    localStorage.getItem("tripData")
  );
  document.getElementById("event-id").value = "";
  document.getElementById("event-form").reset();
  document.getElementById("add-event-modal").classList.add("hidden");
}

// Delete Event 모달 열기 및 처리
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
  console.log("이벤트 삭제 후 localStorage:", localStorage.getItem("tripData"));
  modal.classList.add("hidden");
}

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
      if (durationText) {
        durationText.innerText = `${duration} Days (${startStr} - ${endStr})`;
      }
    }
    const startingBlock = overviewContainer.querySelectorAll(
      ".flex.items-center.gap-3"
    )[1];
    if (startingBlock) {
      const startingText = startingBlock.querySelector("p.font-medium");
      if (startingText) {
        startingText.innerText = data.location.address;
      }
    }
  }
  const headerRoute = document.getElementById("header-route");
  if (headerRoute && data.location && data.location.address) {
    headerRoute.innerText = data.location.address;
  }
  updateBackgroundImage(
    data.location.city || data.location.address || "Travel"
  );
}

// Unsplash API를 활용해 여행지 기반 백그라운드 이미지 가져오기 + 캐싱
function updateBackgroundImage(travelLocation) {
  const cacheKey = "backgroundImage_" + travelLocation;
  const cachedImage = localStorage.getItem(cacheKey);
  if (cachedImage) {
    setHeaderBackground(cachedImage);
  } else {
    const apiUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
      travelLocation
    )}&orientation=landscape&client_id=${accessKey}`;
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.urls && data.urls.regular) {
          setHeaderBackground(data.urls.regular);
          localStorage.setItem(cacheKey, data.urls.regular);
        }
      })
      .catch((error) => {
        console.error("Error fetching background image:", error);
      });
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

// 날씨 정보 받아오기
function updateWeatherForecast(data) {
  const tripLocation = data.location.city || data.location.address || "Tokyo";
  const today = new Date();
  const startDate = today.toISOString().split("T")[0];
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 2);
  const endDateStr = endDate.toISOString().split("T")[0];
  const weatherApiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
    tripLocation
  )}/${startDate}/${endDateStr}?unitGroup=metric&lang=ko&key=${WEATHER_API_KEY}&contentType=json`;
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

// localStorage 업데이트 함수 (즉시 저장)
function updateLocalStorage() {
  if (window.tripData) {
    localStorage.setItem("tripData", JSON.stringify(window.tripData));
  }
}

// 타이틀 변경 (헤더 h1 편집)
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

// 여행 개요 수정 모달 열기 함수
function openOverviewModal() {
  const modal = document.getElementById("overview-modal");
  if (!modal) return;
  if (
    window.tripData &&
    window.tripData.location &&
    window.tripData.location.arrival_time
  ) {
    document.getElementById("overview-start-date").value =
      window.tripData.location.arrival_time.split("T")[0];
  }
  if (window.tripData && window.tripData.location) {
    document.getElementById("overview-location").value =
      window.tripData.location.address;
  }
  document.getElementById("overview-travelers").value =
    window.tripData.travelers || "1";
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

// 여행 개요 수정 모달 닫기 함수
function closeOverviewModal() {
  const modal = document.getElementById("overview-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// 여행 개요 모달 제출 처리
function overviewModalSubmit(e) {
  e.preventDefault();
  const startDate = document.getElementById("overview-start-date").value;
  const location = document.getElementById("overview-location").value;
  const travelers = document.getElementById("overview-travelers").value;
  if (window.tripData && window.tripData.location) {
    window.tripData.location.arrival_time = startDate + "T00:00:00";
    window.tripData.location.address = location;
  }
  window.tripData.travelers = travelers;
  updateLocalStorage();
  updateTripUI(window.tripData);
  closeOverviewModal();
}

// 여행 개요 수정 모달을 "trip-overview" 영역 클릭 시 열도록 설정
function enableEditableOverview() {
  const overviewEl = document.getElementById("trip-overview");
  if (overviewEl) {
    overviewEl.style.cursor = "pointer";
    overviewEl.addEventListener("click", openOverviewModal);
  }
}

// DOMContentLoaded – 로컬스토리지에서 데이터 불러오기 및 id 자동 할당
document.addEventListener("DOMContentLoaded", function () {
  updateDayNumbers();
  showDayContent(1);
  let timeInput = document.getElementById("event-time");
  if (timeInput) {
    timeInput.addEventListener("focus", function () {
      timeInput.showPicker();
    });
    timeInput.addEventListener("input", function () {
      let [hours, minutes] = timeInput.value.split(":");
      hours = parseInt(hours, 10);
      if (isNaN(hours) || hours < 0 || hours > 23) {
        timeInput.value = "00:00";
      }
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

// updateTripUI 함수 – 여행 개요 및 일정, 날씨, 백그라운드 이미지 업데이트
function updateTripUI(data) {
  const headerTitle = document.querySelector("header h1");
  if (headerTitle && data.title) {
    headerTitle.innerText = data.title;
  }
  // 여행 개요 영역 업데이트 (여행 기간, 출발 장소, 여행 인원)
  const overviewEl = document.getElementById("trip-overview");
  if (overviewEl && data.location) {
    const durationEl = overviewEl.querySelector("#trip-duration");
    if (durationEl) {
      durationEl.innerText = `${totalDays} Days`;
    }
    const startingPointEl = overviewEl.querySelector("#starting-point");
    if (startingPointEl) {
      startingPointEl.innerText = data.location.address;
    }
    const travelersEl = overviewEl.querySelector("#trip-travelers");
    if (travelersEl) {
      travelersEl.innerText = data.travelers ? `${data.travelers}명` : "1명";
    }
  }
  const overviewElems = document.querySelectorAll(".fa-map-marker-alt");
  overviewElems.forEach((el) => {
    const parent = el.parentNode;
    if (parent) {
      parent.querySelector("p.font-medium").innerText = data.location.address;
    }
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
        : "text-gray-600 hover:bg-gray-100 !rounded-button");
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
        const eventElem = createEventElement(dayNumber, eventObj);
        eventsContainer.appendChild(eventElem);
      });
    } else {
      eventsContainer.appendChild(createEmptyMessage(dayNumber));
    }
    dayContent.appendChild(eventsContainer);
    dayContentsContainer.appendChild(dayContent);
  });
  const moreButton = document.createElement("button");
  moreButton.className =
    "px-4 py-2 text-gray-600 hover:bg-gray-100 !rounded-button";
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
