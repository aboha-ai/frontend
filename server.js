require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");
const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const BASE_URL = process.env.BASE_URL || "https://yellow-atom-tea.glitch.me"; // .env에서 BASE_URL을 불러옴, 없으면 기본값 사용
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GEMINI_API_URL = `${BASE_URL}/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`; // BASE_URL 사용
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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
