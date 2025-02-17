export async function fetchStays(location, checkIn, checkOut, guests) {
  const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const SERVER_URL = isLocal
    ? "http://localhost:3000"
    : "https://yellow-atom-tea.glitch.me";
  try {
    const response = await fetch(
      `${SERVER_URL}/stays?location=${location}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
    );

    if (!response.ok) {
      throw new Error("API 응답 오류");
    }

    const stays = await response.json();
    console.log(stays);
    return stays;
  } catch (error) {
    console.error("❌ 숙소 검색 중 오류 발생:", error);
    return [];
  }
}
