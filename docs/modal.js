document.addEventListener('DOMContentLoaded', function () {
  // 팝업 열기 함수
  const openModal = (modalId) => {
    console.log(`Opening modal: ${modalId}`); // 디버깅용 로그
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      if (modalId !== 'ai-image-popup') {
        // ai-image-popup을 제외한 팝업에서 overlay 클릭 방지
        document.getElementById('popup-overlay').classList.remove('pointer-events-none');
      }
    } else {
      console.error(`${modalId} 모달을 찾을 수 없습니다.`);
    }
  };

  // 팝업 닫기 함수
  const closeModal = (modalId) => {
    console.log(`Closing modal: ${modalId}`); // 디버깅용 로그
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      document.getElementById('popup-overlay').classList.add('pointer-events-none');
      console.log(`Modal ${modalId} closed successfully.`); // 디버깅용 로그
    } else {
      console.error(`${modalId} 모달을 찾을 수 없습니다.`);
    }
  };

  // 팝업을 여는 버튼 클릭 이벤트
  const openPopupModalBtn = document.getElementById('open-modal-btn');
  if (openPopupModalBtn) {
    openPopupModalBtn.addEventListener('click', () => {
      openModal('popup-overlay'); // 오버레이 열기
      openModal('popup-modal');   // 팝업 모달 열기
    });
  } else {
    console.error('open-modal-btn 버튼을 찾을 수 없습니다.');
  }

  // 이벤트 위임을 사용하여 버튼 클릭 처리
  document.body.addEventListener('click', function (event) {
    // 부모 요소를 탐색하여 id 확인
    const target = event.target.closest('[id]');
    if (!target) return;

    console.log('Clicked element ID:', target.id); // 디버깅용 로그

    // AI 이미지 팝업 닫기 버튼 클릭 시
    if (target.id === 'close-ai-popup') {
      console.log('AI 이미지 팝업 닫기 버튼 클릭됨');
      closeModal('ai-image-popup');
      closeModal('ai-image-modal');
      closeModal('popup-overlay');
    }

    // 모달 닫기 버튼 클릭 시
    if (target.id === 'close-popup') {
      console.log('모달 닫기 버튼 클릭됨');
      closeModal('popup-overlay');
      closeModal('popup-modal');
      closeModal('write-form');
    }

    // 배경 클릭 시 팝업 닫기
    if (target.id === 'popup-overlay') {
      console.log('배경 클릭됨');
      closeModal('popup-overlay');
      closeModal('popup-modal');
      closeModal('write-form');
    }

    // AI 도움으로 작성하기 버튼 클릭 시 AI 팝업 열기
    if (target.id === 'ai-assistant') {
      console.log('AI 도움으로 작성하기 버튼 클릭됨');
      closeModal('popup-overlay');
      closeModal('popup-modal');
      openModal('ai-image-popup');
      openModal('ai-image-modal');
    }

    // 직접 작성하기 버튼 클릭 시 팝업 열기
    if (target.id === 'manual-button') {
      console.log('직접 작성하기 버튼 클릭됨');
      closeModal('popup-overlay');
      closeModal('popup-modal');
      openModal('popup-overlay');
      openModal('write-form');
    }

    // 취소 버튼 클릭 시 'write-form' 닫기
    if (target.id === 'close-user-popup') {
      console.log('취소 버튼 클릭됨');
      closeModal('write-form');
      closeModal('popup-overlay');
    }
  });
});