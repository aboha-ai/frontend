import { fetchStays } from "./staysApi.js";
import { renderStayResults } from "./staysUI.js";

document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("search-stays");
  if (!searchButton) {
    console.error("❌ 검색 버튼을 찾을 수 없습니다.");
    return;
  }

  searchButton.addEventListener("click", async (event) => {
    event.preventDefault(); // 기본 폼 제출 방지

    // 🔹 올바른 ID를 사용하여 값 가져오기
    const locationInput = document.getElementById("stay-location");
    const checkInInput = document.getElementById("check-in");
    const checkOutInput = document.getElementById("check-out");
    const guestsInput = document.getElementById("guests");

    // 🔹 요소가 실제로 존재하는지 확인
    if (!locationInput || !checkInInput || !checkOutInput || !guestsInput) {
      console.error("❌ 입력 필드를 찾을 수 없습니다.");
      return;
    }

    const location = locationInput.value.trim();
    const checkIn = checkInInput.value;
    const checkOut = checkOutInput.value;
    const guests = guestsInput.value;

    // 유효성 검사
    if (!location || !checkIn || !checkOut || !guests) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    console.log("🔍 검색 요청:", { location, checkIn, checkOut, guests });

    try {
      // API 호출
      const stays = await fetchStays(location, checkIn, checkOut, guests);

      // 결과 UI 업데이트
      renderStayResults(stays);
    } catch (error) {
      console.error("❌ 숙소 검색 중 오류 발생:", error);
    }
  });
});

// 푸터를 로드하는 함수
async function loadFooter() {
  const response = await fetch("/docs/page/footer.html"); // footer.html을 가져옴
  const footerHTML = await response.text();
  document.getElementById("footer-container").innerHTML = footerHTML;
}

// 페이지가 로드될 때 푸터 삽입
document.addEventListener("DOMContentLoaded", function () {
  loadFooter();
});
