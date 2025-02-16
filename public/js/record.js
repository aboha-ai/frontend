document.addEventListener("DOMContentLoaded", function () {
    // 여행 기록 데이터
    const travelData = [
        {
            title: "도쿄 로컬 카페 탐방",
            date: "2024년 2월 15일",
            location: "도쿄, 일본",
            imgSrc: "https://ai-public.creatie.ai/gen_page/travel_tokyo.jpg",
            link: "#"
        },
        {
            title: "파리의 아름다운 봄",
            date: "2024년 1월 20일",
            location: "파리, 프랑스",
            imgSrc: "https://ai-public.creatie.ai/gen_page/travel_paris.jpg",
            link: "#"
        },
        {
            title: "방콕 길거리 음식 탐방",
            date: "2023년 12월 5일",
            location: "방콕, 태국",
            imgSrc: "https://ai-public.creatie.ai/gen_page/travel_bangkok.jpg",
            link: "#"
        }
    ];

    // 일정 기록 데이터
    const scheduleData = [
        {
            title: "주말 서울 나들이",
            date: "2024년 2월 10일",
            location: "서울, 한국",
            imgSrc: "https://ai-public.creatie.ai/gen_page/schedule_1.jpg",
            link: "#"
        },
        {
            title: "제주도 힐링 여행",
            date: "2024년 1월 5일",
            location: "제주도, 한국",
            imgSrc: "https://ai-public.creatie.ai/gen_page/schedule_2.jpg",
            link: "#"
        },
        {
            title: "부산 맛집 투어",
            date: "2023년 12월 15일",
            location: "부산, 한국",
            imgSrc: "https://ai-public.creatie.ai/gen_page/schedule_3.jpg",
            link: "#"
        }
    ];

    // 데이터를 동적으로 렌더링하는 함수
    function renderData(data, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';  // 기존 내용을 초기화

        data.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('bg-white', 'rounded-lg', 'shadow', 'overflow-hidden');
            
            card.innerHTML = `
                <img src="${item.imgSrc}" alt="${item.title}" class="w-full h-48 object-cover"/>
                <div class="p-4">
                    <h3 class="font-bold text-lg mb-2">${item.title}</h3>
                    <p class="text-gray-600 text-sm mb-3">${item.date}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500"><i class="fas fa-map-marker-alt mr-1"></i>${item.location}</span>
                        <a href="${item.link}" class="text-custom hover:text-custom-dark">
                            <i class="fas fa-angle-right"></i>
                        </a>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    }

    // 여행 기록과 일정 기록을 동적으로 렌더링
    renderData(travelData, 'travel-records');
    renderData(scheduleData, 'schedule-records');
});
