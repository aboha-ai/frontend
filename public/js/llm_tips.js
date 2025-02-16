/**
 * ✅ 특정 장소의 여행 팁을 가져오는 함수
 */
window.getTipsForPlace = async function (placeName) {
  console.log(`📍 서버로 여행 팁 요청: 장소 - ${placeName}`);

  try {
    const response = await fetch("http://localhost:3000/api/tips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeName }),
    });

    if (!response.ok) throw new Error("서버 요청 실패");

    const data = await response.json();
    console.log("🔍 서버 응답 데이터:", data);

    // ✅ 새로운 팁을 캐러셀에 추가
    addTipToCarousel(placeName, data);
  } catch (error) {
    console.error(`❌ 서버 오류:`, error.message);
  }
};

/**
 * ✅ 새로운 장소의 팁을 캐러셀에 추가하는 함수
 */
function addTipToCarousel(placeName, data) {
  let tipsContainer = document.getElementById("tipsContainer");
  let tripTipsSection = document.querySelector(".trip-tips");

  // ✅ `tipsContainer`가 없으면 추가
  if (!tipsContainer) {
    const mainContainer = document.querySelector(".container");
    const tipsSection = document.createElement("section");
    tipsSection.classList.add("trip-tips");
    tipsSection.innerHTML = `
        <h2>여행 팁</h2>
        <div id="tipsContainer" class="carousel"></div>
      `;
    mainContainer.appendChild(tipsSection);
    tipsContainer = document.getElementById("tipsContainer");
  }

  // ✅ 여행 팁 섹션을 보이도록 설정
  tripTipsSection.style.display = "block";

  let rawText = data.response || "팁 데이터를 가져올 수 없습니다.";

  // ✅ 마크다운 제거 및 정리
  rawText = rawText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"); // 볼드 처리
  rawText = rawText.replace(/\*/g, ""); // * 제거

  // ✅ 주요 팁 / 회화 표현 / 자주 묻는 질문 분리
  const sections = rawText.split("### ");
  let majorTips = [],
    conversationTips = [],
    faqTips = [];

  sections.forEach((section) => {
    if (section.startsWith("주요 팁")) {
      majorTips = section
        .split("\n")
        .slice(1)
        .filter((line) => line.trim() !== "");
    } else if (section.startsWith("회화 표현")) {
      conversationTips = section
        .split("\n")
        .slice(1)
        .filter((line) => line.trim() !== "");
    } else if (section.startsWith("자주 묻는 질문")) {
      faqTips = section
        .split("\n")
        .slice(1)
        .filter((line) => line.trim() !== "");
    }
  });

  console.log("📝 주요 팁:", majorTips);
  console.log("🗣️ 회화 표현:", conversationTips);
  console.log("❓ 자주 묻는 질문:", faqTips);

  // ✅ 캐러셀 슬라이드 추가
  const slide = document.createElement("div");
  slide.classList.add("tip-slide");
  slide.innerHTML = `
      <div class="tip-box">
        <h3>📍 ${placeName}</h3>
        <div class="tip-content">
          <div class="tip-section">
            <h4>📄 주요 팁</h4>
            <ul>${majorTips.map((tip) => `<li>${tip}</li>`).join("")}</ul>
            <button class="save-btn" onclick="saveTip(event, '${placeName}', 'majorTips')">📝 팁 저장</button>
          </div>
  
          <div class="tip-section">
            <h4>💬 회화 표현</h4>
            <ul>${conversationTips
              .map((tip) => `<li>${tip}</li>`)
              .join("")}</ul>
            <button class="save-btn" onclick="saveTip(event, '${placeName}', 'conversationTips')">📌 회화 저장</button>
          </div>
  
          <div class="tip-section">
            <h4>❓ 자주 묻는 질문</h4>
            <ul>${faqTips.map((tip) => `<li>${tip}</li>`).join("")}</ul>
            <button class="save-btn" onclick="saveTip(event, '${placeName}', 'faqTips')">📖 FAQ 저장</button>
          </div>
        </div>
      </div>
    `;

  tipsContainer.appendChild(slide);
  manageCarouselItems();
  scrollCarouselToEnd();
}

/**
 * ✅ 캐러셀의 최대 개수를 유지하고 오래된 항목 삭제
 */
function manageCarouselItems() {
  let tipsContainer = document.getElementById("tipsContainer");
  let slides = tipsContainer.querySelectorAll(".tip-slide");

  const MAX_CAROUSEL_ITEMS = 5; // 최대 5개까지만 유지
  if (slides.length > MAX_CAROUSEL_ITEMS) {
    tipsContainer.removeChild(slides[0]); // 가장 오래된 팁 삭제
  }
}

/**
 * ✅ 캐러셀이 새로 추가된 슬라이드로 자동 스크롤되도록 설정
 */
function scrollCarouselToEnd() {
  let tipsContainer = document.getElementById("tipsContainer");
  tipsContainer.scrollLeft = tipsContainer.scrollWidth;
}

/**
 * ✅ 팁을 로컬스토리지에 저장하는 함수 (이벤트 객체 추가)
 */
window.saveTip = function (event, placeName, category) {
  let savedTips = JSON.parse(localStorage.getItem("travelTips")) || {};

  if (!savedTips[placeName]) {
    savedTips[placeName] = {
      majorTips: [],
      conversationTips: [],
      faqTips: [],
    };
  }

  // ✅ 클릭된 버튼이 속한 `.tip-box`에서 li 리스트 찾기
  let button = event.target;
  let tipBox = button.closest(".tip-section");
  let tipList = tipBox.querySelectorAll("ul li");

  if (!tipList || tipList.length === 0) {
    console.warn(`⚠️ 저장할 데이터 없음: ${category}`);
    return;
  }

  // ✅ 리스트 항목 저장
  savedTips[placeName][category] = Array.from(tipList).map(
    (li) => li.innerText
  );
  localStorage.setItem("travelTips", JSON.stringify(savedTips));

  console.log(`✅ ${placeName} - ${category} 저장 완료!`, savedTips);

  // ✅ Alert 메시지 간단하게 변경
  let alertMessage = {
    majorTips: "팁 저장 완료!",
    conversationTips: "회화 표현 저장 완료!",
    faqTips: "FAQ 저장 완료!",
  };

  alert(alertMessage[category]); // ✅ 사용자 친화적인 메시지 출력
};
