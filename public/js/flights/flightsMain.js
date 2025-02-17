import { setupFlightEventHandlers } from "./flightsController.js";

console.log("🚀 flightsMain.js 실행됨!"); // 확인용 로그

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM 로드 완료!");
  setupFlightEventHandlers();
});
