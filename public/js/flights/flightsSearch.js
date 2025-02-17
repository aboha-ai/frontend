import { fetchFlights } from "./flightsApi.js";
import { renderFlightResults } from "./flightsUI.js";

export async function flightsSearch(departure, arrival, date, passengers) {
  try {
    console.log("📡 검색 요청:", { departure, arrival, date, passengers });

    // API를 통해 항공권 정보를 가져옴
    const flights = await fetchFlights(departure, arrival, date, passengers);

    // 검색된 항공권을 UI에 렌더링
    renderFlightResults(flights);
  } catch (error) {
    console.error("❌ 항공권 검색 중 오류 발생:", error);
  }
}
