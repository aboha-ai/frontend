export function renderStayResults(stays) {
  const staysListContainer = document.getElementById("stays-list");
  staysListContainer.innerHTML = ""; // 기존 목록 초기화

  // 검색 결과가 없을 경우 메시지 출력
  if (!stays || stays.length === 0) {
    staysListContainer.innerHTML = `<p class="text-gray-500 text-center">검색된 숙소가 없습니다.</p>`;
    return;
  }

  stays.forEach((stay, index) => {
    // 로컬 이미지 자동 매핑 (stays1.png, stays2.png ...)
    const imageIndex = (index % 10) + 1; // stays1.png ~ stays10.png 반복
    const localImage = `/public/images/stays/stays${imageIndex}.png`;

    // 숙소 카드 생성
    const stayCard = document.createElement("div");
    stayCard.className =
      "bg-white rounded-lg shadow-sm overflow-hidden flex flex-col";

    // HTML 구조 생성
    stayCard.innerHTML = `
        <div class="w-full h-48 overflow-hidden">
          <img src="${localImage}" alt="${
      stay.name
    }" class="object-cover w-full h-full" />
        </div>
        <div class="p-4 flex flex-col">
          <h3 class="text-lg font-medium text-gray-900">${stay.name}</h3>
          <p class="text-sm text-gray-500 mb-2">${stay.location}</p>

          <div class="flex items-center mb-3">
            <i class="fas fa-star text-yellow-400 mr-1"></i>
            <span class="font-medium">${stay.rating}</span>
            <span class="text-gray-500 text-sm ml-1">(${
              stay.reviews
            } 후기)</span>
          </div>

          <div class="flex flex-col mt-2">
            <p class="text-sm text-gray-500">1박 기준</p>
            <p class="text-lg font-bold text-gray-900">₩${stay.price.toLocaleString()}</p>
          </div>

          <div class="mt-4 flex justify-end">
            <a href="${stay.bookingLink}" target="_blank">
              <button class="!rounded-button bg-custom text-white px-4 py-2 hover:bg-opacity-90 transition-colors">
                예약하기
              </button>
            </a>
          </div>
        </div>
      `;

    // 목록 컨테이너에 추가
    staysListContainer.appendChild(stayCard);
  });
}
