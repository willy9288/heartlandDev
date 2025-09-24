// ============================================
// assets/js/doctors.js - 醫師系統 JavaScript
// ============================================

(function() {
    'use strict';

    // ============================================
    // 初始化
    // ============================================
    
    document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
        initAppointmentForm();
        initSmoothScroll();
        initLoadingStates();
        initFormValidation();
    });

    // ============================================
    // 手機選單
    // ============================================
    
    function initMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (mobileToggle && mainNav) {
            mobileToggle.addEventListener('click', function() {
                mainNav.classList.toggle('active');
                mobileToggle.classList.toggle('active');
            });
            
            // 點擊選單外部時關閉
            document.addEventListener('click', function(e) {
                if (!mobileToggle.contains(e.target) && !mainNav.contains(e.target)) {
                    mainNav.classList.remove('active');
                    mobileToggle.classList.remove('active');
                }
            });
        }
    }

    // ============================================
    // 預約表單處理
    // ============================================
    
    function initAppointmentForm() {
        const form = document.getElementById('appointmentForm');
        if (!form) return;
        
        form.addEventListener('submit', handleAppointmentSubmit);
        
        // 設置最小日期為明天
        const dateInput = document.getElementById('preferredDate');
        if (dateInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.min = tomorrow.toISOString().split('T')[0];
        }
        
        // 即時驗證
        const requiredFields = form.querySelectorAll('input[required], select[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', validateField);
            field.addEventListener('input', clearFieldError);
        });
    }
    
    async function handleAppointmentSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('.submit-btn');
        const formData = new FormData(form);
        
        // 顯示載入狀態
        setLoadingState(submitBtn, true);
        
        try {
            // 表單驗證
            if (!validateForm(form)) {
                setLoadingState(submitBtn, false);
                return;
            }
            
            // 準備資料
            const appointmentData = Object.fromEntries(formData);
            
            // 發送預約請求
            const response = await fetch('/api/appointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': getCsrfToken()
                },
                body: JSON.stringify(appointmentData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showSuccessMessage('預約成功！我們會在24小時內與您聯繫確認。');
                form.reset();
                
                // 滾動到成功訊息
                setTimeout(() => {
                    const successMessage = document.querySelector('.success-message');
                    if (successMessage) {
                        successMessage.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
                
            } else {
                throw new Error(result.message || '預約失敗，請稍後再試');
            }
            
        } catch (error) {
            console.error('預約錯誤:', error);
            showErrorMessage(error.message || '預約失敗，請檢查網路連線或稍後再試。');
        } finally {
            setLoadingState(submitBtn, false);
        }
    }
    
    // ============================================
    // 表單驗證
    // ============================================
    
    function validateForm(form) {
        let isValid = true;
        const requiredFields = form.querySelectorAll('input[required], select[required]');
        
        // 清除舊的錯誤訊息
        clearAllErrors(form);
        
        requiredFields.forEach(field => {
            if (!validateField({ target: field })) {
                isValid = false;
            }
        });
        
        // 特殊驗證
        const email = form.querySelector('#clientEmail');
        if (email && email.value && !isValidEmail(email.value)) {
            showFieldError(email, '請輸入有效的Email地址');
            isValid = false;
        }
        
        const phone = form.querySelector('#clientPhone');
        if (phone && phone.value && !isValidPhone(phone.value)) {
            showFieldError(phone, '請輸入有效的電話號碼');
            isValid = false;
        }
        
        const age = form.querySelector('#clientAge');
        if (age && age.value && (age.value < 1 || age.value > 120)) {
            showFieldError(age, '請輸入有效的年齡 (1-120歲)');
            isValid = false;
        }
        
        const agreeTerms = form.querySelector('#agreeTerms');
        if (agreeTerms && !agreeTerms.checked) {
            showFieldError(agreeTerms, '請同意隱私權政策和服務條款');
            isValid = false;
        }
        
        return isValid;
    }
    
    function validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        
        // 清除舊的錯誤
        clearFieldError(field);
        
        if (field.hasAttribute('required') && !value) {
            showFieldError(field, '此欄位為必填');
            return false;
        }
        
        return true;
    }
    
    function showFieldError(field, message) {
        field.classList.add('error');
        
        let errorDiv = field.parentNode.querySelector('.field-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            field.parentNode.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '0.25rem';
    }
    
    function clearFieldError(field) {
        if (typeof field === 'object' && field.target) {
            field = field.target;
        }
        
        field.classList.remove('error');
        
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }
    
    function clearAllErrors(form) {
        const errorFields = form.querySelectorAll('.error');
        const errorDivs = form.querySelectorAll('.field-error');
        
        errorFields.forEach(field => field.classList.remove('error'));
        errorDivs.forEach(div => div.remove());
    }
    
    // ============================================
    // 訊息顯示
    // ============================================
    
    function showSuccessMessage(message) {
        showMessage(message, 'success');
    }
    
    function showErrorMessage(message) {
        showMessage(message, 'error');
    }
    
    function showMessage(message, type = 'info') {
        // 移除舊訊息
        const oldMessage = document.querySelector('.message-alert');
        if (oldMessage) {
            oldMessage.remove();
        }
        
        // 建立新訊息
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-alert message-${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <span class="message-text">${message}</span>
                <button class="message-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
        
        // 樣式
        Object.assign(messageDiv.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: '9999',
            maxWidth: '400px',
            backgroundColor: type === 'success' ? '#d4edda' : '#f8d7da',
            color: type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
            animation: 'slideInRight 0.3s ease'
        });
        
        // 訊息內容樣式
        const messageContent = messageDiv.querySelector('.message-content');
        Object.assign(messageContent.style, {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
        });
        
        const closeBtn = messageDiv.querySelector('.message-close');
        Object.assign(closeBtn.style, {
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: 'inherit',
            opacity: '0.7',
            transition: 'opacity 0.3s'
        });
        
        closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
        closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.7');
        
        // 添加到頁面
        document.body.appendChild(messageDiv);
        
        // 自動消失
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.remove();
                    }
                }, 300);
            }
        }, 5000);
        
        // 添加動畫樣式到 head
        if (!document.querySelector('#message-animations')) {
            const style = document.createElement('style');
            style.id = 'message-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // ============================================
    // 載入狀態管理
    // ============================================
    
    function initLoadingStates() {
        // 為所有按鈕添加載入狀態支援
        const buttons = document.querySelectorAll('.appointment-btn, .submit-btn');
        buttons.forEach(btn => {
            if (!btn.querySelector('.btn-loading')) {
                const loadingSpan = document.createElement('span');
                loadingSpan.className = 'btn-loading';
                loadingSpan.textContent = '處理中...';
                loadingSpan.style.display = 'none';
                btn.appendChild(loadingSpan);
            }
        });
    }
    
    function setLoadingState(button, loading) {
        if (!button) return;
        
        const btnText = button.querySelector('.btn-text') || button.childNodes[0];
        const btnLoading = button.querySelector('.btn-loading');
        
        if (loading) {
            button.disabled = true;
            button.classList.add('loading');
            if (btnText && btnText.nodeType === Node.TEXT_NODE) {
                button.setAttribute('data-original-text', btnText.textContent);
                btnText.textContent = '';
            }
            if (btnLoading) {
                btnLoading.style.display = 'inline';
            }
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            if (btnText && button.hasAttribute('data-original-text')) {
                btnText.textContent = button.getAttribute('data-original-text');
            }
            if (btnLoading) {
                btnLoading.style.display = 'none';
            }
        }
    }
    
    // ============================================
    // 工具函數
    // ============================================
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidPhone(phone) {
        const phoneRegex = /^[\d\-\(\)\+\s]+$/;
        return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
    }
    
    function getCsrfToken() {
        const token = document.querySelector('meta[name="csrf-token"]');
        return token ? token.getAttribute('content') : '';
    }
    
    // ============================================
    // 平滑捲動
    // ============================================
    
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // 更新 URL
                    history.pushState(null, null, href);
                }
            });
        });
    }
    
    // ============================================
    // 表單改善功能
    // ============================================
    
    function initFormValidation() {
        // 電話號碼格式化
        const phoneInputs = document.querySelectorAll('input[type="tel"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', formatPhoneNumber);
        });
        
        // Email 自動完成建議
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('input', suggestEmailDomains);
        });
        
        // 日期選擇限制（排除週日）
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            input.addEventListener('change', validateAppointmentDate);
        });
    }
    
    function formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 10) {
            if (value.startsWith('09')) {
                // 手機格式: 0912-345-678
                value = value.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3');
            } else if (value.startsWith('0')) {
                // 市話格式: 02-1234-5678
                if (value.length === 10 && (value.startsWith('02') || value.startsWith('03') || value.startsWith('04') || value.startsWith('05') || value.startsWith('06') || value.startsWith('07') || value.startsWith('08'))) {
                    value = value.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
                }
            }
        }
        
        e.target.value = value;
    }
    
    function suggestEmailDomains(e) {
        const value = e.target.value;
        const atIndex = value.indexOf('@');
        
        if (atIndex > 0) {
            const domain = value.substring(atIndex + 1);
            const commonDomains = ['gmail.com', 'yahoo.com.tw', 'hotmail.com', 'outlook.com', 'icloud.com'];
            
            // 這裡可以實作自動完成功能
            // 為了簡化，暫時不實作
        }
    }
    
    function validateAppointmentDate(e) {
        const selectedDate = new Date(e.target.value);
        const day = selectedDate.getDay();
        
        // 檢查是否為週日 (0)
        if (day === 0) {
            showFieldError(e.target, '預約不開放週日，請選擇其他日期');
            e.target.value = '';
            return false;
        }
        
        // 檢查是否為節假日（這裡可以擴展）
        const holidays = getHolidays();
        const dateString = e.target.value;
        
        if (holidays.includes(dateString)) {
            showFieldError(e.target, '該日期為國定假日，預約不開放');
            e.target.value = '';
            return false;
        }
        
        clearFieldError(e.target);
        return true;
    }
    
    function getHolidays() {
        // 這裡應該從 API 或配置檔案獲取節假日資料
        // 暫時返回空陣列
        return [
            // '2025-01-01', // 元旦
            // '2025-02-10', // 春節
            // 可以添加更多節假日
        ];
    }
    
    // ============================================
    // 醫師卡片互動
    // ============================================
    
    function initDoctorCards() {
        const doctorCards = document.querySelectorAll('.doctor-card');
        
        doctorCards.forEach(card => {
            // 添加點擊整個卡片跳轉功能
            card.addEventListener('click', function(e) {
                if (e.target.classList.contains('appointment-btn') || e.target.closest('.appointment-btn')) {
                    return; // 如果點擊的是按鈕，不處理卡片點擊
                }
                
                const doctorId = this.dataset.doctorId;
                if (doctorId) {
                    window.location.href = `/doctor-detail?id=${doctorId}`;
                }
            });
            
            // 添加 hover 效果
            card.addEventListener('mouseenter', function() {
                this.style.cursor = 'pointer';
            });
        });
    }
    
    // ============================================
    // 搜尋功能 (可選)
    // ============================================
    
    function initDoctorSearch() {
        const searchInput = document.querySelector('#doctorSearch');
        if (!searchInput) return;
        
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const doctorCards = document.querySelectorAll('.doctor-card');
            
            doctorCards.forEach(card => {
                const name = card.querySelector('.doctor-name')?.textContent.toLowerCase() || '';
                const specialties = card.querySelector('.doctor-specialties')?.textContent.toLowerCase() || '';
                const description = card.querySelector('.doctor-description')?.textContent.toLowerCase() || '';
                
                const matches = name.includes(searchTerm) || 
                              specialties.includes(searchTerm) || 
                              description.includes(searchTerm);
                
                card.style.display = matches ? 'block' : 'none';
            });
        });
    }
    
    // ============================================
    // 預約時段檢查 (進階功能)
    // ============================================
    
    async function checkAvailableSlots(doctorId, date) {
        try {
            const response = await fetch(`/api/doctor/${doctorId}/available-slots?date=${date}`);
            const data = await response.json();
            
            if (response.ok) {
                updateTimeSlotOptions(data.availableSlots);
            } else {
                console.warn('無法取得可用時段:', data.message);
            }
        } catch (error) {
            console.error('檢查可用時段時發生錯誤:', error);
        }
    }
    
    function updateTimeSlotOptions(availableSlots) {
        const timeSelect = document.querySelector('#preferredTime');
        if (!timeSelect) return;
        
        // 保留原有選項
        const options = timeSelect.querySelectorAll('option');
        options.forEach((option, index) => {
            if (index === 0) return; // 保留第一個預設選項
            
            const isAvailable = availableSlots.includes(option.value);
            option.disabled = !isAvailable;
            option.textContent = option.textContent.replace(' (已滿)', '');
            
            if (!isAvailable) {
                option.textContent += ' (已滿)';
            }
        });
    }
    
    // ============================================
    // 初始化所有功能
    // ============================================
    
    // 當 DOM 載入完成後初始化其他功能
    document.addEventListener('DOMContentLoaded', function() {
        initDoctorCards();
        initDoctorSearch();
        
        // 如果是醫師詳細頁面，監聽日期變更來檢查可用時段
        const dateInput = document.querySelector('#preferredDate');
        const doctorId = new URLSearchParams(window.location.search).get('id');
        
        if (dateInput && doctorId) {
            dateInput.addEventListener('change', function() {
                if (this.value) {
                    checkAvailableSlots(doctorId, this.value);
                }
            });
        }
    });
    
    // ============================================
    // 全域函數 (供 HTML 調用)
    // ============================================
    
    window.DoctorSystem = {
        showDoctorDetail: function(doctorId) {
            window.location.href = `/doctor-detail?id=${doctorId}`;
        },
        
        goToCategory: function(category) {
            window.location.href = `/doctors-${category}`;
        },
        
        bookAppointment: function(doctorId) {
            window.location.href = `/doctor-detail?id=${doctorId}#appointment-form`;
        }
    };

})();