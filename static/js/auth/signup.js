document.addEventListener('DOMContentLoaded', function() {
    let currentSegment = 1;
    const totalSegments = 5;
    const progressFill = document.getElementById('progressFill');
    let isWaitlistUser = false;
    let waitlistUserId = null;
    
    function updateProgress() {
        const progressPercentage = ((currentSegment - 1) / (totalSegments - 1)) * 100;
        progressFill.style.width = `${progressPercentage}%`;
        
        document.querySelectorAll('.step').forEach(step => {
            if (parseFloat(step.dataset.step) <= currentSegment) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }
    
    function goToSegment(segmentNumber) {
        document.querySelectorAll('.form-segment').forEach(segment => {
            segment.classList.remove('active');
            segment.style.display = 'none';
        });
        
        const targetSegment = document.querySelector(`[data-segment="${segmentNumber}"]`);
        if (targetSegment) {
            targetSegment.style.display = 'block';
            setTimeout(() => {
                targetSegment.classList.add('active');
            }, 10);
            currentSegment = segmentNumber;
        }
        
        updateProgress();
        document.querySelector('.signup-content').scrollTo(0, 0);
    }
    
    function determineNextSegment(currentSegment, age) {
        if (currentSegment === 1) {
            if (age >= 15 && age <= 17) {
                return 1.5;
            } else {
                return 2;
            }
        } else if (currentSegment === 1.5) {
            return 2;
        } else {
            return currentSegment + 1;
        }
    }
    
    function validateAge(age) {
        if (age < 15) {
            return { valid: false, message: "You are under the legal age to register. Registration is only available for youth aged 15-30 years old." };
        } else if (age > 30) {
            return { valid: false, message: "You exceed the maximum age allowed to register. The system is designed for youth aged 15-30 years old only." };
        } else if (age >= 15 && age <= 30) {
            return { valid: true, message: "" };
        }
    }
    
    function setupInputConstraints() {
        const contactInput = document.getElementById('contactNumber');
        const parentContactInput = document.getElementById('parentContactNumber');
        
        [contactInput, parentContactInput].forEach(input => {
            if (input) {
                input.addEventListener('input', function(e) {
                    this.value = this.value.replace(/[^0-9]/g, '');
                    if (this.value.length > 11) {
                        this.value = this.value.slice(0, 11);
                    }
                    if (this.value.length === 11 && !this.value.startsWith('09')) {
                        this.style.borderColor = '#EF4444';
                        showMessage('Philippine mobile numbers must start with "09"', 'error');
                    } else if (this.value.length === 11) {
                        this.style.borderColor = '#10B981';
                    }
                });
            }
        });
        
        const emailInput = document.getElementById('email');
        emailInput.addEventListener('blur', function() {
            if (this.value && !(this.value.endsWith('@gmail.com') || this.value.endsWith('@yahoo.com'))) {
                this.style.borderColor = '#EF4444';
                showMessage('Only Gmail (@gmail.com) or Yahoo (@yahoo.com) emails are allowed', 'error');
            }
        });
        
        const passwordInput = document.getElementById('password');
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            const isLongEnough = password.length >= 8;
            
            if (!isLongEnough || !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
                this.style.borderColor = '#EF4444';
            } else {
                this.style.borderColor = '#10B981';
            }
        });
        
        document.querySelectorAll('#firstName, #lastName, #middleName, #suffix, #parentName').forEach(input => {
            input.addEventListener('input', function() {
                this.value = this.value.toUpperCase();
            });
            
            input.addEventListener('blur', function() {
                this.value = this.value.toUpperCase();
            });
            
            if (input.value) {
                input.value = input.value.toUpperCase();
            }
        });
    }
    
    function showTermsModal() {
        const modal = document.getElementById('termsModal');
        modal.style.display = 'block';
        
        const agreeCheckbox = document.getElementById('agreeTerms');
        const acceptButton = document.querySelector('.btn-accept');
        
        agreeCheckbox.addEventListener('change', function() {
            acceptButton.disabled = !this.checked;
        });
        
        document.querySelector('.modal-close').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        document.querySelector('.btn-cancel').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        acceptButton.addEventListener('click', async function() {
            modal.style.display = 'none';
            const email = document.getElementById('email').value;
            const result = await generateOTP(email);
            
            if (result.success) {
                goToSegment(4);
                startOTPCountdown();
            } else {
                showMessage(result.message, 'error');
            }
        });
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
            return { success: false, message: 'Network error' };
        }
    }
    
    async function registerUserWithFiles(formData) {
        try {
            if (isWaitlistUser && waitlistUserId) {
                formData.append('is_waitlist_update', 'true');
                formData.append('waitlist_user_id', waitlistUserId);
            }
            
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
        
        if (isWaitlistUser) {
            formData.append('is_waitlist_update', 'true');
        }
        
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
        formData.append('education', document.getElementById('education').value);
        formData.append('youthClassification', document.getElementById('youthClassification').value);
        formData.append('workStatus', document.getElementById('workStatus').value);
        formData.append('skVoter', document.querySelector('input[name="skVoter"]:checked')?.value);
        formData.append('idType', document.getElementById('idType').value);
        formData.append('ageGroup', document.getElementById('ageGroup').value);
        
        const age = parseInt(document.getElementById('age').value) || 0;
        if (age >= 15 && age <= 17) {
            formData.append('parentName', document.getElementById('parentName').value);
            formData.append('parentRelationship', document.getElementById('parentRelationship').value);
            formData.append('parentContactNumber', document.getElementById('parentContactNumber').value);
            formData.append('consentDate', document.getElementById('consentDate').value);
            
            const parentConsentLetter = document.getElementById('parentConsentLetter').files[0];
            const parentIdPicture = document.getElementById('parentIdPicture').files[0];
            
            if (parentConsentLetter) formData.append('parentConsentLetter', parentConsentLetter);
            if (parentIdPicture) formData.append('parentIdPicture', parentIdPicture);
        }
        
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
                body: JSON.stringify({ username: username, is_waitlist_user: isWaitlistUser })
            });
            
            return await response.json();
        } catch (error) {
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
                body: JSON.stringify({ email: email, is_waitlist_user: isWaitlistUser })
            });
            
            return await response.json();
        } catch (error) {
            return { available: false, message: 'Network error' };
        }
    }
    
    document.querySelectorAll('.btn-next').forEach(button => {
        button.addEventListener('click', async function() {
            if (validateSegment(currentSegment)) {
                if (currentSegment === 3) {
                    showTermsModal();
                } else {
                    const age = parseInt(document.getElementById('age').value) || 0;
                    const nextSegment = determineNextSegment(currentSegment, age);
                    goToSegment(nextSegment);
                    
                    if (nextSegment === 5) {
                        populateConfirmation();
                    }
                }
            }
        });
    });
    
    document.querySelectorAll('.btn-prev').forEach(button => {
        button.addEventListener('click', function() {
            const age = parseInt(document.getElementById('age').value) || 0;
            let prevSegment = currentSegment - 1;
            
            if (currentSegment === 2) {
                if (age >= 15 && age <= 17) {
                    prevSegment = 1.5;
                } else {
                    prevSegment = 1;
                }
            }
            
            if (currentSegment === 1.5) {
                prevSegment = 1;
            }
            
            goToSegment(prevSegment);
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
                registerButton.textContent = isWaitlistUser ? 'Complete Registration & Activate Account' : 'Complete Registration';
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
                        registerButton.textContent = isWaitlistUser ? 'Complete Registration & Activate Account' : 'Complete Registration';
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
        let isValid = true;
        let errorMessages = [];
        
        const inputs = document.querySelectorAll(`[data-segment="${segment}"] input[required], [data-segment="${segment}"] select[required]`);
        inputs.forEach(input => {
            if (!input.value) {
                input.style.borderColor = '#EF4444';
                isValid = false;
                
                input.addEventListener('input', function() {
                    this.style.borderColor = '#D1D5DB';
                }, { once: true });
            }
        });
        
        const fileInputs = document.querySelectorAll(`[data-segment="${segment}"] input[type="file"][required]`);
        fileInputs.forEach(input => {
            if (!input.files || input.files.length === 0) {
                isValid = false;
                errorMessages.push(`${input.labels[0].textContent.trim()} is required`);
            }
        });
        
        if (segment === 1) {
            const age = parseInt(document.getElementById('age').value) || 0;
            const ageValidation = validateAge(age);
            if (!ageValidation.valid) {
                errorMessages.push(ageValidation.message);
                isValid = false;
                
                if (age < 15 || age > 30) {
                    document.getElementById('birthdate').value = '';
                    document.getElementById('age').value = '';
                }
            }
        }
        
        if (segment === 1.5) {
            const age = parseInt(document.getElementById('age').value) || 0;
            if (age >= 15 && age <= 17) {
                const parentFields = document.querySelectorAll('#parentConsentSegment input[required], #parentConsentSegment select[required]');
                parentFields.forEach(field => {
                    if (!field.value) {
                        field.style.borderColor = '#EF4444';
                        isValid = false;
                        errorMessages.push('All parent consent fields are required for youth aged 15-17');
                    }
                });
                
                const parentFiles = document.querySelectorAll('#parentConsentSegment input[type="file"][required]');
                parentFiles.forEach(fileInput => {
                    if (!fileInput.files || fileInput.files.length === 0) {
                        isValid = false;
                        errorMessages.push(`${fileInput.labels[0].textContent.trim()} is required for youth aged 15-17`);
                    }
                });
            }
        }
        
        if (segment === 3) {
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirmPassword');
            
            if (password.value !== confirmPassword.value) {
                confirmPassword.style.borderColor = '#EF4444';
                isValid = false;
                errorMessages.push('Passwords do not match');
                
                confirmPassword.addEventListener('input', function() {
                    if (password.value === this.value) {
                        this.style.borderColor = '#D1D5DB';
                    }
                });
            }
            
            const passwordValue = password.value;
            const hasUpperCase = /[A-Z]/.test(passwordValue);
            const hasLowerCase = /[a-z]/.test(passwordValue);
            const hasNumbers = /\d/.test(passwordValue);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue);
            const isLongEnough = passwordValue.length >= 8;
            
            if (!isLongEnough || !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
                isValid = false;
                errorMessages.push('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
            }
            
            const email = document.getElementById('email').value;
            if (email && !(email.endsWith('@gmail.com') || email.endsWith('@yahoo.com'))) {
                isValid = false;
                errorMessages.push('Only Gmail or Yahoo emails are allowed');
            }
            
            const contactNumber = document.getElementById('contactNumber').value;
            if (contactNumber && (contactNumber.length !== 11 || !contactNumber.startsWith('09'))) {
                isValid = false;
                errorMessages.push('Contact number must be 11 digits starting with 09');
            }
            
            const requiredFiles = document.querySelectorAll('#profilePicture[required], #idPicture[required]');
            requiredFiles.forEach(fileInput => {
                if (!fileInput.files || fileInput.files.length === 0) {
                    isValid = false;
                    errorMessages.push(`${fileInput.labels[0].textContent.trim()} is required`);
                }
            });
        }
        
        if (!isValid) {
            if (errorMessages.length > 0) {
                errorMessages.forEach(msg => showMessage(msg, 'error'));
            } else {
                showMessage('Please fill in all required fields correctly', 'error');
            }
        }
        
        return isValid;
    }
    
    function populateConfirmation() {
        document.getElementById('confirmRegNo').textContent = document.getElementById('registrationNo').value;
        document.getElementById('confirmName').textContent = `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`;
        document.getElementById('confirmEmail').textContent = document.getElementById('email').value;
    }
    
    const birthdateInput = document.getElementById('birthdate');
    const ageInput = document.getElementById('age');
    const ageGroupInput = document.getElementById('ageGroup');
    
    if (birthdateInput && ageInput && ageGroupInput) {
        birthdateInput.addEventListener('change', function() {
            const birthdate = new Date(this.value);
            const today = new Date();
            let age = today.getFullYear() - birthdate.getFullYear();
            const monthDiff = today.getMonth() - birthdate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
                age--;
            }
            
            ageInput.value = age;
            
            if (age >= 15 && age <= 17) {
                ageGroupInput.value = 'Child Youth (15-17 years)';
            } else if (age >= 18 && age <= 24) {
                ageGroupInput.value = 'Core Youth (18-24 years)';
            } else if (age >= 25 && age <= 30) {
                ageGroupInput.value = 'Young Adult (25-30 years)';
            } else {
                ageGroupInput.value = '';
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
        
        if (!document.querySelector('#message-animations')) {
            const style = document.createElement('style');
            style.id = 'message-animations';
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
    }
    
    function showWaitlistLoading() {
        const loadingScreen = document.getElementById('waitlistLoading');
        loadingScreen.classList.add('active');
    }
    
    function hideWaitlistLoading() {
        const loadingScreen = document.getElementById('waitlistLoading');
        loadingScreen.classList.remove('active');
    }
    
    function setupWaitlistModal() {
        const waitlistBtn = document.getElementById('waitlistBtn');
        const waitlistModal = document.getElementById('waitlistModal');
        const waitlistClose = waitlistModal.querySelector('.modal-close');
        const waitlistCancel = waitlistModal.querySelector('.btn-cancel');
        const checkWaitlistBtn = document.getElementById('checkWaitlistBtn');
        const waitlistEmailInput = document.getElementById('waitlistEmail');
        const waitlistError = document.getElementById('waitlistError');
        const waitlistSuccess = document.getElementById('waitlistSuccess');

        waitlistBtn.addEventListener('click', function() {
            waitlistModal.style.display = 'block';
            waitlistEmailInput.focus();
        });

        waitlistClose.addEventListener('click', function() {
            waitlistModal.style.display = 'none';
            resetWaitlistForm();
        });

        waitlistCancel.addEventListener('click', function() {
            waitlistModal.style.display = 'none';
            resetWaitlistForm();
        });

        checkWaitlistBtn.addEventListener('click', async function() {
            const email = waitlistEmailInput.value.trim();
            
            if (!email) {
                showWaitlistError('Please enter your email address');
                return;
            }
            
            if (!(email.endsWith('@gmail.com') || email.endsWith('@yahoo.com'))) {
                showWaitlistError('Only Gmail or Yahoo emails are allowed');
                return;
            }
            
            checkWaitlistBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
            checkWaitlistBtn.disabled = true;
            
            try {
                const result = await checkWaitlistStatus(email);
                
                if (result.success && result.on_waitlist) {
                    showWaitlistSuccess();
                    
                    setTimeout(() => {
                        waitlistModal.style.display = 'none';
                        showWaitlistLoading();
                        
                        setTimeout(() => {
                            prefillFormFromWaitlist(result.user_data);
                            hideWaitlistLoading();
                            resetWaitlistForm();
                        }, 2000);
                        
                    }, 1500);
                    
                } else {
                    showWaitlistError(result.message || 'You are not on our waitlist. Please register a new account.');
                    checkWaitlistBtn.innerHTML = '<i class="fas fa-search"></i> Check Waitlist Status';
                    checkWaitlistBtn.disabled = false;
                }
                
            } catch (error) {
                showWaitlistError('Network error. Please try again.');
                checkWaitlistBtn.innerHTML = '<i class="fas fa-search"></i> Check Waitlist Status';
                checkWaitlistBtn.disabled = false;
            }
        });

        waitlistEmailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                checkWaitlistBtn.click();
            }
        });
    }

    async function checkWaitlistStatus(email) {
        try {
            const response = await fetch('/api/check-waitlist/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({ email: email })
            });
            
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Network error' };
        }
    }

    function showWaitlistError(message) {
        const waitlistError = document.getElementById('waitlistError');
        waitlistError.textContent = message;
        waitlistError.style.display = 'block';
        
        const waitlistSuccess = document.getElementById('waitlistSuccess');
        waitlistSuccess.style.display = 'none';
        
        setTimeout(() => {
            waitlistError.style.display = 'none';
        }, 5000);
    }

    function showWaitlistSuccess() {
        const waitlistError = document.getElementById('waitlistError');
        waitlistError.style.display = 'none';
        
        const waitlistSuccess = document.getElementById('waitlistSuccess');
        waitlistSuccess.style.display = 'flex';
    }

    function resetWaitlistForm() {
        document.getElementById('waitlistEmail').value = '';
        document.getElementById('waitlistCode').value = '';
        document.getElementById('waitlistError').style.display = 'none';
        document.getElementById('waitlistSuccess').style.display = 'none';
        
        const checkWaitlistBtn = document.getElementById('checkWaitlistBtn');
        checkWaitlistBtn.innerHTML = '<i class="fas fa-search"></i> Check Waitlist Status';
        checkWaitlistBtn.disabled = false;
    }

    function prefillFormFromWaitlist(userData) {
        isWaitlistUser = true;
        waitlistUserId = userData.id;
        
        if (userData.first_name) document.getElementById('firstName').value = userData.first_name.toUpperCase();
        if (userData.last_name) document.getElementById('lastName').value = userData.last_name.toUpperCase();
        if (userData.middle_name) document.getElementById('middleName').value = userData.middle_name.toUpperCase();
        if (userData.suffix) document.getElementById('suffix').value = userData.suffix.toUpperCase();
        if (userData.address) document.getElementById('address').value = userData.address;
        
        if (userData.purok_zone) {
            const purokSelect = document.getElementById('purokZone');
            const options = Array.from(purokSelect.options);
            const matchingOption = options.find(option => option.value === userData.purok_zone);
            if (matchingOption) {
                purokSelect.value = userData.purok_zone;
            }
        }
        
        if (userData.gender) {
            const genderSelect = document.getElementById('gender');
            const options = Array.from(genderSelect.options);
            const matchingOption = options.find(option => option.textContent.trim() === userData.gender);
            if (matchingOption) {
                genderSelect.value = matchingOption.value;
            }
        }
        
        if (userData.birthdate) {
            document.getElementById('birthdate').value = userData.birthdate;
            document.getElementById('age').value = userData.age;
            document.getElementById('ageGroup').value = userData.age_group;
        }
        
        if (userData.contact_number) document.getElementById('contactNumber').value = userData.contact_number;
        
        if (userData.civil_status) {
            const civilStatusSelect = document.getElementById('civilStatus');
            const options = Array.from(civilStatusSelect.options);
            const matchingOption = options.find(option => option.textContent.trim() === userData.civil_status);
            if (matchingOption) {
                civilStatusSelect.value = matchingOption.value;
            }
        }
        
        if (userData.education) {
            const educationSelect = document.getElementById('education');
            const options = Array.from(educationSelect.options);
            const matchingOption = options.find(option => option.textContent.trim() === userData.education);
            if (matchingOption) {
                educationSelect.value = matchingOption.value;
            }
        }
        
        if (userData.youth_classification) {
            const youthClassificationSelect = document.getElementById('youthClassification');
            const options = Array.from(youthClassificationSelect.options);
            const matchingOption = options.find(option => option.textContent.trim() === userData.youth_classification);
            if (matchingOption) {
                youthClassificationSelect.value = matchingOption.value;
            }
        }
        
        if (userData.work_status) {
            const workStatusSelect = document.getElementById('workStatus');
            const options = Array.from(workStatusSelect.options);
            const matchingOption = options.find(option => option.textContent.trim() === userData.work_status);
            if (matchingOption) {
                workStatusSelect.value = matchingOption.value;
            }
        }
        
        if (userData.sk_voter !== undefined) {
            const skVoterRadios = document.querySelectorAll('input[name="skVoter"]');
            skVoterRadios.forEach(radio => {
                radio.checked = radio.value === (userData.sk_voter ? 'Yes' : 'No');
            });
        }
        
        if (userData.email) {
            document.getElementById('email').value = userData.email;
            if (userData.username) document.getElementById('username').value = userData.username;
        }
        
        if (userData.id_type) {
            const idTypeSelect = document.getElementById('idType');
            const options = Array.from(idTypeSelect.options);
            const matchingOption = options.find(option => option.textContent.trim() === userData.id_type);
            if (matchingOption) {
                idTypeSelect.value = matchingOption.value;
            } else {
                idTypeSelect.value = userData.id_type;
            }
        }
        
        if (userData.age >= 15 && userData.age <= 17) {
            if (userData.parent_name) document.getElementById('parentName').value = userData.parent_name.toUpperCase();
            
            if (userData.parent_relationship) {
                const parentRelationshipSelect = document.getElementById('parentRelationship');
                const options = Array.from(parentRelationshipSelect.options);
                const matchingOption = options.find(option => option.value === userData.parent_relationship);
                if (matchingOption) {
                    parentRelationshipSelect.value = userData.parent_relationship;
                }
            }
            
            if (userData.parent_contact_number) document.getElementById('parentContactNumber').value = userData.parent_contact_number;
            if (userData.consent_date) document.getElementById('consentDate').value = userData.consent_date;
        }
        
        document.getElementById('password').required = false;
        document.getElementById('confirmPassword').required = false;
        
        const passwordHint = document.querySelector('.input-hint');
        if (passwordHint) {
            passwordHint.textContent = 'Leave blank to keep current password';
        }
        
        const existingPassword = document.getElementById('password');
        const existingConfirmPassword = document.getElementById('confirmPassword');
        
        existingPassword.placeholder = 'Leave blank to keep current password';
        existingConfirmPassword.placeholder = 'Leave blank to keep current password';
        
        showMessage('Your waitlist information has been loaded! You can update your information and complete registration.', 'success');
        
        goToSegment(1);
    }
    
    document.querySelectorAll('.form-segment').forEach(segment => {
        segment.style.display = 'none';
    });
    document.querySelector('[data-segment="1"]').style.display = 'block';
    
    setupInputConstraints();
    updateProgress();
    setupWaitlistModal();
});