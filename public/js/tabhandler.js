document.addEventListener("DOMContentLoaded", () => {
  // 탭별 데이터를 저장할 객체
  const tabData = {};

  // 탭 변경 함수
  function changeTab(tabName) {
    console.log(`${tabName} 탭 선택됨`);

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
    const contentElement = document.getElementById(`${tabName}-content`);
    if (contentElement) {
      contentElement.style.display = "block";
    }
  }

  // 글로벌 함수 등록 (HTML에서 호출 가능하도록)
  window.changeTab = changeTab;

  // 새로고침 버튼 이벤트 처리
  const refreshBtn = document.getElementById("refresh-btn");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      console.log("새로운 추천을 요청합니다...");
      await refreshData(tabData); // 데이터 갱신
    });
  }

  // 초기 탭 설정 및 데이터 로드 (수정됨)
  loadInitialData(tabData);
});

// 초기 데이터 로드 함수 (추가됨)
async function loadInitialData(tabData) {
  const storedData = localStorage.getItem("touristData");

  if (storedData) {
    // 로컬 스토리지에 데이터가 있는 경우
    console.log("로컬 스토리지에서 데이터를 불러옵니다.");
    const parsedData = JSON.parse(storedData);
    for (const category in parsedData) {
      tabData[category] = parsedData[category];
      renderContent(category, tabData[category]);
    }
    changeTab("touristSpots"); // 첫 번째 탭 활성화
  } else {
    // 로컬 스토리지에 데이터가 없는 경우
    console.log("새로운 데이터를 로드합니다.");
    await refreshData(tabData); // 새로운 데이터 갱신
  }
}

// 데이터 갱신 함수 (수정됨)
async function refreshData(tabData) {
  // 로컬 스토리지 초기화
  localStorage.removeItem("touristData");

  const tabs = ["touristSpots", "restaurants", "hotels"];

  try {
    // 각 탭에 대해 데이터를 갱신
    await Promise.all(
      tabs.map(async (tab) => {
        await updateContent(tab, tabData);
        tabData[tab] = JSON.parse(
          JSON.stringify(dataCache[tab]["한국"]["서울"])
        );
      })
    );

    console.log("✅ 모든 탭의 새로운 추천이 완료되었습니다!");
    // 새로고침 후에 기존 탭을 다시 활성화
    changeTab("touristSpots"); // 또는 다른 기본 탭
  } catch (error) {
    console.error("❌ 데이터 갱신 중 오류 발생:", error);
    // 오류 발생 시 처리 로직 추가 (예: 사용자에게 오류 메시지 표시)
  }
}
