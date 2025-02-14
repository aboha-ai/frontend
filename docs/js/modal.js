let selectedFiles = [];
let imageUrls = [];
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

        if (files && files.length > 0) {  // Check if files are selected
            for (const file of files) {
                selectedFiles.push(file);  // Add each file to selectedFiles
            }
            console.log("Files added:", selectedFiles); // Log added files
            renderFileList(selectedFiles); // 파일 목록 업데이트
        } else {
            console.error('No files selected or files object is invalid.');
        }

    });

    // 이벤트 위임
    document.body.addEventListener('click', function (event) {
        const target = event.target;

        // 팝업 닫기 버튼
        if (target.id === 'close-ai-popup' || target.closest('#close-ai-popup')) {
            selectedFiles = []; // selectedFiles 배열 초기화
            imageUrls = [];
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
    
        }

        if(target.id === 'next-btn') {
            console.log("Next button clicked. selectedFiles:", selectedFiles);
            convertFilesToBase64(selectedFiles);
            if(level) {
                closeModal('ai-image-popup');
                closeModal('ai-image-modal');
                openModal('popup-overlay');
                openModal('write-form');
            }
            else {
                closeModal('ai-image-popup');
                closeModal('ai-image-modal');
                openModal('schedule-popup');
            }
        }

        if (target.id === 'close-user-popup') {
            selectedFiles = []; // selectedFiles 배열 초기화
            imageUrls = [];
            renderFileList(selectedFiles); // 파일 목록 다시 렌더링
            closeModal('write-form');
            closeModal('popup-overlay');
            
        }

        // 파일 선택창 관련 로직
        if (target.id === 'choose-image-btn' || target.closest('#choose-image-btn')) {
            document.getElementById('image-upload').click(); // 파일 선택 창 열기
        }

        // 파일 삭제 관련 로직
        if (target.classList.contains('file-delete-btn') || target.closest('.file-delete-btn')) {
            const fileName = target.dataset.fileName || target.closest('.file-delete-btn').dataset.fileName;
            selectedFiles = selectedFiles.filter(file => file.name !== fileName); // 파일 삭제
            console.log("Deleted file:", fileName); // 삭제된 파일 이름 확인
            console.log("Remaining files:", selectedFiles); // 남은 파일 목록 확인
            renderFileList(selectedFiles); // 파일 목록 다시 렌더링
        }

        if (target.id === 'schedule-list-btn') {
            const scheduleListContainer = document.getElementById('schedule-list-container');
            selectedFiles = [];
            imageUrls = [];
            renderFileList(selectedFiles);
            if (scheduleListContainer) {
                    scheduleListContainer.classList.remove('hidden'); // 숨김 해제
                    displayEventSchedules(); // 일정 목록 렌더링
                } else {
                    console.error('schedule-list-container 요소를 찾을 수 없습니다.');
                }
            


        }
        
        
        if (target.id === 'user-record-submit') {
            const title = document.querySelector('input[placeholder="여행 제목을 입력하세요"]').value;
            const startDate = document.querySelector('input[type="date"]:first-of-type').value;
            const endDate = document.querySelector('input[type="date"]:last-of-type').value;
            const location = document.querySelector('input[placeholder="여행한 도시, 국가를 입력하세요"]').value;
            const content = document.querySelector('textarea').value;
            const id = crypto.randomUUID();
            if (selectedFiles.length > 0) {
                // 비동기적으로 base64로 변환한 후 로컬스토리지에 저장
                convertFilesToBase64(selectedFiles).then(() => {
                    // 로컬스토리지에 저장할 객체 생성
                    const travelRecord = {
                        title: title,
                        startDate: startDate,
                        endDate: endDate, 
                        location: location,
                        content: content,
                        images: imageUrls, // base64 인코딩된 이미지 URL들
                    };

                    // 로컬스토리지에 저장
                    localStorage.setItem("record-"+id, JSON.stringify(travelRecord));

                    console.log('Travel record saved to localStorage:', travelRecord);
                    // 폼 리셋
                    resetForm();
                    closeModal('write-form');
                    closeModal('popup-overlay');
                }).catch((error) => {
                    console.error('파일 변환 중 오류 발생:', error);
                });
            } else {
                console.error('선택된 파일이 없습니다.');
            }
        }

        // schedule-popup-btn 버튼 클릭 시
        if (target.id === 'schedule-popup-btn' || target.closest('#schedule-popup-btn')) {
            selectedFiles = [];
            imageUrls = [];
            renderFileList(selectedFiles);
            closeModal('popup-overlay');
            closeModal('schedule-popup');
        }
    });
    
    // 저장된 모든 여행 기록 불러오기 (UUID 확인)
    function getAllTravelRecords() {
        const allRecords = [];
    
        // 로컬 스토리지의 모든 키를 순회
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
    
            // 키가 'event'로 시작하는지 확인
            if (key.startsWith('event')) {
                const record = JSON.parse(localStorage.getItem(key));
                if (record) {
                    allRecords.push(record);
                }
            }
        }
    
        return allRecords;
    }
  

    // 폼 리셋 함수
    function resetForm() {
        // 입력 필드 값 초기화
        document.querySelector('input[type="text"][placeholder="여행 제목을 입력하세요"]').value = '';
        document.querySelector('input[type="date"]:first-of-type').value = '';
        document.querySelector('input[type="date"]:last-of-type').value = '';
        document.querySelector('input[type="text"][placeholder="여행한 도시, 국가를 입력하세요"]').value = '';
        document.querySelector('textarea').value = '';

        // 선택된 파일 초기화
        selectedFiles = [];
        renderFileList(selectedFiles);
    }
    

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
    
    // 파일을 base64로 변환하는 함수 (async/await 사용)
    async function convertFilesToBase64(files) {
        imageUrls = []; // 이전 변환 결과를 초기화

        // 비동기적으로 파일을 base64로 변환
        for (const file of files) {
            try {
                const base64String = await convertFileToBase64(file);
                imageUrls.push(base64String);
            } catch (error) {
                console.error('파일을 base64로 변환하는 중 오류 발생:', error);
            }
        }
    }

    // 파일을 base64로 변환하는 helper 함수
    function convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result); // 변환 성공 시
            reader.onerror = (error) => reject(error); // 변환 오류 시
            reader.readAsDataURL(file); // 파일을 base64로 읽기
        });
    }

    function displayEventSchedules() {
        const scheduleList = document.getElementById('saved-schedule-list');
        if (!scheduleList) {
            console.error('saved-schedule-list 요소를 찾을 수 없습니다.');
            return;
        }
    
        const schedules = getAllTravelRecords();
        console.log('불러온 일정:', schedules); // schedules 배열 확인
    
        if (schedules.length > 0) {
            scheduleList.innerHTML = '';
            schedules.forEach((schedule) => {
                const scheduleItem = document.createElement('div');
                scheduleItem.className = 'schedule-item p-4 border border-gray-200 rounded-lg';
                scheduleItem.innerHTML = `
                    <div class="text-lg font-semibold">${schedule.title}</div>
                    <div class="text-sm text-gray-600">${schedule.startDate}</div>
                `;
                scheduleList.appendChild(scheduleItem);
            });
        } else {
            scheduleList.innerHTML = '<div class="text-center py-4 text-gray-500">저장된 일정이 없습니다.</div>';
        }
    }
});

