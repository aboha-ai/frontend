document.addEventListener("DOMContentLoaded", function () {
  const openModalBtn = document.querySelector(".btn-secondary");
  const scheduleBox = document.querySelector(".schedule-box");

  // 🔹 모달 및 배경 어둡게 효과 추가
  const modalOverlay = document.createElement("div");
  modalOverlay.classList.add("modal-overlay");
  document.body.appendChild(modalOverlay);

  const modal = document.createElement("div");
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

  /**
   * ✅ 로컬스토리지에서 event- 로 시작하는 일정 데이터를 불러옴
   */
  function loadTrips() {
    tripList.innerHTML = "";
    const trips = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("event-")) {
        trips.push({ key, ...JSON.parse(localStorage.getItem(key)) });
      }
    }

    if (trips.length === 0) {
      tripList.innerHTML = "<p>📌 저장된 여행 일정이 없습니다.</p>";
      return;
    }

    trips.forEach((trip) => {
      const travelPeriod = calculateTravelPeriod(trip);

      const tripItem = document.createElement("div");
      tripItem.classList.add("trip-item");
      tripItem.innerHTML = `
          <div class="trip-info">
            <h3>${trip.title}</h3>
            <p>${trip.location.city}, ${trip.location.country}</p>
            <p>📅 ${travelPeriod}</p> <!-- 여행 기간 자동 계산 -->
          </div>
          <button class="load-trip" data-key="${trip.key}">일정 불러오기</button>
        `;
      tripList.appendChild(tripItem);
    });
  }

  /**
   * ✅ 여행 기간 자동 계산 함수
   */
  function calculateTravelPeriod(trip) {
    if (!trip.itinerary || trip.itinerary.length === 0) return "날짜 정보 없음";

    const startDate = new Date(trip.location.arrival_time);
    const lastDay = trip.itinerary[trip.itinerary.length - 1];
    const endDate = new Date(lastDay.date);

    const formatDate = (date) => {
      return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}.${String(date.getDate()).padStart(2, "0")}`;
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  /**
   * ✅ 일정 불러오기 버튼 클릭 시 `appendSelectedTrip()` 실행 (schedule.js에서만 처리)
   */
  tripList.addEventListener("click", function (event) {
    if (event.target.classList.contains("load-trip")) {
      const tripKey = event.target.dataset.key;
      const tripData = localStorage.getItem(tripKey);

      if (!tripData) {
        console.error("📌 일정 데이터를 찾을 수 없습니다.");
        return;
      }

      const trip = JSON.parse(tripData);
      if (trip && trip.itinerary) {
        if (typeof window.appendSelectedTrip === "function") {
          window.appendSelectedTrip(trip); // ✅ `schedule.js`에서 실행
        } else {
          console.error("🚨 appendSelectedTrip 함수가 정의되지 않았습니다!");
        }

        modal.style.display = "none";
        modalOverlay.style.display = "none"; // 배경 어둡게 해제
      } else {
        console.error("📌 일정 데이터가 올바르지 않습니다.", trip);
      }
    }
  });

  /**
   * ✅ "저장된 여행 일정 불러오기" 버튼 클릭 시 모달 열기
   */
  openModalBtn.addEventListener("click", function () {
    modal.style.display = "block";
    modalOverlay.style.display = "block"; // 배경 어둡게
    loadTrips();
  });

  /**
   * ✅ "닫기 버튼" 클릭 시 모달 닫기
   */
  closeModalBtn.addEventListener("click", function () {
    modal.style.display = "none";
    modalOverlay.style.display = "none"; // 배경 어둡게 해제
  });

  // ✅ 초기 로드 시 일정 불러오기
  loadTrips();
});
