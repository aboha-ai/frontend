// script.js

let map; // Google Map 객체 저장 (필수)

let selectedThemes = []; // 선택된 테마 저장

// Google Maps 초기화 함수

window.initMap = () => {
  const mapDiv = document.createElement("div"); // 빈 div (실제 지도 표시 X)

  map = new google.maps.Map(mapDiv); // PlacesService 사용하려면 Map 객체 필요

  console.log("Google Maps API initialized");
};

// 페이지 로드 시: 테마 버튼, 찾기 버튼, 초기화 버튼 이벤트 리스너 등록

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

  initializeThemeButtons();

  document.getElementById("destinationList").innerHTML = "";

  document.getElementById("destinationResults").classList.add("hidden");
}

// 테마 선택 모달 열기/닫기

function openThemeModal() {
  document.getElementById("themeModal").classList.remove("hidden");
}

function closeThemeModal() {
  document.getElementById("themeModal").classList.add("hidden");
}

// 테마 버튼 초기화 (이벤트 리스너, 선택 상태 복원)

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

// 테마 버튼 클릭 핸들러

function buttonClickHandler(event) {
  toggleTheme(event.currentTarget);
}

// 테마 선택/해제

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

// 여행지 정보 가져오기 (Google Maps Places API 사용)

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
  } // 로컬 스토리지 키 생성 (도시 이름 포함)

  const storageKey = `travelDestinations_${city}`;

  const lastApiCallKey = `lastApiCallTimestamp_${city}`;

  const lastApiCall = localStorage.getItem(lastApiCallKey);

  const now = Date.now();

  const twentyFourHours = 24 * 60 * 60 * 1000;

  if (!lastApiCall || now - lastApiCall > twentyFourHours) {
    //로컬스토리지에 해당 도시 검색기록 없으면, 로컬스토리지 데이터 삭제.

    localStorage.removeItem(storageKey);

    localStorage.removeItem(lastApiCallKey);

    try {
      const service = new google.maps.places.PlacesService(map);

      const request = {
        query: `${city} ${selectedThemes.join(" ")}`, // 검색어 (도시 + 테마) // fields: ['name', 'formatted_address', 'place_id', 'geometry', 'photos', 'rating', 'types'], // 필요한 필드 지정 // location: { lat: 37.5665, lng: 126.9780 },  서울 중심 좌표 (예시), city 값을 기반으로 좌표를 가져오는 로직 필요 // radius: '5000', //미터단위
      }; //textSearch사용

      service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          // 요청 성공

          console.log("Places API results:", results); // results 배열에서 필요한 정보 (이름, 설명 등)를 추출하여 destinations 배열 생성

          const destinations = results.map((place) => ({
            id: place.place_id, // Google Maps의 place_id 사용

            name: place.name,

            description: place.formatted_address, // 주소를 설명으로 사용 (필요에 따라 수정) // rating: place.rating, // 평점 (필요한 경우) // photos: place.photos, // 사진 (필요한 경우)
          }));

          localStorage.setItem(storageKey, JSON.stringify(destinations));

          localStorage.setItem(lastApiCallKey, Date.now().toString());

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
  } else {
    // 로컬 스토리지 데이터 사용 (해당 도시의 데이터)

    const cachedDestinations = localStorage.getItem(storageKey);

    if (cachedDestinations) {
      const destinations = JSON.parse(cachedDestinations);

      displayDestinations(destinations, city); // 수정: 도시 이름 전달

      document.getElementById("destinationResults").classList.remove("hidden");

      console.log(`Using cached data for ${city} from localStorage`);
    } else {
      //해당도시의 데이터가 로컬스토리지에 없음.

      // 로컬 스토리지에 데이터가 없으면 API 호출 (새로운 도시일 경우)

      localStorage.removeItem(storageKey);

      localStorage.removeItem(lastApiCallKey);

      try {
        const service = new google.maps.places.PlacesService(map);

        const request = {
          query: `${city} ${selectedThemes.join(" ")}`, // 검색어 (도시 + 테마) // fields: ['name', 'formatted_address', 'place_id', 'geometry', 'photos', 'rating', 'types'], // 필요한 필드 지정 // location: { lat: 37.5665, lng: 126.9780 },  서울 중심 좌표 (예시), city 값을 기반으로 좌표를 가져오는 로직 필요 // radius: '5000', //미터단위
        }; //textSearch사용

        service.textSearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            // 요청 성공

            console.log("Places API results:", results); // results 배열에서 필요한 정보 (이름, 설명 등)를 추출하여 destinations 배열 생성

            const destinations = results.map((place) => ({
              id: place.place_id, //Google Maps의 place_id를 사용

              name: place.name,

              description: place.formatted_address, // 주소를 설명으로 사용 (필요에 따라 수정) // rating: place.rating, // 평점 (필요한 경우) // photos: place.photos, // 사진 (필요한 경우)
            }));

            localStorage.setItem(storageKey, JSON.stringify(destinations));

            localStorage.setItem(lastApiCallKey, Date.now().toString());

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

//새로운 결과를  표시하기 위해, 이전결과를 지우고, 도시제목과 함께 카드들을 생성.

async function displayDestinations(destinations, city) {
  const destinationListContainer = document.getElementById("destinationList");

  destinationListContainer.innerHTML = ""; // 기존 목록 지우기 // 새로운 추천 결과를 위한 컨테이너 생성

  const newDestinationsContainer = document.createElement("div");

  newDestinationsContainer.className = "mb-8"; // 마진 추가 (선택 사항) // 도시 이름 제목 추가

  const cityTitle = document.createElement("h3");

  cityTitle.className = "text-xl font-bold text-gray-800 mb-4";

  cityTitle.textContent = `${city} 추천 여행지`;

  newDestinationsContainer.appendChild(cityTitle);

  if (destinations && destinations.length > 0) {
    for (const destination of destinations) {
      const destinationCard = await createDestinationCard(destination);

      newDestinationsContainer.appendChild(destinationCard);
    }
  } else {
    newDestinationsContainer.innerHTML =
      "<p>추천 여행지를 찾을 수 없습니다.</p>";
  } // 기존 목록에 새로운 컨테이너 추가

  destinationListContainer.appendChild(newDestinationsContainer);
}

async function createDestinationCard(destination) {
  const card = document.createElement("div");

  card.className = "bg-white rounded-lg shadow-md p-4";

  const title = document.createElement("h3");

  title.className = "text-lg font-semibold text-gray-800 mb-2";

  title.textContent = destination.name;

  const description = document.createElement("p");

  description.className = "text-gray-700 text-sm mb-4";

  description.textContent = destination.description;

  const buttonsDiv = document.createElement("div");

  buttonsDiv.className = "flex justify-end gap-2";

  const tipsButton = document.createElement("button");

  tipsButton.className =
    "px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none text-sm";

  tipsButton.textContent = "여행팁 보러가기";

  tipsButton.onclick = () => goToTravelTips(destination.id);

  const itineraryButton = document.createElement("button");

  itineraryButton.className =
    "px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none text-sm";

  itineraryButton.textContent = "일정 짜주기";

  itineraryButton.onclick = () => generateItinerary(destination.id);

  buttonsDiv.appendChild(tipsButton);

  buttonsDiv.appendChild(itineraryButton);

  card.appendChild(title);

  card.appendChild(description);

  card.appendChild(buttonsDiv);

  return card;
}

function goToTravelTips(destinationId) {
  alert(`여행팁 보러가기: ${destinationId}`);
}

async function generateItinerary(destinationId) {
  alert(`일정 짜주기: ${destinationId}`);
}
