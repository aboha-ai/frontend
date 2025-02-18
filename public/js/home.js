// 선택된 테마를 카테고리별로 저장할 객체
let selectedThemes = {
  accommodation: [], // 숙소
  food: [], // 맛집
  attractions: [], // 관광지
};

// 페이지 로드 시: 이벤트 리스너 등록
document.addEventListener("DOMContentLoaded", () => {
  // localStorage에서 저장된 테마, 시작 날짜, 종료 날짜 불러오기
  const savedThemes = localStorage.getItem("selectedThemes");
  if (savedThemes) {
    selectedThemes = JSON.parse(savedThemes);
  }
  const savedStartDate = localStorage.getItem("startDate");
  if (savedStartDate) {
    document.getElementById("startDate").value = savedStartDate;
  }
  const savedEndDate = localStorage.getItem("endDate");
  if (savedEndDate) {
    document.getElementById("endDate").value = savedEndDate;
  }

  initializeThemeButtons();

  const searchButton = document.getElementById("searchButton");
  if (searchButton) {
    searchButton.addEventListener("click", openThemeModal);
  }

  const closeModalButton = document.getElementById("closeModalButton");
  if (closeModalButton) {
    closeModalButton.addEventListener("click", closeThemeModal);
  }

  const resetButton = document.getElementById("resetButton");
  if (resetButton) {
    resetButton.addEventListener("click", resetLocalStorage);
  }

  // "나의 여행 기록 보기" 버튼 클릭 이벤트 (임시)
  const viewVlogsButton = document.getElementById("viewVlogsButton");
  if (viewVlogsButton) {
    viewVlogsButton.addEventListener("click", () => {
      window.location.href = "${BASE_URL}/my-list";
    });
  }

  // "여행 팁 보러가기" 버튼 클릭 이벤트 - 수정됨
  const tipsButton = document.getElementById("tipsButton");
  if (tipsButton) {
    tipsButton.addEventListener("click", () => {
      window.location.href = "${BASE_URL}/ai-tips"; // 바로 페이지 이동
    });
  }

  // "일정 짜주기" 버튼 클릭 이벤트 (모달 내부)
  const itineraryButton = document.getElementById("itineraryButton");
  if (itineraryButton) {
    itineraryButton.addEventListener("click", () => {
      sendDataAndRedirect("${BASE_URL}/ai-list");
    });
  }

  // 모달 닫기 버튼 이벤트 리스너
  const closeAlertButton = document.getElementById("closeAlertButton");
  if (closeAlertButton) {
    closeAlertButton.addEventListener("click", closeAlert);
  }
});

// 로컬 스토리지 초기화
function resetLocalStorage() {
  showAlert("로컬 스토리지 데이터가 초기화되었습니다.");
  selectedThemes = {
    accommodation: [],
    food: [],
    attractions: [],
  };
  initializeThemeButtons();
  localStorage.clear();
}

// 테마 선택 모달 관련 함수들
function openThemeModal() {
  const cityInput = document.getElementById("cityInput").value;
  if (!cityInput) {
    showAlert("도시와 나라를 입력해주세요.");
    return;
  }
  // 쉼표로 도시와 나라 분리
  const [city, country] = cityInput.split(",").map((part) => part.trim());

  if (!city || !country) {
    showAlert(
      "도시와 나라를 쉼표(,)로 구분하여 입력해주세요 예시)서울,대한민국"
    );
    return;
  }

  // 이전에 선택했던 날짜가 있으면 복원
  const savedStartDate = localStorage.getItem("startDate");
  if (savedStartDate) {
    document.getElementById("startDate").value = savedStartDate;
  }
  const savedEndDate = localStorage.getItem("endDate");
  if (savedEndDate) {
    document.getElementById("endDate").value = savedEndDate;
  }

  document.getElementById(
    "modal-title"
  ).textContent = `여행 테마 선택 - ${cityInput}`;
  document.getElementById("themeModal").classList.remove("hidden");
}

// "취소" 버튼을 눌러서 모달을 닫을 때
function closeThemeModal() {
  document.getElementById("themeModal").classList.add("hidden");
}

// 테마 버튼 초기화 및 이벤트 핸들러 연결
function initializeThemeButtons() {
  const themeButtons = document.querySelectorAll(".theme-button");
  themeButtons.forEach((button) => {
    button.removeEventListener("click", handleThemeButtonClick);
    button.addEventListener("click", handleThemeButtonClick);

    const category = button.dataset.category;
    const theme = button.textContent.trim().substring(1);

    if (selectedThemes[category]?.includes(theme)) {
      button.classList.add("bg-blue-500", "text-white");
      button.classList.remove("bg-blue-100", "text-blue-800");
    } else {
      button.classList.remove("bg-blue-500", "text-white");
      button.classList.add("bg-blue-100", "text-blue-800");
    }
  });
}

// 테마 버튼 클릭 핸들러
function handleThemeButtonClick(event) {
  const button = event.currentTarget;
  const category = button.dataset.category;
  const theme = button.textContent.trim().substring(1);

  if (selectedThemes[category].includes(theme)) {
    selectedThemes[category] = selectedThemes[category].filter(
      (t) => t !== theme
    );
    button.classList.remove("bg-blue-500", "text-white");
    button.classList.add("bg-blue-100", "text-blue-800");
  } else {
    selectedThemes[category].push(theme);
    button.classList.add("bg-blue-500", "text-white");
    button.classList.remove("bg-blue-100", "text-blue-800");
  }
  localStorage.setItem("selectedThemes", JSON.stringify(selectedThemes));
}

// 데이터를 다른 페이지로 전송하고 리디렉션하는 함수
function sendDataAndRedirect(redirectUrl) {
  const cityInput = document.getElementById("cityInput").value;

  if (!cityInput) {
    showAlert("도시와 나라를 입력해주세요.");
    return;
  }

  const [city, country] = cityInput.split(",").map((part) => part.trim());

  if (!city || !country) {
    showAlert(
      "도시와 나라를 쉼표(,)로 구분하여 입력해주세요 예시)서울,대한민국"
    );
    return;
  }

  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  localStorage.setItem("selectedCity", city);
  localStorage.setItem("selectedCountry", country);
  localStorage.setItem("startDate", startDate);
  localStorage.setItem("endDate", endDate);

  const dataToSend = {
    selectedCity: city,
    selectedCountry: country,
    selectedThemes: selectedThemes,
    startDate: startDate,
    endDate: endDate,
    destinations: [],
  };

  localStorage.setItem("tempData", JSON.stringify(dataToSend));
  window.location.href = redirectUrl;
}

// 커스텀 알림 모달 함수
function showAlert(message) {
  document.getElementById("alertMessage").textContent = message;
  document.getElementById("customAlert").classList.remove("hidden");
}

function closeAlert() {
  document.getElementById("customAlert").classList.add("hidden");
}
