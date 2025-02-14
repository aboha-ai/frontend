let selectedFiles = [];
let level = 0;

document.addEventListener('DOMContentLoaded', function () {
    // 팝업 관리 함수
    const openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            if (modalId !== 'ai-image-popup') {
                document.getElementById('popup-overlay').classList.remove('pointer-events-none');
            }
        } else {
            console.error(`${modalId} 모달을 찾을 수 없습니다.`);
        }
    };

    const closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.getElementById('popup-overlay').classList.add('pointer-events-none');
        } else {
            console.error(`${modalId} 모달을 찾을 수 없습니다.`);
        }
    };

    // 팝업 열기 버튼 이벤트
    const openPopupModalBtn = document.getElementById('open-modal-btn');
    if (openPopupModalBtn) {
        openPopupModalBtn.addEventListener('click', () => {
            openModal('popup-overlay');
            openModal('popup-modal');
        });
    } else {
        console.error('open-modal-btn 버튼을 찾을 수 없습니다.');
    }

    // 파일 업로드 관련 로직
    document.addEventListener('change', function (event) {
        const files = event.target.files;
        for (const file of files) {
            selectedFiles.push(file); // 파일을 배열에 추가
        }
        console.log("Files added:", selectedFiles); // 추가된 파일 목록 확인
        renderFileList(selectedFiles); // 파일 목록 업데이트
    });

    // 이벤트 위임
    document.body.addEventListener('click', function (event) {
        const target = event.target;

        // 팝업 닫기 버튼
        if (target.id === 'close-ai-popup' || target.closest('#close-ai-popup')) {
          selectedFiles = []; // selectedFiles 배열 초기화
          renderFileList(selectedFiles); // 파일 목록 다시 렌더링
            closeModal('ai-image-popup');
            closeModal('ai-image-modal');
            closeModal('popup-overlay');
        }

        if (target.id === 'close-popup' || target.closest('#close-popup')) {
            closeModal('popup-overlay');
            closeModal('popup-modal');
            closeModal('write-form');
        }

        if (target.id === 'popup-overlay') {
            closeModal('popup-overlay');
            closeModal('popup-modal');
            closeModal('write-form');
        }

        // 팝업 열기 버튼
        if (target.id === 'ai-assistant') {
            closeModal('popup-overlay');
            closeModal('popup-modal');
            level = 0;
            openModal('ai-image-popup');
            openModal('ai-image-modal');
        }

        if (target.id === 'manual-button') {
            closeModal('popup-overlay');
            closeModal('popup-modal');
            level = 1;
            openModal('ai-image-popup');
            openModal('ai-image-modal');
            // openModal('popup-overlay');
            // openModal('write-form');
        }

        if(target.id === 'next-btn') {
          if(level) {
            closeModal('ai-image-popup');
            closeModal('ai-image-modal');
            openModal('popup-overlay');
            openModal('write-form');
          }
          else {
            closeModal('ai-image-popup');
            closeModal('ai-image-modal');
            
          }
        }


        if (target.id === 'close-user-popup') {
            closeModal('write-form');
            closeModal('popup-overlay');
            
        }

        // 파일 업로드 관련 로직
        if (target.id === 'choose-image-btn' || target.closest('#choose-image-btn')) {
            document.getElementById('image-upload').click(); // 파일 선택 창 열기
        }

        if (target.classList.contains('file-delete-btn') || target.closest('.file-delete-btn')) {
            const fileName = target.dataset.fileName || target.closest('.file-delete-btn').dataset.fileName;
            selectedFiles = selectedFiles.filter(file => file.name !== fileName); // 파일 삭제
            console.log("Deleted file:", fileName); // 삭제된 파일 이름 확인
            console.log("Remaining files:", selectedFiles); // 남은 파일 목록 확인
            renderFileList(selectedFiles); // 파일 목록 다시 렌더링
        }

        if (target.id === 'next-btn') {
            console.log("Next button clicked. selectedFiles:", selectedFiles);
            // 다음 단계 처리 로직 (예: 서버에 업로드, 다른 팝업 열기 등)
            if(level) {
              closeModal('')
            }
        }
    });

    function renderFileList(files) {
        const fileList = document.getElementById('file-list').querySelector('.space-y-2');
        const fileInfoText = document.getElementById('file-info-text');
        const nextBtn = document.getElementById('next-btn');

        fileList.innerHTML = ''; // 기존 목록 초기화

        if (files.length > 0) {
            fileInfoText.textContent = `총 ${files.length}개 파일`;
            nextBtn.disabled = false;
        } else {
            fileInfoText.textContent = '파일 정보';
            nextBtn.disabled = true;
        }

        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = "file-item flex items-center justify-between p-2 hover:bg-gray-100 rounded";
            fileItem.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-file-image text-gray-400 mr-2"></i>
                    <span class="text-sm text-gray-600">${file.name}</span>
                </div>
                <span class="text-sm text-gray-500">${(file.size / (1024 * 1024)).toFixed(2)}MB</span>
                <button class="file-delete-btn" data-file-name="${file.name}">
                    <i class="fas fa-times text-gray-400 hover:text-gray-600"></i>
                </button>
            `;
            fileList.appendChild(fileItem); // 새로운 파일 목록 추가
        });
    }
});