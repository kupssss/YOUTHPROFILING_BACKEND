document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
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
    }
    
    const loginForm = document.querySelector('.login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username');
            const password = document.getElementById('password');
            const rememberMe = document.getElementById('remember');
            let isValid = true;
            
            resetErrors();
            
            if (!username.value.trim()) {
                showError(username, 'Username or email is required');
                isValid = false;
            }
            
            if (!password.value.trim()) {
                showError(password, 'Password is required');
                isValid = false;
            }
            
            if (isValid) {
                await handleLogin(username.value, password.value, rememberMe.checked);
            }
        });
    }
    
    const forgotPassword = document.querySelector('.forgot-password');
    
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Please contact the system administrator for password reset assistance.');
        });
    }
    
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#EF4444';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        input.style.borderColor = '#EF4444';
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        formGroup.appendChild(errorDiv);
    }
    function resetErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());
        
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.style.borderColor = '#D1D5DB';
        });
    }
    async function handleLogin(username, password, rememberMe) {
        const loginBtn = document.querySelector('.login-btn');
        const originalHTML = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        loginBtn.disabled = true;
        
        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                    rememberMe: rememberMe
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showMessage('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = data.redirect || '/mainpage/';
                }, 1500);
            } else {
                showMessage(data.message, 'error');
                loginBtn.innerHTML = originalHTML;
                loginBtn.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('Network error. Please try again.', 'error');
            loginBtn.innerHTML = originalHTML;
            loginBtn.disabled = false;
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
    
    function showMessage(message, type) {
        const existingMessage = document.querySelector('.login-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        const messageEl = document.createElement('div');
        messageEl.className = `login-message login-message-${type}`;
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
            setTimeout(() => {
                messageEl.remove();
            }, 300);
        });
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    messageEl.remove();
                }, 300);
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
    
    function initAnimations() {
        const loginContent = document.querySelector('.login-content');
        const loginHero = document.querySelector('.login-hero');
        
        if (loginContent) {
            loginContent.style.opacity = '0';
            loginContent.style.transform = 'translateY(20px)';
            loginContent.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                loginContent.style.opacity = '1';
                loginContent.style.transform = 'translateY(0)';
            }, 100);
        }
        
        if (loginHero) {
            loginHero.style.opacity = '0';
            loginHero.style.transform = 'translateY(20px)';
            loginHero.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                loginHero.style.opacity = '1';
                loginHero.style.transform = 'translateY(0)';
            }, 200);
        }
    }

    initAnimations();
});