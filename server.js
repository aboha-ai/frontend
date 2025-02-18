require('dotenv').config();
const port = process.env.PORT || 3000; // PORT 환경 변수가 있으면 사용, 없으면 3000
const BASE_URL = process.env.BASE_URL; // 기본값 설정
const baseUrl = process.env.BASE_URL;

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


app.get("/home", (req, res) => {
    const homePath = path.join(__dirname, "docs/page/home.html");
  
    // fs.promises.readFile을 사용하여 비동기적으로 파일 읽기
    fs.promises.readFile(homePath, 'utf-8')
      .then((homeContent) => {
        res.send(homeContent);
      })
      .catch((err) => {
        console.error("파일 읽기 오류:", err);
        res.status(500).send("파일을 읽는 중 오류가 발생했습니다.");
      });
  
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
  console.log(`Server is running on port ${port}`);
});
