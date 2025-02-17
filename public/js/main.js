// 푸터를 로드하는 함수
async function loadFooter() {
  const response = await fetch("/components/footer.html"); // footer.html을 가져옴
  const footerHTML = await response.text();
  document.getElementById("footer-container").innerHTML = footerHTML;
}

// 페이지가 로드될 때 푸터 삽입
document.addEventListener("DOMContentLoaded", function () {
  loadFooter();
});
