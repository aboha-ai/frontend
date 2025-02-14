require("dotenv").config(); // ✅ .env 파일 로드
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY; // ✅ 환경 변수에서 API 키 가져오기
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite-preview-02-05",
  "gemini-1.5-flash",
];

// ✅ 프론트엔드에서 /api/chat로 요청하면, 백엔드가 Google API에 대신 요청
app.post("/api/chat", async (req, res) => {
  let currentModelIndex = 0;
  let responseData;

  while (currentModelIndex < GEMINI_MODELS.length) {
    const model = GEMINI_MODELS[currentModelIndex];
    console.log(`🚀 현재 사용 모델: ${model}`);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
        { contents: [{ parts: [{ text: req.body.prompt }] }] },
        { headers: { "Content-Type": "application/json" } }
      );

      responseData =
        response.data.candidates[0]?.content?.parts[0]?.text || "응답 없음";
      break;
    } catch (error) {
      console.error(
        `❌ ${model} API 오류:`,
        error.response?.data || error.message
      );
      if (error.response?.status === 429 || error.response?.status === 400) {
        console.warn(`⚠️ ${model} 사용량 초과! 다음 모델로 변경.`);
        currentModelIndex++;
      } else {
        responseData = "챗봇 서버 오류 발생!";
        break;
      }
    }
  }

  res.json({ response: responseData });
});

// ✅ 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
