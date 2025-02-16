export async function fetchStays(location, checkIn, checkOut, guests) {
  try {
    const response = await fetch(
      `https://yellow-atom-tea.glitch.me/api/stays?location=${location}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
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
