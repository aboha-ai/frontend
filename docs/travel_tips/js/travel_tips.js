document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("click", function (event) {
    if (event.target.classList.contains("get-tips")) {
      const place = event.target.dataset.place;
      const time = event.target.dataset.time;

      console.log(`🚀 여행 팁 요청: 장소 - ${place}, 시간 - ${time}`);

      // 🚀 나중에 LLM API 요청 기능 추가할 예정
      alert(`📌 '${place}' (${time})에 대한 여행 팁 요청 준비 중...`);
    }
  });
});
