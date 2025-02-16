// 선택된 테마를 카테고리별로 저장할 객체
let selectedThemes = {
  accommodation: [], // 숙소
  food: [], // 맛집
  attractions: [], // 관광지
};

// 페이지 로드 시: 이벤트 리스너 등록
document.addEventListener("DOMContentLoaded", () => {
  // 저장된 테마 불러오기 (페이지 로드 시)
  const savedThemes = localStorage.getItem("selectedThemes");
  if (savedThemes) {
    selectedThemes = JSON.parse(savedThemes);
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
      console.log("나의 여행 기록 보기 버튼 클릭 (임시)");
    });
  }

  // "새 기록 작성" 버튼 클릭 이벤트 (임시)
  const openVlogModalButton = document.getElementById("openVlogModalButton");
  if (openVlogModalButton) {
    openVlogModalButton.addEventListener("click", () => {
      console.log("새 기록 작성 버튼 클릭 (임시)");
    });
  }

  // "여행 팁 보러가기" 버튼 클릭 이벤트 (모달 내부)
  const tipsButton = document.getElementById("tipsButton");
  if (tipsButton) {
    tipsButton.addEventListener("click", () => {
      sendDataAndRedirect("/travel-tips.html");
    });
  }

  // "일정 짜주기" 버튼 클릭 이벤트 (모달 내부)
  const itineraryButton = document.getElementById("itineraryButton");
  if (itineraryButton) {
    itineraryButton.addEventListener("click", () => {
      sendDataAndRedirect("/itinerary.html");
    });
  }
});

// 로컬 스토리지 초기화
function resetLocalStorage() {
  localStorage.clear();
  alert("로컬 스토리지 데이터가 초기화되었습니다.");
  selectedThemes = {
    accommodation: [],
    food: [],
    attractions: [],
  };
  initializeThemeButtons();
}

// 테마 선택 모달 관련 함수들
function openThemeModal() {
  const cityInput = document.getElementById("cityInput").value;
  if (!cityInput) {
    alert("도시와 나라를 입력해주세요.");
    return;
  }
  // 쉼표로 도시와 나라 분리
  const [city, country] = cityInput.split(",").map((part) => part.trim());

  if (!city || !country) {
    alert("도시와 나라를 쉼표(,)로 구분하여 입력해주세요 예시)서울,대한민국");
    return;
  }

  document.getElementById(
    "modal-title"
  ).textContent = `여행 테마 선택 - ${cityInput}`; // 모달 제목 변경
  document.getElementById("themeModal").classList.remove("hidden");
}

// "취소" 버튼을 눌러서 모달을 닫을 때,  *아무것도 저장 안함*.
function closeThemeModal() {
  document.getElementById("themeModal").classList.add("hidden");
}

// 테마 버튼 초기화 및 이벤트 핸들러 연결
function initializeThemeButtons() {
  const themeButtons = document.querySelectorAll(".theme-button"); // 클래스 선택자 사용
  themeButtons.forEach((button) => {
    button.removeEventListener("click", handleThemeButtonClick);
    button.addEventListener("click", handleThemeButtonClick);

    const category = button.dataset.category; // data-category 속성 값 (accommodation, food, attractions)
    const theme = button.textContent.trim().substring(1); // '#' 제거 후, 앞뒤 공백 제거

    // 저장된 테마에 따라 버튼 스타일 초기화
    if (selectedThemes[category]?.includes(theme)) {
      button.classList.add("bg-blue-500", "text-white");
      button.classList.remove("bg-blue-100", "text-blue-800");
    } else {
      button.classList.remove("bg-blue-500", "text-white");
      button.classList.add("bg-blue-100", "text-blue-800");
    }
  });
}

// 테마 버튼 클릭 핸들러: 선택/해제 시, 스타일(클래스) 변경 및 selectedThemes 객체 업데이트
function handleThemeButtonClick(event) {
  const button = event.currentTarget;
  const category = button.dataset.category; // data-category 속성 값
  const theme = button.textContent.trim().substring(1); // '#' 제거, 앞뒤 공백 제거

  if (selectedThemes[category].includes(theme)) {
    // 이미 선택된 테마 -> 제거
    selectedThemes[category] = selectedThemes[category].filter(
      (t) => t !== theme
    );
    button.classList.remove("bg-blue-500", "text-white");
    button.classList.add("bg-blue-100", "text-blue-800"); // 선택 해제 시 스타일
  } else {
    // 선택되지 않은 테마 -> 추가
    selectedThemes[category].push(theme);
    button.classList.add("bg-blue-500", "text-white"); // 선택 시 스타일
    button.classList.remove("bg-blue-100", "text-blue-800");
  }

  // localStorage에 변경된 selectedThemes 객체 저장
  localStorage.setItem("selectedThemes", JSON.stringify(selectedThemes));
}

// 데이터를 다른 페이지로 전송하고 리디렉션하는 함수
function sendDataAndRedirect(redirectUrl) {
  const cityInput = document.getElementById("cityInput").value;

  if (!cityInput) {
    alert("도시와 나라를 입력해주세요.");
    return;
  }

  const [city, country] = cityInput.split(",").map((part) => part.trim());

  if (!city || !country) {
    alert("도시와 나라를 쉼표(,)로 구분하여 입력해주세요 예시)서울,대한민국");
    return;
  }

  //  localStorage에, city와 country를 저장.
  localStorage.setItem("selectedCity", city);
  localStorage.setItem("selectedCountry", country);

  // 전송할 데이터 객체 생성 (선택된 도시와 테마)
  const dataToSend = {
    selectedCity: city, // 도시 이름
    selectedCountry: country, // 나라 이름
    selectedThemes: selectedThemes, // 카테고리별 테마 객체
    destinations: [], // 빈 배열 (index.html에서는 destinations 정보 사용 안 함)
  };

  // 데이터를 로컬 스토리지에 임시 저장 (페이지 이동 시 데이터 유지)
  localStorage.setItem("tempData", JSON.stringify(dataToSend));

  // 지정된 URL로 리디렉션
  window.location.href = redirectUrl;
}
