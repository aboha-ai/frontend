if (!localStorage.getItem("tripData")) {
  fetch("/docs/travel_tips/data/tripData.json")
    .then((response) => response.json())
    .then((data) => {
      // 🚀 **배열이 아니라면 배열로 변환**
      const tripArray = Array.isArray(data) ? data : [data];

      localStorage.setItem("tripData", JSON.stringify(tripArray));
      console.log("✅ 여행 일정이 로컬스토리지에 저장되었습니다!", tripArray);
    })
    .catch((error) =>
      console.error("🚨 JSON 데이터를 불러오는데 실패했습니다!", error)
    );
} else {
  console.log("📌 이미 여행 일정이 로컬스토리지에 저장되어 있습니다.");
}
const additionalTrip = {
  title: "Seoul Adventure",
  location: {
    city: "Seoul",
    country: "South Korea",
    address: "Seoul Station, Seoul",
    arrival_time: "2025-05-10T12:00:00",
  },
  itinerary: [
    {
      day: 1,
      date: "2025-05-10",
      events: [
        {
          time: "09:00",
          title: "Breakfast at Gwangjang Market",
          location: "88 Changgyeonggung-ro, Jongno-gu, Seoul",
          reservation_required: false,
          details: {
            open_time: "08:00 - 22:00",
            cost: 10000,
            link: "https://www.visitseoul.net",
          },
        },
        {
          time: "11:00",
          title: "Gyeongbokgung Palace Tour",
          location: "161 Sajik-ro, Jongno-gu, Seoul",
          reservation_required: false,
          details: {
            open_time: "09:00 - 18:00",
            cost: 3000,
            link: "https://www.royalpalace.go.kr/",
          },
        },
        {
          time: "13:00",
          title: "Lunch at Tosokchon Samgyetang",
          location: "5 Jahamun-ro 5-gil, Jongno-gu, Seoul",
          reservation_required: false,
          details: {
            open_time: "10:00 - 22:00",
            cost: 17000,
            link: "https://www.tosokchon.com/",
          },
        },
        {
          time: "15:30",
          title: "Bukchon Hanok Village",
          location: "37 Gyedong-gil, Jongno-gu, Seoul",
          reservation_required: false,
          details: {
            open_time: "24 hours",
            cost: null,
            link: "https://www.visitseoul.net",
          },
        },
        {
          time: "19:00",
          title: "Dinner at Namsan Tower N.Grill",
          location: "Namsan Seoul Tower, Yongsan-gu, Seoul",
          reservation_required: true,
          details: {
            open_time: "17:00 - 22:00",
            cost: 80000,
            link: "https://www.nseoultower.co.kr/",
          },
        },
      ],
    },
    {
      day: 2,
      date: "2025-05-11",
      events: [
        {
          time: "08:00",
          title: "Breakfast at Cafe Onion Anguk",
          location: "5 Gye-dong, Jongno-gu, Seoul",
          reservation_required: false,
          details: {
            open_time: "08:00 - 22:00",
            cost: 15000,
            link: "https://www.cafeonion.com/",
          },
        },
        {
          time: "10:00",
          title: "DMZ Tour",
          location: "Paju, Gyeonggi-do",
          reservation_required: true,
          details: {
            open_time: "08:00 - 17:00",
            cost: 60000,
            link: "https://www.dmztours.com/",
          },
        },
        {
          time: "13:30",
          title: "Lunch at Gaeseong Mandu Koong",
          location: "11-3 Insadong 10-gil, Jongno-gu, Seoul",
          reservation_required: false,
          details: {
            open_time: "11:00 - 20:00",
            cost: 12000,
            link: "https://www.koong.co.kr/",
          },
        },
        {
          time: "16:00",
          title: "Lotte World",
          location: "240 Olympic-ro, Songpa-gu, Seoul",
          reservation_required: true,
          details: {
            open_time: "09:30 - 22:00",
            cost: 59000,
            link: "https://www.lotteworld.com/",
          },
        },
        {
          time: "20:00",
          title: "Dinner at Myeongdong Kyoja",
          location: "29 Myeongdong 10-gil, Jung-gu, Seoul",
          reservation_required: false,
          details: {
            open_time: "10:30 - 21:30",
            cost: 10000,
            link: "https://www.mdkyoja.com/",
          },
        },
      ],
    },
    {
      day: 3,
      date: "2025-05-12",
      events: [
        {
          time: "09:00",
          title: "Breakfast at Starbucks Reserve The Bukchon",
          location: "48 Bukchon-ro 5-gil, Jongno-gu, Seoul",
          reservation_required: false,
          details: {
            open_time: "07:00 - 21:00",
            cost: 8000,
            link: "https://www.starbucks.co.kr/",
          },
        },
        {
          time: "11:00",
          title: "COEX Aquarium",
          location: "513 Yeongdong-daero, Gangnam-gu, Seoul",
          reservation_required: true,
          details: {
            open_time: "10:00 - 21:00",
            cost: 28000,
            link: "https://www.coexaqua.com/",
          },
        },
        {
          time: "14:00",
          title: "Lunch at Jungsik Seoul",
          location: "11 Seolleung-ro 158-gil, Gangnam-gu, Seoul",
          reservation_required: true,
          details: {
            open_time: "11:30 - 22:00",
            cost: 100000,
            link: "https://www.jungsik.kr/",
          },
        },
        {
          time: "17:00",
          title: "Gangnam K-Star Road",
          location: "K-Star Road, Gangnam-gu, Seoul",
          reservation_required: false,
          details: {
            open_time: "24 hours",
            cost: null,
            link: "https://www.visitseoul.net",
          },
        },
        {
          time: "20:00",
          title: "Departure to Incheon International Airport",
          location: "Incheon International Airport, Incheon",
          reservation_required: false,
          details: {
            open_time: "24 hours",
            cost: null,
            link: "https://www.airport.kr/",
          },
        },
      ],
    },
  ],
};

// ✅ 로컬스토리지에서 기존 tripData 가져오기
let trips = JSON.parse(localStorage.getItem("tripData")) || [];

// ✅ 새로운 여행 일정 추가
trips.push(additionalTrip);
localStorage.setItem("tripData", JSON.stringify(trips));

console.log("✅ 새로운 여행 일정이 추가되었습니다!", additionalTrip);

document.addEventListener("DOMContentLoaded", function () {
  // ✅ 기존 tripData 변환 작업 (한 번만 실행되도록 설정)
  if (localStorage.getItem("tripData")) {
    const oldTrips = JSON.parse(localStorage.getItem("tripData"));

    // 기존 데이터가 배열이 아니면 배열로 변환
    const tripsArray = Array.isArray(oldTrips) ? oldTrips : [oldTrips];

    tripsArray.forEach((trip) => {
      const newKey = `event-${crypto.randomUUID()}`;
      localStorage.setItem(newKey, JSON.stringify(trip));
      console.log(`🔄 기존 tripData를 ${newKey} 로 변환 완료!`);
    });

    // ✅ 기존 tripData 삭제 (중복 저장 방지)
    localStorage.removeItem("tripData");
    console.log("🗑 기존 tripData 삭제 완료!");
  }
});
