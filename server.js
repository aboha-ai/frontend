require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio"); // npm install axios cheerio
const { chromium } = require("@playwright/test"); //npm install @playwright/test
const cors = require("cors");

const app = express();
const PORT = process.env.PORT;

app.use(cors()); // 미들웨어
// 모두에게 오픈.

app.use(express.json()); // JSON으로 들어오는 body를 인식

// gemini 비행기티켓

const apiKey = process.env.RESERVATION_GEMINI_API_KEY;
const model = "gemini-2.0-flash";

async function generateContent(apiKey, departure, arrival, date, passengers) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const userPrompt = `I need flight ticket information based on the following details:

- ✈️ **Departure Airport:** ${departure}
- 🛬 **Arrival Airport:** ${arrival}
- 📅 **Travel Date:** ${date}
- 👥 **Number of Passengers:** ${passengers}

Please retrieve **real-time flight information** from any available flight sources.  
If no valid flights are found, return an empty array: \"flights": []\".

Fetch the available flights and provide the following details:

1️⃣ **Airline Name** (e.g., Emirates, Delta, Korean Air)
2️⃣ **Flight Number** (e.g., EK323, DL450)
3️⃣ **Ticket Price** (in KRW)
4️⃣ **Airline Logo Image URL** (From **Airhex**: https://content.airhex.com/content/logos/airlines_ICAO_350_100_r.png)
5️⃣ **Flight Duration** (e.g., 12h 30m)
6️⃣ **Departure & Arrival Times** (e.g., Departs at 08:30 AM, Arrives at 02:45 PM)
7️⃣ **Flight Type** (Direct / 1 Stop / 2 Stops)
8️⃣ **Baggage Allowance** (e.g., 23kg checked, 10kg carry-on)
9️⃣ **Seat Class** (Economy / Business / First Class)
🔟 **Purchase Link** (This must be the official booking page of the airline)

If no real flights are found, return:
\\\json
{
  "flights": []
}
\\\

Format the response **strictly in JSON format** like this:
\\\json
{
  "flights": [
    {
      "airline": "Korean Air",
      "flightNumber": "KE1001",
      "price": 85,
      "logo": "https://content.airhex.com/content/logos/airlines_KAL_350_100_r.png",
      "duration": "1h 0m",
      "departureTime": "07:00 AM",
      "arrivalTime": "08:00 AM",
      "stops": "Direct",
      "baggage": "23kg checked, 10kg carry-on",
      "class": "Economy",
      "purchaseLink": "https://www.koreanair.com/"
    },
    {
      "airline": "Jin Air",
      "flightNumber": "LJ301",
      "price": 70,
      "logo": "https://content.airhex.com/content/logos/airlines_JNA_350_100_r.png",
      "duration": "1h 5m",
      "departureTime": "08:30 AM",
      "arrivalTime": "09:35 AM",
      "stops": "Direct",
      "baggage": "15kg checked, 10kg carry-on",
      "class": "Economy",
      "purchaseLink": "https://www.jinair.com/"
    }
  ]
}
\\\

Ensure the response contains **only JSON** with no additional text.`;

  const data = {
    contents: [
      {
        parts: [{ text: userPrompt }],
      },
    ],
  };

  try {
    console.log("Gemini 요쳥 보냄");
    const response = await axios.post(url, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data; // Gemini 응답 반환
  } catch (error) {
    console.error("Error generating content:", error);
    throw error; // 에러를 다시 던져서 호출하는 쪽에서 처리하도록 함
  }
}

// 항공권 검색 API
app.get("/flights", async (req, res) => {
  const { departure, arrival, date, passengers } = req.query;

  console.log("요청이 들어왔습니다!");

  // 클라이언트에서 올바른 요청을 보냈는지 확인
  if (!departure || !arrival || !date || !passengers) {
    return res
      .status(400)
      .json({ error: "모든 쿼리 파라미터를 입력해야 합니다." });
  }
  try {
    // Gemini API 호출
    const responseData = await generateContent(
      apiKey,
      departure,
      arrival,
      date,
      passengers
    );

    console.log("Gemini Response:", JSON.stringify(responseData, null, 2)); // 예쁘게 출력

    // 응답에서 flights 데이터만 추출
    let flights = [];

    if (
      responseData.candidates &&
      responseData.candidates[0] &&
      responseData.candidates[0].content &&
      responseData.candidates[0].content.parts &&
      responseData.candidates[0].content.parts[0] &&
      responseData.candidates[0].content.parts[0].text
    ) {
      // JSON 형식의 텍스트를 파싱
      const parsedData = JSON.parse(
        responseData.candidates[0].content.parts[0].text
          .replace("```json\n", "")
          .replace("\n```", "")
      );
      flights = parsedData.flights || [];
    } else {
      console.log("Unexpected response format:", responseData);
      return res
        .status(500)
        .json({ error: "Invalid response format from Gemini API" });
    }

    // flights 배열만 반환
    res.json(flights);
  } catch (error) {
    console.error("❌ Gemini API 요청 중 오류 발생:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${parseInt(month)}월 ${parseInt(day)}일`;
}

// gemini 숙소 api
async function generateStays(apiKey, location, checkIn, checkOut, guests) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const userPrompt = `
I need hotel stay information based on the following details:

🏨 **Location:** ${location}  
📅 **Check-in Date:** ${checkIn}  
📅 **Check-out Date:** ${checkOut}  
👥 **Number of Guests:** ${guests}  

Please retrieve **real-time hotel stay information** from available accommodation sources.  
If no valid hotels are found, return an empty array: "stays": [].

For each hotel, provide the following details:

1️⃣ **Hotel Name**  
2️⃣ **Location** (e.g., Seoul, Yongsan-gu)  
3️⃣ **Rating** (e.g., 4.8)  
4️⃣ **Total Reviews** (e.g., 2,394)  
5️⃣ **Price Per Night** (in KRW, formatted properly)  
6️⃣ **Booking Link** (Format: https://www.booking.com/searchresults.html?ss={hotel_name}, replacing spaces with "+")  

If no real hotels are found, return:
\`\`\`json
{
  "stays": []
}
\`\`\`

Format the response **strictly in JSON format** like this:
\`\`\`json
{
  "stays": [
    {
      "name": "Grand Hyatt Seoul",
      "location": "Seoul, Yongsan-gu",
      "rating": 4.8,
      "reviews": 2394,
      "price": "₩350,000",
      "bookingLink": "https://www.booking.com/searchresults.html?ss=Grand+Hyatt+Seoul"
    },
    {
      "name": "Signiel Seoul",
      "location": "Seoul, Songpa-gu",
      "rating": 4.9,
      "reviews": 1856,
      "price": "₩450,000",
      "bookingLink": "https://www.booking.com/searchresults.html?ss=Signiel+Seoul"
    }
  ]
}
\`\`\`

Ensure the response contains **only JSON** with no additional text.
`;

  const data = { contents: [{ parts: [{ text: userPrompt }] }] };

  try {
    console.log("Gemini 요청을 보냅니다...");
    const response = await axios.post(url, data, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("🟢 Gemini 응답 받음:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("❌ Gemini API 요청 중 오류 발생:", error);
    throw error;
  }
}

// ✅ 숙소 검색 API
app.get("/stays", async (req, res) => {
  try {
    const { location, checkIn, checkOut, guests } = req.query;

    console.log("🔍 숙소 검색 요청:", { location, checkIn, checkOut, guests });

    // 요청이 유효한지 검사
    if (!location || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ error: "모든 필드를 입력해주세요." });
    }

    // Gemini AI API 호출
    const responseData = await generateStays(
      apiKey,
      location,
      checkIn,
      checkOut,
      guests
    );

    // 응답을 JSON 형식으로 변환
    let stays = [];
    if (
      responseData.candidates &&
      responseData.candidates[0] &&
      responseData.candidates[0].content &&
      responseData.candidates[0].content.parts &&
      responseData.candidates[0].content.parts[0] &&
      responseData.candidates[0].content.parts[0].text
    ) {
      const parsedData = JSON.parse(
        responseData.candidates[0].content.parts[0].text
          .replace("```json\n", "")
          .replace("\n```", "")
      );
      stays = parsedData.stays || [];
    } else {
      console.log("❌ 예상치 못한 응답 형식:", responseData);
      return res
        .status(500)
        .json({ error: "Invalid response format from Gemini API" });
    }

    // JSON 응답 반환
    res.json(stays.length > 0 ? stays : { message: "No stays found" });
  } catch (error) {
    console.error("❌ 숙소 검색 중 오류 발생:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`app listening on port ${PORT}`);
});
