document.addEventListener('DOMContentLoaded', function() {
    let currentSegment = 1;
    const totalSegments = 5;
    const progressFill = document.getElementById('progressFill');
    const form = document.getElementById('registrationForm');
    
    function updateProgress() {
        const progressPercentage = ((currentSegment - 1) / (totalSegments - 1)) * 100;
        progressFill.style.width = `${progressPercentage}%`;
        
        document.querySelectorAll('.step').forEach(step => {
            if (parseInt(step.dataset.step) <= currentSegment) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }
    
    function goToSegment(segmentNumber) {
        document.querySelectorAll('.form-segment').forEach(segment => {
            segment.classList.remove('active');
        });
        
        document.querySelector(`[data-segment="${segmentNumber}"]`).classList.add('active');
        currentSegment = segmentNumber;
        updateProgress();
        
        document.querySelector('.signup-content').scrollTo(0, 0);
    }
    
    async function generateOTP(email) {
        try {
            const response = await fetch('/api/generate-otp/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({ email: email })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error generating OTP:', error);
            return { success: false, message: 'Network error' };
        }
    }
    
    async function verifyOTP(email, otp) {
        try {
            const response = await fetch('/api/verify-otp/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({ email: email, otp: otp })
            });
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error verifying OTP:', error);
            return { success: false, message: 'Network error' };
        }
    }
    
    async function registerUserWithFiles(formData) {
        try {
            const response = await fetch('/api/register_user_with_files/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCSRFToken()
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (!data.success) {
                if (data.message.includes('Username already taken') || 
                    data.message.includes('Email already registered')) {
                    goToSegment(3);
                }
            }
            
            return data;
        } catch (error) {
            console.error('Error registering user:', error);
            return { success: false, message: 'Network error' };
        }
    }
    
    function getCSRFToken() {
        const name = 'csrftoken';
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    function collectFormDataWithFiles() {
        const formData = new FormData();
        
        formData.append('username', document.getElementById('username').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('password', document.getElementById('password').value);
        formData.append('firstName', document.getElementById('firstName').value);
        formData.append('lastName', document.getElementById('lastName').value);
        formData.append('middleName', document.getElementById('middleName').value);
        formData.append('suffix', document.getElementById('suffix').value);
        formData.append('address', document.getElementById('address').value);
        formData.append('purokZone', document.getElementById('purokZone').value);
        formData.append('gender', document.getElementById('gender').value);
        formData.append('birthdate', document.getElementById('birthdate').value);
        formData.append('age', document.getElementById('age').value);
        formData.append('contactNumber', document.getElementById('contactNumber').value);
        formData.append('civilStatus', document.getElementById('civilStatus').value);
        formData.append('ageGroup', document.getElementById('ageGroup').value);
        formData.append('education', document.getElementById('education').value);
        formData.append('youthClassification', document.getElementById('youthClassification').value);
        formData.append('workStatus', document.getElementById('workStatus').value);
        formData.append('skVoter', document.querySelector('input[name="skVoter"]:checked')?.value);
        formData.append('idType', document.getElementById('idType').value);
        
        const profilePicture = document.getElementById('profilePicture').files[0];
        const idPicture = document.getElementById('idPicture').files[0];
        const birthCertificate = document.getElementById('birthCertificate').files[0];
        
        if (profilePicture) formData.append('profilePicture', profilePicture);
        if (idPicture) formData.append('idPicture', idPicture);
        if (birthCertificate) formData.append('birthCertificate', birthCertificate);
        
        return formData;
    }
    
    async function checkUsername(username) {
        try {
            const response = await fetch('/api/check-username/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({ username: username })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error checking username:', error);
            return { available: false, message: 'Network error' };
        }
    }
    
    async function checkEmail(email) {
        try {
            const response = await fetch('/api/check-email/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({ email: email })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Error checking email:', error);
            return { available: false, message: 'Network error' };
        }
    }
    
    document.querySelectorAll('.btn-next').forEach(button => {
        button.addEventListener('click', async function() {
            if (validateSegment(currentSegment)) {
                if (currentSegment === 3) {
                    const email = document.getElementById('email').value;
                    const result = await generateOTP(email);
                    
                    if (result.success) {
                        goToSegment(currentSegment + 1);
                        startOTPCountdown();
                    } else {
                        showMessage(result.message, 'error');
                    }
                } else {
                    goToSegment(currentSegment + 1);
                    if (currentSegment === 4) populateConfirmation();
                }
            }
        });
    });
    
    document.querySelectorAll('.btn-prev').forEach(button => {
        button.addEventListener('click', function() {
            goToSegment(currentSegment - 1);
        });
    });
    
    const verifyButton = document.querySelector('.btn-verify');
    if (verifyButton) {
        verifyButton.addEventListener('click', async function() {
            const email = document.getElementById('email').value;
            const otpInputs = document.querySelectorAll('.otp-input');
            let otp = '';
            
            otpInputs.forEach(input => {
                otp += input.value;
            });
            
            if (otp.length !== 6) {
                showMessage('Please enter the complete verification code', 'error');
                return;
            }
            
            const result = await verifyOTP(email, otp);
            
            if (result.success) {
                showMessage('Email verified successfully!', 'success');
                
                const existingButton = document.querySelector('.btn-register');
                if (existingButton) existingButton.remove();
                
                const registerButton = document.createElement('button');
                registerButton.textContent = 'Complete Registration';
                registerButton.className = 'btn-register';
                registerButton.style.cssText = `
                    background: #4F46E5;
                    color: white;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    margin-top: 20px;
                `;
                
                registerButton.addEventListener('click', async function() {
                    registerButton.textContent = 'Processing...';
                    registerButton.disabled = true;
                    
                    const formData = collectFormDataWithFiles();
                    const registrationResult = await registerUserWithFiles(formData);
                    
                    if (registrationResult.success) {
                        document.getElementById('confirmRegNo').textContent = registrationResult.registrationNo;
                        document.getElementById('confirmName').textContent = `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`;
                        document.getElementById('confirmEmail').textContent = document.getElementById('email').value;
                        goToSegment(5);
                    } else {
                        showMessage(registrationResult.message, 'error');
                        registerButton.textContent = 'Complete Registration';
                        registerButton.disabled = false;
                        
                        if (registrationResult.message.includes('Username already taken') || 
                            registrationResult.message.includes('Email already registered')) {
                            goToSegment(3);
                        }
                    }
                });
                
                const otpSegment = document.querySelector('[data-segment="4"]');
                otpSegment.querySelector('.segment-navigation').appendChild(registerButton);
                
            } else {
                showMessage(result.message, 'error');
            }
        });
    }
    
    function validateSegment(segment) {
        const inputs = document.querySelectorAll(`[data-segment="${segment}"] input, [data-segment="${segment}"] select`);
        let isValid = true;
        
        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value) {
                input.style.borderColor = '#EF4444';
                isValid = false;
                
                input.addEventListener('input', function() {
                    this.style.borderColor = '#D1D5DB';
                }, { once: true });
            }
        });
        
        if (segment === 3) {
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirmPassword');
            
            if (password.value !== confirmPassword.value) {
                confirmPassword.style.borderColor = '#EF4444';
                isValid = false;
                
                confirmPassword.addEventListener('input', function() {
                    if (password.value === this.value) {
                        this.style.borderColor = '#D1D5DB';
                    }
                });
            }
            
            const email = document.getElementById('email').value;
            if (email && !(email.endsWith('@gmail.com') || email.endsWith('@yahoo.com'))) {
                showMessage('Only Gmail or Yahoo emails are allowed', 'error');
                isValid = false;
            }
            
            const idPicture = document.getElementById('idPicture').files[0];
            if (!idPicture) {
                showMessage('ID Picture is required', 'error');
                isValid = false;
            }
        }
        
        if (!isValid) showMessage('Please fill in all required fields', 'error');
        return isValid;
    }
    
    function populateConfirmation() {
        document.getElementById('confirmRegNo').textContent = 'Will be assigned after registration';
        document.getElementById('confirmName').textContent = `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`;
        document.getElementById('confirmEmail').textContent = document.getElementById('email').value;
    }
    
    const birthdateInput = document.getElementById('birthdate');
    const ageInput = document.getElementById('age');
    
    if (birthdateInput && ageInput) {
        birthdateInput.addEventListener('change', function() {
            const birthdate = new Date(this.value);
            const today = new Date();
            let age = today.getFullYear() - birthdate.getFullYear();
            const monthDiff = today.getMonth() - birthdate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
                age--;
            }
            
            ageInput.value = age;
            
            const ageGroupSelect = document.getElementById('ageGroup');
            if (ageGroupSelect) {
                if (age >= 15 && age <= 17) ageGroupSelect.value = '15-17';
                else if (age >= 18 && age <= 21) ageGroupSelect.value = '18-21';
                else if (age >= 22 && age <= 25) ageGroupSelect.value = '22-25';
                else if (age >= 26 && age <= 30) ageGroupSelect.value = '26-30';
            }
        });
    }
    
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    
    if (emailInput && usernameInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !usernameInput.value) {
                usernameInput.value = this.value.split('@')[0];
            }
        });
    }
    
    if (usernameInput) {
        usernameInput.addEventListener('blur', async function() {
            if (this.value) {
                const result = await checkUsername(this.value);
                if (!result.available) {
                    showMessage(result.message, 'error');
                    this.style.borderColor = '#EF4444';
                } else {
                    this.style.borderColor = '#D1D5DB';
                }
            }
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('blur', async function() {
            if (this.value) {
                const result = await checkEmail(this.value);
                if (!result.available) {
                    showMessage(result.message, 'error');
                    this.style.borderColor = '#EF4444';
                } else {
                    this.style.borderColor = '#D1D5DB';
                }
            }
        });
    }
    
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const eyeIcon = this.querySelector('i');
            if (type === 'text') {
                eyeIcon.classList.remove('fa-eye');
                eyeIcon.classList.add('fa-eye-slash');
            } else {
                eyeIcon.classList.remove('fa-eye-slash');
                eyeIcon.classList.add('fa-eye');
            }
        });
    });
    
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.addEventListener('change', function() {
            const fileName = this.files[0]?.name || 'No file chosen';
            this.nextElementSibling.nextElementSibling.textContent = fileName;
        });
    });
    
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function() {
            if (this.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });
    
    const resendButton = document.querySelector('.btn-resend');
    const countdownElement = document.getElementById('countdown');
    
    async function resendOTP() {
        const email = document.getElementById('email').value;
        const result = await generateOTP(email);
        
        if (result.success) {
            showMessage('Verification code has been resent to your email', 'success');
            startOTPCountdown();
        } else {
            showMessage(result.message, 'error');
        }
    }
    
    function startOTPCountdown() {
        let countdown = 120;
        resendButton.disabled = true;
        countdownElement.style.display = 'inline';
        
        function updateCountdown() {
            const minutes = Math.floor(countdown / 60);
            const seconds = countdown % 60;
            countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (countdown > 0) {
                countdown--;
                setTimeout(updateCountdown, 1000);
            } else {
                resendButton.disabled = false;
                countdownElement.style.display = 'none';
            }
        }
        
        updateCountdown();
    }
    
    if (resendButton && countdownElement) {
        resendButton.addEventListener('click', resendOTP);
        if (currentSegment === 4) startOTPCountdown();
    }
    
    function showMessage(message, type) {
        const existingMessage = document.querySelector('.signup-message');
        if (existingMessage) existingMessage.remove();
        
        const messageEl = document.createElement('div');
        messageEl.className = `signup-message signup-message-${type}`;
        messageEl.innerHTML = `
            <p>${message}</p>
            <button class="message-close"><i class="fas fa-times"></i></button>
        `;
        
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            max-width: 400px;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease;
            ${type === 'success' ? 'background: #10B981; color: white;' : 'background: #EF4444; color: white;'}
        `;
        
        const closeBtn = messageEl.querySelector('.message-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: inherit;
            margin-left: 15px;
            cursor: pointer;
            font-size: 1.1rem;
        `;
        
        closeBtn.addEventListener('click', function() {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageEl.remove(), 300);
        });
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => messageEl.remove(), 300);
            }
        }, 5000);
        
        document.body.appendChild(messageEl);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    updateProgress();
});