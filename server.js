require("dotenv").config(); // .env 파일 로드
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;
const corsOptions = {
  origin: "*", // 특정 도메인으로 변경 가능
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // Preflight 요청 허용
app.use(express.json());

// Express 정적 파일 서빙 설정 (server.js)
app.use(express.static(path.join(__dirname, "public")));

app.get("/ai-tips", (req, res) => {
  res.sendFile(path.join(__dirname, "docs", "pages", "index.html"));
});

// ✅ 페이지 요청 시 해당 HTML 파일 제공
//예시.새로운 여행 일정 만들기 버튼 누르면 그 링크로 이동.
app.get("/ai-list", (req, res) => {
  res.sendFile(path.join(__dirname, "docs", "pages", "index.html"));
});

app.get("/my-list/vlog", (req, res) => {
  res.sendFile(path.join(__dirname, "docs", "pages", "index.html"));
});

app.get("/my-list", (req, res) => {
  res.sendFile(path.join(__dirname, "docs", "pages", "index.html"));
});

// ✅ 환경 변수에서 API Key 및 모델 리스트 가져오기
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite-preview-02-05",
  "gemini-1.5-flash",
];

let currentModelIndex = 0; // 현재 사용 모델

/**
 * ✅ 자동 모델 전환 함수 (사용량 초과 시 다음 모델 사용)
 */
async function getGeminiResponse(promptText) {
  while (currentModelIndex < GEMINI_MODELS.length) {
    const model = GEMINI_MODELS[currentModelIndex];
    console.log(`🚀 현재 사용 모델: ${model}`);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: promptText }] }] },
        { headers: { "Content-Type": "application/json" } }
      );

      return (
        response.data.candidates[0]?.content?.parts[0]?.text ||
        "응답을 받을 수 없습니다."
      );
    } catch (error) {
      console.error(
        `❌ ${model} API 오류:`,
        error.response?.data || error.message
      );

      if (error.response?.status === 429 || error.response?.status === 400) {
        console.warn(`⚠️ ${model} 사용량 초과! 다음 모델로 변경합니다.`);
        currentModelIndex++;
      } else {
        return "서버 오류 발생!";
      }
    }
  }

  return "현재 챗봇 서버가 과부하 상태입니다. 나중에 다시 시도해 주세요.";
}

// ✅ 챗봇 API 엔드포인트
app.post("/api/chat", async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "질문이 필요합니다." });

  console.log(`💬 챗봇 질문: ${question}`);
  const responseText = await getGeminiResponse(question);
  res.json({ response: responseText });
});

// ✅ 여행 팁 API 엔드포인트
app.post("/api/tips", async (req, res) => {
  const { placeName } = req.body;
  if (!placeName)
    return res.status(400).json({ error: "장소 이름이 필요합니다." });

  console.log(`📍 여행 팁 요청: ${placeName}`);
  const prompt = `${placeName}을(를) 방문할 때 주요 팁 5개, 회화 표현, 자주 묻는 질문을 각각 명확히 구분해서 제공해줘. 
  주요 팁은 "### 주요 팁" 아래, 회화 표현은 "### 회화 표현" 아래, 자주 묻는 질문은 "### 자주 묻는 질문" 아래 배치해줘.`;

  const responseText = await getGeminiResponse(prompt);
  res.json({ response: responseText });
});

// ✅ 서버 실행
app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
});
console.log("✅ 환경 변수 확인 - GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
