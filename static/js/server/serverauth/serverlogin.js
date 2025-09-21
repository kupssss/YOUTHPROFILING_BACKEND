document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('serverTogglePassword');
    const passwordInput = document.getElementById('serverPassword');
    
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
    
    const loginForm = document.getElementById('serverLoginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('serverUsername');
            const password = document.getElementById('serverPassword');
            const rememberMe = document.getElementById('serverRemember');
            let isValid = true;
            
            resetErrors();
            
            if (!username.value.trim()) {
                showError(username, 'Administrator ID is required');
                isValid = false;
            }
            
            if (!password.value.trim()) {
                showError(password, 'Security key is required');
                isValid = false;
            }
            
            if (isValid) {
                await handleServerLogin(username.value, password.value, rememberMe.checked);
            }
        });
    }
    
    const forgotPassword = document.querySelector('.server-forgot-password');
    
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            showMessage('Please contact the system super administrator for access recovery.', 'info');
        });
    }

    function showError(input, message) {
        const formGroup = input.closest('.server-form-group');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#ff6b6b';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        input.style.borderColor = '#ff6b6b';
        
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
            input.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        });
    }
    
    async function handleServerLogin(username, password, rememberMe) {
        const loginBtn = document.querySelector('.server-login-btn');
        const originalHTML = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Authenticating...';
        loginBtn.disabled = true;
        
        try {
            const response = await fetch('/server/auth/login/', {
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
                showMessage('Authentication successful! Redirecting to admin dashboard...', 'success');
                
                setTimeout(() => {
                    window.location.href = data.redirect || '/server/dashboard/';
                }, 1500);
            } else {
                showMessage(data.message, 'error');
                loginBtn.innerHTML = originalHTML;
                loginBtn.disabled = false;
                
                loginForm.classList.add('shake');
                setTimeout(() => {
                    loginForm.classList.remove('shake');
                }, 500);
            }
        } catch (error) {
            console.error('Server login error:', error);
            showMessage('Network error. Please check your connection and try again.', 'error');
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
        const existingMessage = document.querySelector('.server-login-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageEl = document.createElement('div');
        messageEl.className = `server-login-message server-login-message-${type}`;
        messageEl.innerHTML = `
            <p>${message}</p>
            <button class="server-message-close"><i class="fas fa-times"></i></button>
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
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease;
            ${type === 'success' ? 'background: rgba(46, 125, 50, 0.9); color: white;' : 
              type === 'error' ? 'background: rgba(211, 47, 47, 0.9); color: white;' :
              'background: rgba(25, 118, 210, 0.9); color: white;'}
            backdrop-filter: blur(10px);
        `;
        
        const closeBtn = messageEl.querySelector('.server-message-close');
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
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                    20%, 40%, 60%, 80% { transform: translateX(10px); }
                }
                .shake {
                    animation: shake 0.5s;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function initAnimations() {
        const loginCard = document.querySelector('.server-login-card');
        const sidepanel = document.querySelector('.server-login-sidepanel');
        
        if (loginCard) {
            loginCard.style.opacity = '0';
            loginCard.style.transform = 'translateX(-20px)';
            loginCard.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                loginCard.style.opacity = '1';
                loginCard.style.transform = 'translateX(0)';
            }, 100);
        }
        
        if (sidepanel) {
            sidepanel.style.opacity = '0';
            sidepanel.style.transform = 'translateX(20px)';
            sidepanel.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            setTimeout(() => {
                sidepanel.style.opacity = '1';
                sidepanel.style.transform = 'translateX(0)';
            }, 200);
        }
        
        const features = document.querySelectorAll('.admin-feature');
        features.forEach((feature, index) => {
            feature.style.opacity = '0';
            feature.style.transform = 'translateY(20px)';
            feature.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
            
            setTimeout(() => {
                feature.style.opacity = '1';
                feature.style.transform = 'translateY(0)';
            }, 300 + (index * 100));
        });
    }

    initAnimations();
});