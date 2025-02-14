document.addEventListener("DOMContentLoaded", () => {
  function changeTab(tabName) {
    console.log(`🔄 ${tabName} 탭 선택됨`);

    // 모든 버튼 초기화
    document.querySelectorAll(".tab-button").forEach((btn) => {
      btn.classList.remove("bg-black", "text-white");
      btn.classList.add("text-gray-600");
    });

    // 선택한 버튼 스타일 변경
    document
      .getElementById(`${tabName}-tab`)
      .classList.add("bg-black", "text-white");

    // 모든 콘텐츠 숨기기
    document.querySelectorAll(".content-section").forEach((section) => {
      section.style.display = "none";
    });

    // 선택한 콘텐츠 표시
    document.getElementById(`${tabName}-content`).style.display = "block";

    // 해당 탭의 데이터 불러오기
    updateContent(tabName);
  }

  // 기본으로 관광지 탭 활성화
  changeTab("관광지");

  // 글로벌 함수 등록 (HTML에서 호출 가능하도록)
  window.changeTab = changeTab;
});

document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.getElementById("refresh-btn");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      console.log("🔄 새로운 추천을 요청합니다...");

      // 1. 로컬 스토리지 초기화
      localStorage.removeItem("touristData");

      // 2. API 호출하여 새로운 추천 데이터 받아오기
      await updateContent();

      console.log("✅ 새로운 추천이 완료되었습니다!");
    });
  }
});
