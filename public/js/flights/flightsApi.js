export async function fetchFlights(departure, arrival, date, passengers) {
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const SERVER_URL = isLocal
    ? "http://localhost:3000"
    : "https://yellow-atom-tea.glitch.me";
  try {
    const url = `${SERVER_URL}/flights?departure=${encodeURIComponent(
      departure
    )}&arrival=${encodeURIComponent(arrival)}&date=${encodeURIComponent(
      date
    )}&passengers=${encodeURIComponent(passengers)}`;

    console.log("📡 요청 URL:", url); // 요청 URL 출력

    const response = await fetch(url);
    console.log("📩 응답 상태 코드:", response.status); // 응답 상태 코드 출력

    if (!response.ok) {
      throw new Error("API 응답 오류");
    }

    const flights = await response.json();

    console.log("🛬 클라이언트에서 flights 데이터:", flights); // flights 배열 출력

    return flights;
  } catch (error) {
    console.error("❌ API 요청 중 오류 발생:", error);
    return [];
  }
}

// // ✅ `fetchFlights` 실행 후 `flights` 데이터 출력
// fetchFlights("ICN", "JFK", "2025-02-21", 1).then((data) => {
//   console.log("🎯 최종 flights 데이터:", flights);
// });
