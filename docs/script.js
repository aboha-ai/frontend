// script.js (index.html)

let selectedThemes = []; // 선택된 테마 저장
let selectedDestinations = []; // 선택된 여행지 ID 저장 배열

// 페이지 로드 시: 이벤트 리스너 등록
document.addEventListener("DOMContentLoaded", () => {
  initializeThemeButtons();

  const searchButton = document.getElementById("searchButton");
  if (searchButton) {
    searchButton.addEventListener("click", openThemeModal);
  }

  const selectThemesButton = document.getElementById("selectThemesButton");
  if (selectThemesButton) {
    selectThemesButton.addEventListener("click", getTravelDestinations);
  }

  const closeModalButton = document.getElementById("closeModalButton");
  if (closeModalButton) {
    closeModalButton.addEventListener("click", closeThemeModal);
  }

  const resetButton = document.getElementById("resetButton");
  if (resetButton) {
    resetButton.addEventListener("click", resetLocalStorage);
  }
});

// 로컬 스토리지 초기화
function resetLocalStorage() {
  localStorage.clear();
  alert("로컬 스토리지 데이터가 초기화되었습니다.");
  selectedThemes = [];
  selectedDestinations = []; // 선택된 여행지 초기화
  initializeThemeButtons();
  document.getElementById("destinationList").innerHTML = "";
  document.getElementById("destinationResults").classList.add("hidden");
}

// 테마 선택 모달 관련 함수들 (기존 코드와 동일)
function openThemeModal() {
  document.getElementById("themeModal").classList.remove("hidden");
}

function closeThemeModal() {
  document.getElementById("themeModal").classList.add("hidden");
}

function initializeThemeButtons() {
  const themeButtons = document.querySelectorAll("#themeTags button");
  themeButtons.forEach((button) => {
    button.removeEventListener("click", buttonClickHandler);
    button.addEventListener("click", buttonClickHandler);

    const savedThemes = localStorage.getItem("selectedThemes");
    if (savedThemes) {
      selectedThemes = JSON.parse(savedThemes);
    }

    const theme = button.innerText;
    if (selectedThemes.includes(theme)) {
      button.classList.add("bg-blue-200");
    } else {
      button.classList.remove("bg-blue-200");
    }
  });
}

function buttonClickHandler(event) {
  toggleTheme(event.currentTarget);
}

function toggleTheme(button) {
  const theme = button.innerText;
  if (selectedThemes.includes(theme)) {
    selectedThemes = selectedThemes.filter((item) => item !== theme);
    button.classList.remove("bg-blue-200");
  } else {
    selectedThemes.push(theme);
    button.classList.add("bg-blue-200");
  }

  localStorage.setItem("selectedThemes", JSON.stringify(selectedThemes));
}

// 여행지 정보 가져오기 (Places API 사용)
async function getTravelDestinations() {
  closeThemeModal();
  const city = document.getElementById("cityInput").value;

  if (!city) {
    alert("도시를 입력해주세요.");
    return;
  }

  if (selectedThemes.length === 0) {
    alert("여행 테마를 하나 이상 선택해주세요.");
    openThemeModal();
    return;
  }

  const storageKey = `travelDestinations_${city}`;
  const lastApiCallKey = `lastApiCallTimestamp_${city}`;
  const lastApiCall = localStorage.getItem(lastApiCallKey);
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  if (!lastApiCall || now - lastApiCall > twentyFourHours) {
    // ... (API 호출 로직은 이전과 동일) ...
    localStorage.removeItem(storageKey);
    localStorage.removeItem(lastApiCallKey);

    try {
      //  PlacesService에 빈 div를 전달.
      const service = new google.maps.places.PlacesService(
        document.createElement("div")
      );
      const request = {
        query: `${city} ${selectedThemes.join(" ")}`, // 검색어 (도시 + 테마)
      };

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          console.log("Places API results:", results);
          const destinations = results.map((place) => ({
            id: place.place_id,
            name: place.name,
            description: place.formatted_address,
          }));

          localStorage.setItem(storageKey, JSON.stringify(destinations));
          localStorage.setItem(lastApiCallKey, now.toString());
          displayDestinations(destinations, city); // 체크박스와 함께 표시
          document
            .getElementById("destinationResults")
            .classList.remove("hidden");
        } else {
          console.error("Places API error:", status);
          alert("Places API 호출 오류: " + status);
        }
      });
    } catch (error) {
      console.error("API 호출 오류:", error);
      alert(`API 호출 오류: ${error.message}`);
    }
  } else {
    const cachedDestinations = localStorage.getItem(storageKey);
    if (cachedDestinations) {
      const destinations = JSON.parse(cachedDestinations);
      displayDestinations(destinations, city); // 체크박스와 함께 표시
      document.getElementById("destinationResults").classList.remove("hidden");
      console.log(`Using cached data for ${city} from localStorage`);
    } else {
      // 로컬 스토리지에 해당 도시 데이터가 없을 때  API 호출
      localStorage.removeItem(storageKey);
      localStorage.removeItem(lastApiCallKey);
      try {
        //  PlacesService에 빈 div 전달
        const service = new google.maps.places.PlacesService(
          document.createElement("div")
        );
        const request = {
          query: `${city} ${selectedThemes.join(" ")}`,
        };

        service.textSearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            console.log("Places API results:", results);
            const destinations = results.map((place) => ({
              id: place.place_id,
              name: place.name,
              description: place.formatted_address,
            }));

            localStorage.setItem(storageKey, JSON.stringify(destinations));
            localStorage.setItem(lastApiCallKey, now.toString());
            displayDestinations(destinations, city);
            document
              .getElementById("destinationResults")
              .classList.remove("hidden");
          } else {
            console.error("Places API error:", status);
            alert("Places API 호출 오류: " + status);
          }
        });
      } catch (error) {
        console.error("API 호출 오류:", error);
        alert(`API 호출 오류: ${error.message}`);
      }
    }
  }
}

// 여행지 목록 표시 (체크박스, 버튼 포함)
function displayDestinations(destinations, city) {
  const destinationListContainer = document.getElementById("destinationList");
  destinationListContainer.innerHTML = ""; // 기존 목록 지우기

  const cityTitle = document.createElement("h3");
  cityTitle.className = "text-xl font-bold text-gray-800 mb-4";
  cityTitle.textContent = `${city} 추천 여행지`;
  destinationListContainer.appendChild(cityTitle);

  const checkboxContainer = document.createElement("div");
  checkboxContainer.className = "mb-4";

  if (destinations && destinations.length > 0) {
    destinations.forEach((destination) => {
      const checkboxItem = document.createElement("div");
      checkboxItem.className = "flex items-center mb-2";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `checkbox-${destination.id}`;
      checkbox.value = destination.id;
      checkbox.className = "mr-2";
      checkbox.dataset.destinationId = destination.id; //  데이터 속성

      checkbox.addEventListener("change", (event) => {
        if (event.target.checked) {
          selectedDestinations.push(destination.id);
        } else {
          selectedDestinations = selectedDestinations.filter(
            (id) => id !== destination.id
          );
        }
        console.log("Selected destinations:", selectedDestinations);
      });

      const label = document.createElement("label");
      label.htmlFor = `checkbox-${destination.id}`;
      label.className = "flex-grow";
      label.innerHTML = `<span class="font-semibold">${destination.name}</span> - <span class="text-gray-600">${destination.description}</span>`;

      checkboxItem.appendChild(checkbox);
      checkboxItem.appendChild(label);
      checkboxContainer.appendChild(checkboxItem);
    });
  } else {
    checkboxContainer.innerHTML = "<p>추천 여행지를 찾을 수 없습니다.</p>";
  }

  destinationListContainer.appendChild(checkboxContainer);

  // 버튼 컨테이너
  const destinationButtonsDiv = document.getElementById("destinationButtons");
  destinationButtonsDiv.innerHTML = ""; // 기존 내용 지우기

  // "여행 팁 보러가기" 버튼
  const tipsButton = document.createElement("button");
  tipsButton.textContent = "여행 팁 보러가기";
  tipsButton.className =
    "px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none mr-2";
  tipsButton.addEventListener("click", () =>
    sendDataAndRedirect("./travel-tips.html")
  ); // 클릭 이벤트 핸들러
  destinationButtonsDiv.appendChild(tipsButton);

  // "일정 짜주기" 버튼
  const itineraryButton = document.createElement("button");
  itineraryButton.textContent = "일정 짜주기";
  itineraryButton.className =
    "px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none";
  itineraryButton.addEventListener("click", () =>
    sendDataAndRedirect("./itinerary.html")
  ); // 클릭 이벤트 핸들러
  destinationButtonsDiv.appendChild(itineraryButton);
}

// 데이터를 다른 페이지로 전송하고 리디렉션하는 함수
function sendDataAndRedirect(redirectUrl) {
  const city = document.getElementById("cityInput").value;
  const storageKey = `travelDestinations_${city}`;
  const allDestinations = JSON.parse(localStorage.getItem(storageKey)) || [];

  // 체크된 여행지 정보만 필터링
  const checkedDestinations = allDestinations.filter((dest) =>
    selectedDestinations.includes(dest.id)
  );

  if (checkedDestinations.length === 0) {
    alert("여행지를 선택해주세요.");
    return;
  }

  // 전송할 데이터 객체 생성
  const dataToSend = {
    city: city,
    themes: selectedThemes,
    destinations: checkedDestinations, // 체크된 여행지 정보
  };

  // 데이터를 로컬 스토리지에 임시 저장 (페이지 이동 시 데이터 유지)
  localStorage.setItem("tempData", JSON.stringify(dataToSend));

  // 지정된 URL로 리디렉션
  window.location.href = redirectUrl;
}
