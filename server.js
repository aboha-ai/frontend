require('dotenv').config();
const port = process.env.PORT || 3000; // PORT 환경 변수가 있으면 사용, 없으면 3000
const baseUrl = process.env.BASE_URL;
const fetch = require("node-fetch");
const axios = require("axios");
const cheerio = require("cheerio"); // npm install axios cheerio
const { chromium } = require("@playwright/test"); //npm install @playwright/test
const cors = require("cors");

const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
if (!gemini) {
  console.error("Gemini API 키가 설정되지 않았습니다.");
  process.exit(1); // 또는 다른 오류 처리 방식
}
  
  
app.use(express.json());

  

app.post("/generate-text", async (req, res) => { // 새로운 API 엔드포인트
  async function run(prompt) {
    // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
    const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash-lite-preview-02-05"});
  
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text; // text 반환

  }
  try {
    const text = await run(`
      너는 20년 경력의 블로거야. 
      ${req.body.title} 그리고 ${req.body.location}의 메시지를 바탕으로, 여행 일기를 작성해줘. 그리고 글을 캐쥬얼하게 작성해줘 ** 같은 마크다운 문자는 지우고 줄바꿈을 해줘
      해당 메시지는 너가 직접 다녀온 내용이고${req.body.location.city} ${req.body.location.adress} ${req.body.location.arrival_time}에는 너가 다녀온 여행 일자, 여행 장소 등이 포함되어있어.
      200자 이내로 작성하고,
      작성한 글에는 제목, 날짜, 장소를 포함해서 작성하지만 절대 없는 내용을 넣지마. 결과는 반드시 한글로 작성해줘.
      
      `); // 요청 본문에서 프롬프트 가져오기
      console.log(req.body);
      console.log(text);  

    res.json({ text });
} catch (error) {
    console.error("텍스트 생성 오류:", error);
    res.status(500).json({ error: "텍스트 생성 실패" });
}


});
              
// 정적 파일 서빙 (css, js, 이미지 등)
app.use(express.static(path.join(__dirname, 'public')));

// 메인 페이지 라우터
app.get('/my-list', async (req, res) => {
  const navberPath = path.join(__dirname, 'docs/page/navber.html');
  const footerPath = path.join(__dirname, 'docs/page/footer.html');
  const mainContentPath = path.join(__dirname, 'docs/page/my-list.html');
  const modalContentPath = path.join(__dirname, 'docs/page/modal.html');

  try {
      const [navber, footer, content, modalContent] = await Promise.all([
          fs.promises.readFile(navberPath, 'utf-8'),
          fs.promises.readFile(footerPath, 'utf-8'),
          fs.promises.readFile(mainContentPath, 'utf-8'),
          fs.promises.readFile(modalContentPath, 'utf-8')
      ]);

      const fullPage = `
          <!DOCTYPE html>
          <html lang="ko">
          <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <title>나의 여행 기록 | 아보하 여행</title>
              <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&amp;display=swap" rel="stylesheet"/>
              <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet"/>
              <link href="https://ai-public.creatie.ai/gen_page/tailwind-custom.css" rel="stylesheet"/>
              <script src="https://cdn.tailwindcss.com/3.4.5?plugins=forms@0.5.7,typography@0.5.13,aspect-ratio@0.4.2,container-queries@0.1.1"></script>
              <script src="https://ai-public.creatie.ai/gen_page/tailwind-config.min.js" data-color="#000000" data-border-radius="small"></script>
          </head>
          <body class="min-h-screen flex flex-col bg-gray-50 font-sans">
              ${navber}
              <main class="flex-grow">
                  <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      ${content}
                  </div>
              </main>
              ${footer}
              ${modalContent}
              <script>
                // 서버에서 전달한 BASE_URL
                const BASE_URL = "${baseUrl}";  // 환경 변수를 삽입
              </script>
              <script src="../js/record.js"></script>
              <script src="../js/modal.js"></script>
          </body>
          </html>
      `;

      res.send(fullPage);
  } catch (err) {
      console.error("파일 읽기 오류:", err);
      res.status(500).send("파일을 읽는 중 오류가 발생했습니다.");
  }
}); 


app.get("/home", async (req, res) => {
    try {
        const homePath = path.join(__dirname, "docs/page/home.html");

        // home.html 파일을 비동기적으로 읽기
        let homeContent = await fs.promises.readFile(homePath, "utf-8");

        // 환경 변수 값 삽입 (BASE_URL)
        homeContent = homeContent.replace("{{BASE_URL}}", process.env.BASE_URL);

        res.send(homeContent);
    } catch (err) {
        console.error("파일 읽기 오류:", err);
        res.status(500).send("파일을 읽는 중 오류가 발생했습니다.");
    }
});


// ✅ `{BASE_URL}/ai-list/detail`로 페이지 연결
app.get("/ai-list/detail", (req, res) => {
  res.sendFile(path.join(__dirname, "doc", "page", "itinerary.html")); // 기존 페이지 유지
});

/* =============================
   API 엔드포인트
============================= */

// 1. Google 번역 API 프록시 엔드포인트 (GoogleTranslateAPI)
app.post("/api/google-translate", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "No text provided" });
    const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GoogleTranslateAPI}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        target: "en",
        format: "text",
      }),
    });
    const result = await response.json();
    res.json(result.data.translations[0]); // 번역 결과 반환
  } catch (error) {
    console.error("Google Translate API error:", error);
    res.status(500).json({ error: "Google Translate API call failed" });
  }
});

// 2. Weather API 프록시 엔드포인트
app.get("/api/weather", async (req, res) => {
  try {
    const { location } = req.query;
    if (!location)
      return res.status(400).json({ error: "No location provided" });
    const today = new Date();
    const startDate = today.toISOString().split("T")[0];
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 2);
    const endDateStr = endDate.toISOString().split("T")[0];
    const weatherUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
      location
    )}/${startDate}/${endDateStr}?unitGroup=metric&lang=ko&key=${
      process.env.weatherAPI
    }&contentType=json`;
    const response = await fetch(weatherUrl);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Weather API error:", error);
    res.status(500).json({ error: "Weather API call failed" });
  }
});

// 3. Image API 프록시 엔드포인트 (Unsplash)
app.get("/api/image", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: "No query provided" });
    const imageUrl = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
      query
    )}&orientation=landscape&client_id=${process.env.imageAccessAPI}`;
    const response = await fetch(imageUrl);
    const data = await response.json();
    if (data && data.urls && data.urls.regular) {
      res.json({ imageUrl: data.urls.regular });
    } else {
      res.status(500).json({ error: "Failed to get image" });
    }
  } catch (error) {
    console.error("Image API error:", error);
    res.status(500).json({ error: "Image API call failed" });
  }
});

/* =============================
   404 처리
============================= */
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

/* =============================
   서버 시작
============================= */
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)});
const API = process.env.GEMINI_API_KEY
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API}`;
const GEO_API_KEY = process.env.GEO_API_KEY;
const GEO_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";

async function fetchTouristData(country, city) {
  try {
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `현지인이 자주 가고 풍경 위주의 평화로운 여행을 원하는 사람이 갈만한 "counter" 의 "city" 에 있는 "hotel", "restaurants", "touristSpots"를 JSON 형식으로 각각 5개씩 총 15개를 반환해 주세요, 각 "name"은 호텔1,2,3,4,5가 아닌 실제 장소의 이름을 반드시 넣어주세요.:
                                        {
                                            "hotels": [
                                                {
                                                    "name": "이름",
                                                    "link": "웹사이트 URL",
                                                    "cost": "1박 가격",
                                                    "address": "상세 주소",
                                                    "country": "국가",
                                                    "city": "도시",
                                                    "description": "설명",
                                                    "hours": "체크인/체크아웃 시간",
                                                    "photoUrl": "이미지 URL"
                                                }
                                            ],
                                            "restaurants": [
                                                {
                                                    "name": "이름",
                                                    "link": "웹사이트 URL",
                                                    "cost": "평균 가격",
                                                    "address": "상세 주소",
                                                    "country": "국가",
                                                    "city": "도시",
                                                    "description": "설명",
                                                    "hours": "운영 시간",
                                                    "photoUrl": "이미지 URL"
                                                }
                                            ],
                                            "touristSpots": [
                                                {
                                                    "name": "이름",
                                                    "link": "웹사이트 URL",
                                                    "cost": "입장료",
                                                    "address": "상세 주소",
                                                    "country": "국가",
                                                    "city": "도시",
                                                    "description": "설명",
                                                    "hours": "운영 시간",
                                                    "photoUrl": "이미지 URL"
                                                }
                                            ]
                                        }`,
            },
          ],
        },
      ],
      generationConfig: { response_mime_type: "application/json" },
    };

    // Gemini API로 전달되는 요청 본문 로그
    console.log("Gemini API 요청 본문:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API 오류: ${response.status} - ${errorText}`);
      return null;
    }

    const jsonResponse = await response.json();

    // Gemini API 응답 로그
    console.log("Gemini API 응답:", JSON.stringify(jsonResponse, null, 2));

    // 응답 데이터 파싱 및 필요한 필드 확인
    const touristData = jsonResponse.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(touristData);

    if (!parsedData.hotels) {
      parsedData.hotels = [];
    }
    if (!parsedData.restaurants) {
      parsedData.restaurants = [];
    }
    if (!parsedData.touristSpots) {
      parsedData.touristSpots = [];
    }

    return parsedData;
  } catch (error) {
    console.error("Gemini API 요청 실패:", error);
    return null;
  }
}

app.post("/api/tourist-data", async (req, res) => {
  const { country, city } = req.body;
  try {
    const touristData = await fetchTouristData(country, city);
    if (!touristData) {
      console.error("Tourist data fetch failed");
      return res.status(500).json({ error: "Gemini API 오류" });
    }
    res.json(touristData);
  } catch (error) {
    console.error("API 요청 처리 오류:", error);
    res.status(500).json({ error: "API 요청 처리 실패" });
  }
});

app.get("/api/maps-key", (req, res) => {
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY; // 환경 변수에서 API 키를 가져옴

  if (!GOOGLE_MAPS_API_KEY) {
    console.error("GOOGLE_MAPS_API_KEY is not defined in server environment");
    return res.status(500).json({ error: "Google Maps API key is missing" });
  }

  res.json({ key: GOOGLE_MAPS_API_KEY });
});

app.get("/api/geocode", async (req, res) => {
  const { name, address, country } = req.query;
  const location = await fetchGeolocationFromDetails(address); // address 파라미터 사용
  if (location) {
    res.json({ location });
  } else {
    res.status(500).json({ error: "Geocoding failed" });
  }
});

app.get("/ai-list", async (req, res) => {
  const aiListPath = path.join(__dirname, "docs/page/ai-list.html");
  try {
    const aiListContent = await fs.promises.readFile(aiListPath, "utf-8");
    res.send(aiListContent);
  } catch (err) {
    console.error("파일 읽기 오류:", err);
    res.status(500).send("파일을 읽는 중 오류가 발생했습니다. " + err.message);
  }
});



app.use(cors()); // 미들웨어
// 모두에게 오픈.


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
