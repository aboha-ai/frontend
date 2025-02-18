require("dotenv").config();
const express = require("express");
const path = require("path");
const fetch = require("node-fetch"); // npm install node-fetch 필요
const app = express();

// 포트는 Glitch 환경변수 PORT 또는 3000 사용
const PORT = process.env.PORT;
const BASE_URL = process.env.BASE_URL; // 기본값 설정

// JSON 바디 파서 설정
app.use(express.json());

// 정적 파일 서빙 (public 폴더)
app.use(express.static(path.join(__dirname, "public")));

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
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
