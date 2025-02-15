document.addEventListener("DOMContentLoaded", function () {
  const openModalBtn = document.querySelector(".btn-secondary"); // 🔹 "저장된 여행 일정 불러오기" 버튼
  const scheduleBox = document.querySelector(".schedule-box"); // 🔹 일정 표시 영역
  const modal = document.createElement("div"); // 🔹 모달 창 동적 생성
  modal.classList.add("modal");
  document.body.appendChild(modal);

  // ✅ 모달 UI 설정
  modal.innerHTML = `
        <div class="modal-content">
          <div class="modal-header">
            <h2>저장된 여행 일정</h2>
            <button class="close-modal">&times;</button>
          </div>
          <div id="tripList" class="trip-list"></div>
        </div>
      `;

  const tripList = document.getElementById("tripList");
  const closeModalBtn = modal.querySelector(".close-modal");

  function loadTrips() {
    tripList.innerHTML = "";
    let trips = JSON.parse(localStorage.getItem("tripData")) || [];

    if (!Array.isArray(trips)) {
      trips = [trips];
    }

    if (trips.length === 0) {
      tripList.innerHTML = "<p>📌 저장된 여행 일정이 없습니다.</p>";
      return;
    }

    trips.forEach((trip, index) => {
      const tripItem = document.createElement("div");
      tripItem.classList.add("trip-item");
      tripItem.innerHTML = `
            <div class="trip-info">
              <h3>${trip.title}</h3>
              <p>${trip.location.city}, ${trip.location.country}</p>
              <p>🛬 도착 시간: ${new Date(
                trip.location.arrival_time
              ).toLocaleString()}</p>
            </div>
            <button class="load-trip" data-index="${index}">일정 불러오기</button>
          `;
      tripList.appendChild(tripItem);
    });
  }

  tripList.addEventListener("click", function (event) {
    if (event.target.classList.contains("load-trip")) {
      const index = event.target.dataset.index;
      const trips = JSON.parse(localStorage.getItem("tripData")) || [];
      if (trips[index]) {
        appendSelectedTrip(trips[index]);
        modal.style.display = "none"; // ✅ 일정 추가 후 모달 닫기
      }
    }
  });

  function appendSelectedTrip(trip) {
    let itineraryContainer = document.querySelector(".trip-itinerary");

    if (!itineraryContainer) {
      // ✅ 처음 일정을 불러올 때만 여행 일정 섹션을 생성
      scheduleBox.innerHTML = `
          <h2>여행 일정</h2>
          <button class="btn btn-secondary trip-reload-btn">
            <img src="/docs/travel_tips/assets/SVG-3.svg" alt="목록 불러오기" />
            저장된 여행 목록 불러오기
          </button>
          <div class="trip-itinerary"></div>
        `;

      itineraryContainer = document.querySelector(".trip-itinerary");

      // ✅ 새로운 "저장된 여행 일정 불러오기" 버튼 동작 추가
      document
        .querySelector(".trip-reload-btn")
        .addEventListener("click", function () {
          modal.style.display = "block";
          loadTrips();
        });
    }

    // ✅ 기존 일정 아래에 새로운 일정 추가
    let tripSection = document.createElement("div");
    tripSection.classList.add("trip-section");
    tripSection.innerHTML = `<h3>${trip.title} (${trip.location.city}, ${trip.location.country})</h3>`;

    trip.itinerary.forEach((day) => {
      let daySection = document.createElement("div");
      daySection.classList.add("day-section");
      daySection.innerHTML = `<h3>📅 Day ${day.day} - ${day.date} (${trip.location.city})</h3>`;

      day.events.forEach((event) => {
        let eventItem = document.createElement("div");
        eventItem.classList.add("event-item");
        eventItem.innerHTML = `
              <p><strong>${event.time}</strong> - ${event.title}</p>
              <p>📍 장소: ${event.location}</p>
              <button class="btn btn-dark get-tips" data-place="${event.title}" data-time="${event.time}">
                여행 팁 보기
              </button>
            `;

        daySection.appendChild(eventItem);
      });

      tripSection.appendChild(daySection);
    });

    itineraryContainer.appendChild(tripSection);
  }

  openModalBtn.addEventListener("click", function () {
    const trips = JSON.parse(localStorage.getItem("tripData")) || [];
    if (trips.length === 0) {
      alert("📌 저장된 여행 일정이 없습니다.");
      return;
    }
    modal.style.display = "block";
    loadTrips();
  });

  closeModalBtn.addEventListener("click", function () {
    modal.style.display = "none";
  });

  loadTrips();
});
