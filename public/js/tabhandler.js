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

// 저장하기 버튼 클릭 이벤트 리스너
document.getElementById("save-button").addEventListener("click", function () {
  localStorage.setItem("parsedData", JSON.stringify(parsedData));

  createAndSaveTripData();
  saveSelectedData();
});

// saveSelectedData 함수는 이미 api.js에 정의되어 있으므로 그대로 사용합니다.
async function saveSelectedData() {
  const checkboxes = document.querySelectorAll(".place-checkbox");
  const updatedData = { hotels: [], restaurants: [], touristSpots: [] };
  const deletedData = { hotels: [], restaurants: [], touristSpots: [] };

  let hasChecked = false; // 체크된 항목이 있는지 확인하는 변수

  checkboxes.forEach((checkbox) => {
    const category = checkbox.dataset.category;
    const index = parseInt(checkbox.dataset.index, 10);
    const allData = JSON.parse(localStorage.getItem("touristData")) || {
      hotels: [],
      restaurants: [],
      touristSpots: [],
    };

    if (
      category &&
      updatedData[category] !== undefined &&
      deletedData[category] !== undefined
    ) {
      if (checkbox.checked) {
        updatedData[category].push(allData[category][index]);
        hasChecked = true; // 체크된 항목이 있으면 true로 설정
      } else {
        deletedData[category].push(allData[category][index]);
      }
    } else {
      console.error("❌ 잘못된 category 값:", category);
    }
  });

  if (!hasChecked) {
    alert("저장할 항목을 선택해주세요.");
    return; // 체크된 항목이 없으면 저장하지 않음
  }

  // 로컬 스토리지에 업데이트된 데이터 저장
  localStorage.setItem("touristData", JSON.stringify(updatedData));

  // 삭제된 데이터도 로컬 스토리지에 저장
  localStorage.setItem("deletedTouristData", JSON.stringify(deletedData));

  console.log("✅ 저장된 데이터:", updatedData);
  console.log("❌ 삭제된 데이터:", deletedData);

  // 저장된 데이터가 반영된 후, 다시 콘텐츠 업데이트
  Object.keys(updatedData).forEach((category) => {
    // 해당 카테고리에 대해 데이터가 있으면 업데이트
    if (updatedData[category].length > 0) {
      updateContent(category, updatedData);
    }
  });
}
