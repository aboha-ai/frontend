// app.js - JavaScript 코드

let currentDay = 1;
let totalDays = 1; // 초기 Day 수
let currentEventEditing = null;
// temp api key
const GOOGLE_MAP_API = "your_key";
const WEATHER_API_KEY = "6JMUS56QRRG2LJMKYWKXTPH7Y";

// "HH:MM" 형식을 분 단위로 변환하는 유틸리티 함수
function getTimeInMinutes(timeStr) {
  const parts = timeStr.split(":");
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
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

// More 버튼 클릭 시, 현재 Day 뒤에 새 Day 추가
function addDay() {
  const newDayNumber = currentDay + 1;
  const dayBtn = document.createElement("button");
  dayBtn.className =
    "day-button px-4 py-2 text-gray-600 hover:bg-gray-100 !rounded-button";
  dayBtn.innerText = "Day " + newDayNumber;
  dayBtn.onclick = function () {
    showDayContent(newDayNumber);
  };
  const currentBtn = document.getElementById("day-btn-" + currentDay);
  currentBtn.insertAdjacentElement("afterend", dayBtn);
  const dayContent = document.createElement("div");
  dayContent.className =
    "day-content hidden space-y-8 transition-all duration-300 ease-in-out";
  dayContent.innerHTML = `
    <div class="events-container border-l-2 border-custom" id="day${newDayNumber}-events-container">
      ${createEmptyMessage(newDayNumber).outerHTML}
    </div>
  `;
  const currentContent = document.getElementById(
    "day" + currentDay + "-content"
  );
  currentContent.insertAdjacentElement("afterend", dayContent);
  updateDayNumbers();
  showDayContent(newDayNumber);
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
  updateDayNumbers();
  const remainingButtons = document.querySelectorAll(".day-button");
  if (remainingButtons.length > 0) {
    const firstDayNumber = parseInt(
      remainingButtons[0].innerText.replace("Day ", "")
    );
    showDayContent(firstDayNumber);
  } else {
    totalDays = 0;
    addDay();
  }
  document.getElementById("delete-day-modal").classList.add("hidden");
  document.getElementById("delete-day-modal").classList.remove("flex");
}

// 이벤트 카드 생성 함수
function createEventElement(dayNumber, eventData) {
  const eventId = eventData.id || "event-" + Date.now();
  eventData.id = eventId;
  const container = document.createElement("div");
  container.className = "relative pl-8 border-l-2 border-custom event-item";
  container.setAttribute("data-time", eventData.time);
  container.id = eventId;

  let detailsHtml = "";
  if (eventData.details) {
    detailsHtml = `<ul class="text-gray-600 list-disc pl-5">
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
    detailsHtml = `<p class="text-gray-600">${eventData.description || ""}</p>`;
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
          <!-- 상세 내용 영역: 왼쪽은 details 항목, 오른쪽은 Google Map -->
          <div id="${eventId}-details" class="hidden transition-all duration-300 mt-4 p-4 bg-white rounded shadow">
            <div class="grid grid-cols-2 gap-4">
              <div>
                ${detailsHtml}
              </div>
              <div>
                <iframe
                  src="https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAP_API}&q=${encodeURIComponent(
    eventData.location
  )}"
                  width="100%"
                  height="200"
                  style="border:0;"
                  allowfullscreen
                  loading="lazy">
                </iframe>
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
    const descriptionElem = eventElem.querySelector('div[id$="-details"] p');
    const description = descriptionElem ? descriptionElem.innerText : "";
    document.getElementById("event-id").value = eventId;
    document.getElementById("event-title").value = title;
    document.getElementById("event-time").value = time;
    document.getElementById("event-location").value = location;
    document.getElementById("event-description").value = description;
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

// 모달 폼 제출 시 이벤트 추가/수정 및 시간순 정렬 처리
function eventModalSubmit(e) {
  e.preventDefault();
  const eventId = document.getElementById("event-id").value;
  const title = document.getElementById("event-title").value;
  const time = document.getElementById("event-time").value;
  const location = document.getElementById("event-location").value;
  const description = document.getElementById("event-description").value;
  const eventData = { title, time, location, description };
  const dayNumber = currentDay;
  let eventsContainer = document.getElementById(
    "day" + dayNumber + "-events-container"
  );
  const emptyMsg = eventsContainer.querySelector(".empty-message");
  if (emptyMsg) emptyMsg.remove();

  if (eventId) {
    const eventElem = document.getElementById(eventId);
    if (eventElem) {
      const newEventElem = createEventElement(dayNumber, {
        id: eventId,
        title,
        time,
        location,
        description,
      });
      eventElem.parentNode.replaceChild(newEventElem, eventElem);
    }
  } else {
    if (!eventsContainer) {
      const dayContent = document.getElementById(
        "day" + dayNumber + "-content"
      );
      dayContent.innerHTML = "";
      eventsContainer = document.createElement("div");
      eventsContainer.className = "events-container";
      eventsContainer.id = "day" + dayNumber + "-events-container";
      dayContent.appendChild(eventsContainer);
    }
    const newEventElem = createEventElement(dayNumber, eventData);
    eventsContainer.appendChild(newEventElem);
  }
  sortEvents(dayNumber);
  document.getElementById("event-id").value = "";
  document.getElementById("event-form").reset();
  document.getElementById("add-event-modal").classList.add("hidden");
  document.getElementById("add-event-modal").classList.remove("flex");
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
  const eventElem = document.getElementById(eventId);
  if (eventElem) {
    eventElem.remove();
  }
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
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function updateTripOverview(data) {
  // 시작일은 data.location.arrival_time를 사용 (또는 data.itinerary[0].date)
  let startDate = new Date(data.location.arrival_time);
  let duration = totalDays; // day 버튼 개수
  let endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + duration - 1);

  // 날짜 형식 지정 (예: "Apr 15, 2025")
  const options = { month: "short", day: "numeric", year: "numeric" };
  let startStr = startDate.toLocaleDateString("en-US", options);
  let endStr = endDate.toLocaleDateString("en-US", options);

  // Trip Overview 영역 선택 (Overview 컨테이너의 고유 클래스로 선택)
  const overviewContainer = document.querySelector(
    ".bg-white.rounded-lg.shadow-sm.p-6.mb-6"
  );
  if (overviewContainer) {
    // Duration: 첫 번째 flex 항목에 해당 (순서가 변경되지 않는 한)
    const durationBlock = overviewContainer.querySelectorAll(
      ".flex.items-center.gap-3"
    )[0];
    if (durationBlock) {
      const durationText = durationBlock.querySelector("p.font-medium");
      if (durationText) {
        durationText.innerText = `${duration} Days (${startStr} - ${endStr})`;
      }
    }
    // Starting Point: 두 번째 flex 항목
    const startingBlock = overviewContainer.querySelectorAll(
      ".flex.items-center.gap-3"
    )[1];
    if (startingBlock) {
      const startingText = startingBlock.querySelector("p.font-medium");
      if (startingText) {
        startingText.innerText = data.location.address;
      }
    }
    // Travelers는 그대로 두거나 JSON에 해당 데이터가 있다면 갱신
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

      // 도시 이름을 헤더로 추가 (예: "도쿄 날씨")
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

// 초기화 (DOMContentLoaded)
document.addEventListener("DOMContentLoaded", function () {
  updateDayNumbers();
  showDayContent(1);
});

// 시간 입력 관련: 24시간제로 강제 (Safari 대응)
document.addEventListener("DOMContentLoaded", function () {
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
});

// test_data.json 파일을 불러와 초기 일정 데이터를 구성
document.addEventListener("DOMContentLoaded", function () {
  // 먼저 로컬스토리지에 데이터가 있는지 확인합니다.
  // data 이름 채크
  const localData = localStorage.getItem("testData");
  if (localData) {
    try {
      const data = JSON.parse(localData);
      updateTripUI(data);
      return;
    } catch (e) {
      console.error("Local data 파싱 에러:", e);
    }
  }
  // 로컬스토리지에 데이터가 없거나 파싱 실패 시 test_data.json을 fetch
  fetchTripData();
});

function fetchTripData() {
  fetch("test_data.json")
    .then((response) => response.json())
    .then((data) => {
      // 가져온 데이터를 로컬스토리지에 저장
      localStorage.setItem("tripData", JSON.stringify(data));
      updateTripUI(data);
    })
    .catch((error) => console.error("Error loading itinerary:", error));
}

function updateTripUI(data) {
  const headerTitle = document.querySelector("header h1");
  if (headerTitle && data.title) {
    headerTitle.innerText = data.title;
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
          details: eventData.details, // details 그대로 전달
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
}
