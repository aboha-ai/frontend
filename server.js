require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000; // PORT 환경 변수가 있으면 사용, 없으면 3000

// 정적(static) 파일 제공 (HTML, CSS, JS, 이미지 등)
// 'frontend' 폴더 아래의 'public' 폴더와 'docs'폴더, 'js'폴더를 정적 파일 경로로 설정.
app.use(express.static(path.join(__dirname, "frontend", "public")));
app.use(express.static(path.join(__dirname, "frontend", "docs")));
app.use(express.static(path.join(__dirname, "frontend", "js"))); // js 폴더도 추가

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "docs", "home.html"));
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
