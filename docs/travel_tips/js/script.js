document.getElementById("sendBtn").addEventListener("click", function () {
  let userInput = document.getElementById("userInput").value.trim();
  if (!userInput) return; // 빈 입력 방지

  let chatList = document.getElementById("chatList");

  // 사용자 질문 추가 (연한 파란색)
  let userQuestion = document.createElement("div");
  userQuestion.classList.add("chat-bubble", "user-message");
  userQuestion.textContent = userInput;
  chatList.appendChild(userQuestion);

  // 챗봇 응답 추가 (연한 초록색)
  let botResponse = document.createElement("div");
  botResponse.classList.add("chat-bubble", "bot-message");
  botResponse.textContent = "질문을 분석 중입니다..."; // 기본 응답
  chatList.appendChild(botResponse);

  // "저장됨" 버튼 추가
  let saveButton = document.createElement("button");
  saveButton.classList.add("save-btn");
  saveButton.textContent = "✔ 저장됨";
  botResponse.appendChild(saveButton);

  // LocalStorage 저장 (질문 & 답변)
  let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
  chatHistory.push({ question: userInput, answer: "질문을 분석 중입니다..." });
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));

  // 입력창 초기화
  document.getElementById("userInput").value = "";
});

// 페이지 로드 시 저장된 질문 & 응답 불러오기
window.addEventListener("load", function () {
  let chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
  let chatList = document.getElementById("chatList");

  chatHistory.forEach((chat) => {
    let userQuestion = document.createElement("div");
    userQuestion.classList.add("chat-bubble", "user-message");
    userQuestion.textContent = chat.question;
    chatList.appendChild(userQuestion);

    let botResponse = document.createElement("div");
    botResponse.classList.add("chat-bubble", "bot-message");
    botResponse.textContent = chat.answer;
    chatList.appendChild(botResponse);

    let saveButton = document.createElement("button");
    saveButton.classList.add("save-btn");
    saveButton.textContent = "✔ 저장됨";
    botResponse.appendChild(saveButton);
  });
});
