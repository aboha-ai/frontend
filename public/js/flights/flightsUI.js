/**
 * 항공권 검색 결과를 동적으로 렌더링하는 함수
 * @param {Array} flights - 검색된 항공권 리스트
 */
// 항공권 검색 결과를 동적으로 렌더링하는 함수
export function renderFlightResults(flights) {
  const flightsListContainer = document.getElementById("flights-list");
  flightsListContainer.innerHTML = ""; // 기존 목록 초기화

  // 검색 결과가 없을 경우 메시지 출력 후 함수 종료
  if (flights.length === 0) {
    flightsListContainer.innerHTML = `<p class="text-gray-500 text-center">검색된 항공권이 없습니다.</p>`;
    return;
  }

  flights.forEach((flight) => {
    // 항공권 카드 컨테이너 생성
    const flightCard = document.createElement("div");
    flightCard.className =
      "bg-white rounded-lg shadow-sm overflow-hidden flex flex-col"; // 스타일 적용

    // 카드 내부 HTML 구조 생성
    flightCard.innerHTML = `
        <!-- 이미지 영역 -->
        <div class="w-full h-28 overflow-hidden">
            <img src="${flight.logo}" alt="${
      flight.airline
    }" class="object-cover" />
        </div>

        <!-- 항공권 정보 영역 -->
        <div class="p-4 flex flex-col">
            <h3 class="text-lg font-medium text-gray-900">${
              flight.departureTime
            } ⟶ ${flight.arrivalTime}</h3>
            <p class="text-sm text-gray-500 mb-2">${flight.airline} (${
      flight.flightNumber
    })</p>    

            <!-- 가격 및 클래스 정보 -->
            <div class="flex flex-col mt-2">
                <p class="text-sm text-gray-500">${flight.class} 클래스</p>
                <p class="text-lg font-bold text-gray-900">₩${flight.price.toLocaleString()}</p>
            </div>

            <!-- 예매 버튼 -->
            <div class="mt-4 flex justify-end">
                <a href="${flight.purchaseLink}" target="_blank">
                    <button class="!rounded-button bg-custom text-white px-4 py-2 hover:bg-opacity-90 transition-colors">
                        예매하기
                    </button>
                </a>
            </div>
        </div>
    `;

    // 생성된 카드 요소를 결과 목록 컨테이너에 추가
    flightsListContainer.appendChild(flightCard);
  });
}
