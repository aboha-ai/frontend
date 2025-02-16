require('dotenv').config();
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
  const headerPath = path.join(__dirname, 'docs/page/navber.html');
  const footerPath = path.join(__dirname, 'docs/page/footer.html');
  const mainContentPath = path.join(__dirname, 'docs/page/index.html');
  const modalContentPath = path.join(__dirname, 'docs/page/modal.html');

  try {
      const [header, footer, content, modalContent] = await Promise.all([
          fs.promises.readFile(headerPath, 'utf-8'),
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
              ${header}
              <main class="flex-grow">
                  <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                      ${content}
                  </div>
              </main>
              ${footer}
              ${modalContent}
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

// 서버 시작
app.listen(3000, () => {
  console.log('서버가 http://localhost:3000 에서 실행되고 있습니다.');
});
