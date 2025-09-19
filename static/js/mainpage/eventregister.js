document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registrationForm');
    const steps = document.querySelectorAll('.form-step');
    const progressFill = document.getElementById('progressFill');
    const progressSteps = document.querySelectorAll('.step');
    const nextButtons = document.querySelectorAll('.btn-next');
    const prevButtons = document.querySelectorAll('.btn-prev');
    const successModal = document.getElementById('successModal');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    let currentStep = 1;
    const totalSteps = 4;
    
    const registrationContainer = document.querySelector('.registration-container');
    const eventId = registrationContainer ? registrationContainer.getAttribute('data-event-id') : null;
    
    initializeForm();
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                goToStep(currentStep + 1);
            }
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            goToStep(currentStep - 1);
        });
    });
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitRegistration();
    });
    
    document.getElementById('addToCalendar')?.addEventListener('click', function() {
        alert('This would add the event to your calendar.');
    });
    
    function initializeForm() {
        goToStep(1);
        addValidationListeners();
    }
    
    function goToStep(step) {
        steps.forEach(s => s.classList.remove('active'));
        
        const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }
        
        updateProgress(step);
        
        progressSteps.forEach(s => {
            const stepNum = parseInt(s.getAttribute('data-step'));
            if (stepNum <= step) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
        
        if (step === 4) {
            updateConfirmationSummary();
        }
        
        currentStep = step;
        
        document.querySelector('.registration-content')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    function updateProgress(step) {
        const percentage = ((step - 1) / (totalSteps - 1)) * 100;
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
    }
    
    function validateStep(step) {
        let isValid = true;
        
        switch(step) {
            case 2:
                const emergencyName = document.getElementById('emergency_contact_name');
                const emergencyNumber = document.getElementById('emergency_contact_number');
                
                if (!emergencyName?.value.trim()) {
                    showFieldError(emergencyName, 'Emergency contact name is required');
                    isValid = false;
                } else {
                    clearFieldError(emergencyName);
                }
                
                if (!emergencyNumber?.value.trim()) {
                    showFieldError(emergencyNumber, 'Emergency contact number is required');
                    isValid = false;
                } else if (!isValidPhoneNumber(emergencyNumber.value)) {
                    showFieldError(emergencyNumber, 'Please enter a valid phone number');
                    isValid = false;
                } else {
                    clearFieldError(emergencyNumber);
                }
                break;
                
            case 3:
                const requiredQuestions = document.querySelectorAll('[required]');
                requiredQuestions.forEach(question => {
                    if (question.type === 'checkbox' || question.type === 'radio') {
                        const name = question.name;
                        const checked = document.querySelector(`input[name="${name}"]:checked`);
                        if (!checked) {
                            showFieldError(question, 'This field is required');
                            isValid = false;
                        } else {
                            clearFieldError(question);
                        }
                    } else if (!question.value.trim()) {
                        showFieldError(question, 'This field is required');
                        isValid = false;
                    } else {
                        clearFieldError(question);
                    }
                });
                
                const termsAgreement = document.getElementById('agree_to_terms');
                if (!termsAgreement?.checked) {
                    showFieldError(termsAgreement, 'You must agree to the terms and conditions');
                    isValid = false;
                } else {
                    clearFieldError(termsAgreement);
                }
                break;
        }
        
        return isValid;
    }
    
    function addValidationListeners() {
        const emergencyName = document.getElementById('emergency_contact_name');
        const emergencyNumber = document.getElementById('emergency_contact_number');
        
        emergencyName?.addEventListener('blur', function() {
            if (!this.value.trim()) {
                showFieldError(this, 'Emergency contact name is required');
            } else {
                clearFieldError(this);
            }
        });
        
        emergencyNumber?.addEventListener('blur', function() {
            if (!this.value.trim()) {
                showFieldError(this, 'Emergency contact number is required');
            } else if (!isValidPhoneNumber(this.value)) {
                showFieldError(this, 'Please enter a valid phone number');
            } else {
                clearFieldError(this);
            }
        });
        
        const requiredQuestions = document.querySelectorAll('[required]');
        requiredQuestions.forEach(question => {
            if (question.type === 'checkbox' || question.type === 'radio') {
                const inputs = document.querySelectorAll(`input[name="${question.name}"]`);
                inputs.forEach(input => {
                    input.addEventListener('change', function() {
                        const checked = document.querySelector(`input[name="${question.name}"]:checked`);
                        if (checked) {
                            clearFieldError(question);
                        }
                    });
                });
            } else {
                question.addEventListener('blur', function() {
                    if (!this.value.trim()) {
                        showFieldError(this, 'This field is required');
                    } else {
                        clearFieldError(this);
                    }
                });
            }
        });
        
        const termsAgreement = document.getElementById('agree_to_terms');
        termsAgreement?.addEventListener('change', function() {
            if (this.checked) {
                clearFieldError(this);
            }
        });
    }
    
    function showFieldError(field, message) {
        if (!field) return;
        
        clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#EF4444';
        errorDiv.style.fontSize = '0.85rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        
        field.style.borderColor = '#EF4444';
        field.parentNode.appendChild(errorDiv);
    }
    
    function clearFieldError(field) {
        if (!field) return;
        
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.style.borderColor = '#E5E7EB';
    }
    
    function isValidPhoneNumber(phone) {
        const phoneRegex = /^[+]?[\d\s\-().]{10,}$/;
        return phoneRegex.test(phone);
    }
    
    function updateConfirmationSummary() {
        const emergencyName = document.getElementById('emergency_contact_name');
        const emergencyNumber = document.getElementById('emergency_contact_number');
        const summaryEmergencyName = document.getElementById('summary-emergency-name');
        const summaryEmergencyNumber = document.getElementById('summary-emergency-number');
        
        if (emergencyName && summaryEmergencyName) {
            summaryEmergencyName.textContent = emergencyName.value;
        }
        if (emergencyNumber && summaryEmergencyNumber) {
            summaryEmergencyNumber.textContent = emergencyNumber.value;
        }
        
        const responsesContainer = document.getElementById('summary-responses');
        if (responsesContainer) {
            responsesContainer.innerHTML = '';
            
            const questions = document.querySelectorAll('.form-group');
            questions.forEach(question => {
                const label = question.querySelector('label');
                if (label && label.htmlFor && label.htmlFor.startsWith('question_')) {
                    const questionId = label.htmlFor;
                    const input = document.getElementById(questionId);
                    
                    if (input) {
                        let responseValue = '';
                        
                        if (input.type === 'checkbox') {
                            const checkedBoxes = document.querySelectorAll(`input[name="${input.name}"]:checked`);
                            responseValue = Array.from(checkedBoxes).map(cb => cb.value).join(', ');
                        } else if (input.type === 'radio') {
                            const selectedRadio = document.querySelector(`input[name="${input.name}"]:checked`);
                            responseValue = selectedRadio ? selectedRadio.value : 'Not answered';
                        } else {
                            responseValue = input.value || 'Not answered';
                        }
                        
                        if (responseValue) {
                            const responseItem = document.createElement('div');
                            responseItem.style.marginTop = '8px';
                            responseItem.innerHTML = `<strong>${label.textContent.replace('*', '').trim()}:</strong> ${responseValue}`;
                            responsesContainer.appendChild(responseItem);
                        }
                    }
                }
            });
        }
    }
    
    function submitRegistration() {
        if (!eventId) {
            alert('Event ID is missing. Please refresh the page and try again.');
            return;
        }
        
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
        
        const formData = new FormData();
        
        const emergencyName = document.getElementById('emergency_contact_name');
        const emergencyNumber = document.getElementById('emergency_contact_number');
        const dietaryRestrictions = document.getElementById('dietary_restrictions');
        const specialAccommodations = document.getElementById('special_accommodations');
        const howHeard = document.getElementById('how_heard');
        const agreeToTerms = document.getElementById('agree_to_terms');
        const agreeToPhotos = document.getElementById('agree_to_photos');
        
        if (emergencyName) formData.append('emergency_contact_name', emergencyName.value);
        if (emergencyNumber) formData.append('emergency_contact_number', emergencyNumber.value);
        if (dietaryRestrictions) formData.append('dietary_restrictions', dietaryRestrictions.value);
        if (specialAccommodations) formData.append('special_accommodations', specialAccommodations.value);
        if (howHeard) formData.append('how_heard', howHeard.value);
        if (agreeToTerms) formData.append('agree_to_terms', agreeToTerms.checked);
        if (agreeToPhotos) formData.append('agree_to_photos', agreeToPhotos.checked);
        
        const questions = document.querySelectorAll('.form-group');
        questions.forEach(question => {
            const label = question.querySelector('label');
            if (label && label.htmlFor && label.htmlFor.startsWith('question_')) {
                const questionId = label.htmlFor;
                const input = document.getElementById(questionId);
                
                if (input) {
                    if (input.type === 'checkbox') {
                        const checkedBoxes = document.querySelectorAll(`input[name="${input.name}"]:checked`);
                        const values = Array.from(checkedBoxes).map(cb => cb.value);
                        formData.append(input.name, values.join(', '));
                    } else if (input.type === 'radio') {
                        const selectedRadio = document.querySelector(`input[name="${input.name}"]:checked`);
                        if (selectedRadio) {
                            formData.append(input.name, selectedRadio.value);
                        }
                    } else {
                        formData.append(input.name, input.value);
                    }
                }
            }
        });
        
        const jsonData = {};
        for (let [key, value] of formData.entries()) {
            jsonData[key] = value;
        }
        
        fetch(`/api/event/register/${eventId}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify(jsonData),
        })
        .then(response => response.json())
        .then(data => {
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            
            if (data.success) {
                const successMessage = document.getElementById('successMessage');
                if (successMessage) {
                    successMessage.textContent = data.message;
                }
                if (successModal) {
                    successModal.style.display = 'flex';
                }
            } else {
                alert('Registration failed: ' + data.error);
            }
        })
        .catch(error => {
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            
            alert('An error occurred during registration. Please try again.');
            console.error('Error:', error);
        });
    }
    
    function getCookie(name) {
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
});