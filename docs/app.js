// app.js - JavaScript 코드

let currentDay = 1;
let totalDays = 1; // 초기 Day 수
let currentEventEditing = null;

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
          <button class="delete-event-btn text-gray-600 hover:text-red-500 px-3 py-1.5 !rounded-button" onclick="openDeleteEventModal('${eventId}', '${eventData.title}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      <div id="${eventId}-details" class="hidden transition-all duration-300 mt-4 p-4 bg-white rounded shadow">
        <p class="text-gray-600">${eventData.description}</p>
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
  fetch("test_data.json")
    .then((response) => response.json())
    .then((data) => {
      const headerTitle = document.querySelector("header h1");
      if (headerTitle && data.title) {
        headerTitle.innerText = data.title;
      }
      const overviewElems = document.querySelectorAll(".fa-map-marker-alt");
      overviewElems.forEach((el) => {
        const parent = el.parentNode;
        if (parent) {
          parent.querySelector("p.font-medium").innerText =
            data.location.address;
        }
      });
      const dayButtonsContainer = document.getElementById(
        "day-buttons-container"
      );
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
            let description = "";
            if (eventData.details) {
              description = "Open: " + eventData.details.open_time;
              if (eventData.details.cost !== null) {
                description += ", Cost: " + eventData.details.cost;
              }
              description += ". More info: " + eventData.details.link;
            }
            const eventObj = {
              id:
                eventData.id ||
                "event-" + Date.now() + Math.floor(Math.random() * 1000),
              time: eventData.time,
              title: eventData.title,
              location: eventData.location,
              description: description,
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
    })
    .catch((error) => console.error("Error loading itinerary:", error));
});
