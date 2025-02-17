// ✅ API 요청을 보낼 URL 설정
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api/chat" // ✅ 로컬 개발 환경
    : "https://your-glitch-project.glitch.me/api/chat"; // ✅ 배포 환경

// ✅ HTML 요소 가져오기
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatList = document.getElementById("chatList");
const refreshBtn = document.getElementById("refreshBtn");

// ✅ Markdown을 HTML로 변환하는 함수
function markdownToHTML(markdownText) {
  let htmlText = markdownText
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // 굵게 처리
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // 기울임 처리
    .replace(/(?:\r\n|\r|\n)/g, "<br>") // 줄바꿈 처리
    .replace(/- (.*?)/g, "<li>$1</li>"); // 리스트 변환

  if (htmlText.includes("<li>")) {
    htmlText = "<ul>" + htmlText + "</ul>"; // 리스트로 감싸기
  }

  return htmlText;
}

async function getChatbotResponse(question) {
  try {
    const response = await axios.post(API_URL, { question });

    if (!response.data.response) {
      throw new Error("서버에서 응답이 없습니다.");
    }

    return response.data.response; // ✅ 올바른 응답 반환
  } catch (error) {
    console.error(`❌ 서버 오류:`, error.response?.data || error.message);
    return "챗봇 서버 오류 발생!";
  }
}

// ✅ 버튼 클릭 이벤트 (사용자가 질문 입력)
sendBtn.addEventListener("click", async function () {
  let userText = userInput.value.trim();
  if (!userText) return;

  // 새로운 채팅 묶음 (질문 + 답변)
  let chatItem = document.createElement("div");
  chatItem.classList.add("chat-item");

  // 사용자 질문 추가
  let userMessage = document.createElement("div");
  userMessage.classList.add("chat-bubble", "user-message");
  userMessage.textContent = userText;
  chatItem.appendChild(userMessage);

  // 챗봇 응답 추가 (로딩 메시지)
  let botMessage = document.createElement("div");
  botMessage.classList.add("chat-bubble", "bot-message");
  botMessage.innerHTML = "질문을 분석 중입니다...";
  chatItem.appendChild(botMessage);

  // 채팅 기록에 추가
  chatList.appendChild(chatItem);

  // 서버로 질문을 보내고 응답 받기
  let botResponse = await getChatbotResponse(userText);
  botMessage.innerHTML = markdownToHTML(botResponse);

  // LocalStorage 저장 (질문 & 답변)
  let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
  chatHistory.push({ question: userText, answer: botResponse });
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

  // 입력창 초기화
  userInput.value = "";

  // ✅ 스크롤을 맨 아래로 이동
  chatList.scrollTop = chatList.scrollHeight;
});

// ✅ 페이지 로드 시 저장된 질문 & 응답 불러오기
window.addEventListener("load", function () {
  let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

  chatHistory.forEach((chat) => {
    let chatItem = document.createElement("div");
    chatItem.classList.add("chat-item");

    let userMessage = document.createElement("div");
    userMessage.classList.add("chat-bubble", "user-message");
    userMessage.textContent = chat.question;
    chatItem.appendChild(userMessage);

    let botMessage = document.createElement("div");
    botMessage.classList.add("chat-bubble", "bot-message");
    botMessage.innerHTML = markdownToHTML(chat.answer);
    chatItem.appendChild(botMessage);

    chatList.appendChild(chatItem);
  });

  // ✅ 스크롤을 맨 아래로 이동
  chatList.scrollTop = chatList.scrollHeight;
});

// ✅ 질문 새로고침 버튼 기능 (로컬스토리지 삭제 + 화면 초기화)
refreshBtn.addEventListener("click", function () {
  localStorage.removeItem("chatHistory");
  chatList.innerHTML = "";

  // 버튼 클릭 애니메이션
  refreshBtn.innerHTML =
    '<img src="assets/chatbot_reset.svg" alt="새로 고침 아이콘" />';
  setTimeout(() => {
    refreshBtn.innerHTML =
      '<img src="assets/chatbot_reset.svg" alt="새로 고침 아이콘" />';
  }, 1500);
});
