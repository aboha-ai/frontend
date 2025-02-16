document.addEventListener("DOMContentLoaded", function () {
  const scheduleContainer = document.getElementById("scheduleContainer");

  /**
   * ✅ 기존 일정 유지하면서 새로운 일정 추가
   */
  function appendSelectedTrip(trip) {
    let tripSection = document.createElement("div");
    tripSection.classList.add("trip-section");
    tripSection.innerHTML = `<h3>${trip.title} (${trip.location.city}, ${trip.location.country})</h3>`;

    trip.itinerary.forEach((day) => {
      let daySection = document.createElement("div");
      daySection.classList.add("day-section");
      daySection.innerHTML = `<h3>📅 Day ${day.day} - ${day.date}</h3>`;

      // ✅ 일정들을 가로 정렬하는 event-container 추가
      let eventContainer = document.createElement("div");
      eventContainer.classList.add("event-container");

      day.events.forEach((event) => {
        let eventItem = document.createElement("div");
        eventItem.classList.add("event-item");
        eventItem.innerHTML = `
                <p><strong>${event.time}</strong> - ${event.title}</p>
                <p>📍 장소: ${event.location}</p>
                <button class="btn btn-dark get-tips" data-place="${event.title}">
                  여행 팁 보기
                </button>
              `;

        eventContainer.appendChild(eventItem); // ✅ event-container에 추가
      });

      daySection.appendChild(eventContainer); // ✅ 가로 정렬 컨테이너 추가
      tripSection.appendChild(daySection);
    });

    scheduleContainer.appendChild(tripSection); // ✅ 기존 일정 유지하면서 새로운 일정 추가

    // ✅ 여행 팁 섹션 추가
    addTravelTipsSection();
  }

  /**
   * ✅ 여행 팁 & FAQ 섹션 추가 (일정이 추가된 후에만 생성)
   */
  function addTravelTipsSection() {
    let tipsContainer = document.getElementById("tipsContainer");

    if (!tipsContainer) {
      const mainContainer = document.querySelector(".container");
      const tipsSection = document.createElement("section");
      tipsSection.classList.add("trip-tips");
      tipsSection.innerHTML = `
              <h2>여행 팁</h2>
              <div id="tipsContainer" class="carousel"></div>
            `;
      mainContainer.appendChild(tipsSection);
    }
  }

  /**
   * ✅ "여행 팁 보기" 버튼 클릭 시 `getTipsForPlace()` 실행
   */
  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("get-tips")) {
      const placeName = event.target.dataset.place;

      if (typeof window.getTipsForPlace === "function") {
        window.getTipsForPlace(placeName); // ✅ Gemini API 호출
      }
    }
  });

  // ✅ 일정 선택 시 `modal.js`에서 이 함수가 호출됨
  window.appendSelectedTrip = appendSelectedTrip;
});
