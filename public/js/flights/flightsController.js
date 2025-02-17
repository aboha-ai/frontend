import { flightsSearch } from "./flightsSearch.js";

export function setupFlightEventHandlers() {
  const searchButton = document.getElementById("search-flights");

  if (!searchButton) {
    console.error("❌ 검색 버튼 (#search-flights)을 찾을 수 없음!");
    return;
  }

  console.log("✅ 검색 버튼 찾음! 이벤트 리스너 추가 중...");

  searchButton.addEventListener("click", async (event) => {
    event.preventDefault(); // 기본 폼 제출 방지
    console.log("🛠 버튼 클릭 감지됨!");

    // 입력값 가져오기
    const departure = document.querySelector(
      "input[placeholder='출발 공항 선택']"
    ).value;
    const arrival = document.querySelector(
      "input[placeholder='도착 공항 선택']"
    ).value;
    const date = document.querySelector("input[type='date']").value;
    const passengers = document.querySelector("select").value;

    // 데이터 검증: 입력 필드가 비어 있으면 경고 메시지 표시
    if (!departure || !arrival || !date || !passengers) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    console.log("🔍 검색 요청:", { departure, arrival, date, passengers });

    // flightsSearch 메서드를 호출하여 검색 수행
    await flightsSearch(departure, arrival, date, passengers);
  });
}
