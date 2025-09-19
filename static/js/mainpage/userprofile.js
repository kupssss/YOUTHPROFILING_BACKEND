document.addEventListener('DOMContentLoaded', function() {

    function getCSRFToken() {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
        return cookieValue || '';
    }

    const profileForm = document.getElementById('profileForm');
    const successModal = document.getElementById('successModal');
    const modalOkBtn = document.getElementById('modalOkBtn');
    const closeModal = document.querySelector('.close');
    
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            
            fetch('/api/update-profile/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCSRFToken()
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    successModal.style.display = 'block';
                    setTimeout(adjustTextForID, 100);
                } else {
                    alert('Error updating profile: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while updating your profile.');
            });
        });
    }
    
    if (modalOkBtn) {
        modalOkBtn.addEventListener('click', function() {
            successModal.style.display = 'none';
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            successModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === successModal) {
            successModal.style.display = 'none';
        }
    });
    
    const flipIdBtn = document.getElementById('flipIdBtn');
    const idCardWrapper = document.querySelector('.id-card-wrapper');
    
    if (flipIdBtn && idCardWrapper) {
        flipIdBtn.addEventListener('click', function() {
            idCardWrapper.classList.toggle('flipped');
        });
    }
    
    function adjustTextForID() {
        const nameElement = document.querySelector('.id-name');
        if (nameElement) {
            const nameText = nameElement.textContent;
            if (nameText.length > 30) {
                nameElement.style.fontSize = '0.9rem';
            }
            if (nameText.length > 40) {
                nameElement.style.fontSize = '0.8rem';
            }
        }
        const addressElement = document.querySelector('.id-detail-value');
        if (addressElement) {
            const addressText = addressElement.textContent;
            if (addressText.length > 35) {
                addressElement.style.fontSize = '0.65rem';
            }
        }
    }
    
    adjustTextForID();
    const formInputs = document.querySelectorAll('#profileForm input, #profileForm select, #profileForm textarea');
    formInputs.forEach(input => {
        input.addEventListener('change', adjustTextForID);
    });
    
    const downloadIdBtn = document.getElementById('downloadIdBtn');
if (downloadIdBtn) {
    downloadIdBtn.addEventListener('click', function() {
        const pdfContainer = document.createElement('div');
        pdfContainer.style.width = '600px';
        pdfContainer.style.margin = '0 0';
        pdfContainer.style.height = '1300px';
        pdfContainer.style.padding = '20';
        pdfContainer.style.top = '-60';
        pdfContainer.style.backgroundColor = '#fff';
        

        const frontDiv = document.createElement('div');
        frontDiv.innerHTML = document.getElementById('idCardFront').innerHTML;
        frontDiv.style.marginTop = '-200px';
        frontDiv.style.marginBottom = '20px';
        frontDiv.style.border = '1px solid #ccc';
        frontDiv.style.borderRadius = '15px';
        frontDiv.style.overflow = 'hidden';
        
        const backDiv = document.createElement('div');
        backDiv.innerHTML = document.getElementById('idCardBack').innerHTML;  
        backDiv.style.border = '1px solid #ccc';
        backDiv.style.borderRadius = '15px';
        backDiv.style.overflow = 'hidden';
        
        pdfContainer.appendChild(frontDiv);
        pdfContainer.appendChild(backDiv);
        
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.appendChild(pdfContainer);
        document.body.appendChild(tempContainer);
        
        const options = {
            margin: 2,
            filename: 'sk_mambugan_id.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: true,
                backgroundColor: '#ffffff'
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait' 
            }
        };
        
        html2pdf()
            .from(pdfContainer)
            .set(options)
            .save()
            .then(() => {
                document.body.removeChild(tempContainer);
            })
            .catch(error => {
                console.error('PDF generation error:', error);
                document.body.removeChild(tempContainer);
                alert('Error generating PDF. Please try again.');
            });
    });
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
        });
    }
    
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    const phoneInput = document.getElementById('contact_number');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9+]/g, '');
        });
    }
    
    const cancelBtn = profileForm.querySelector('.cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            if (profileForm.checkValidity()) {
                const confirmReset = confirm('Are you sure you want to discard your changes?');
                if (!confirmReset) {
                    e.preventDefault();
                }
            }
        });
    }
    
    Date.prototype.addYears = function(years) {
        this.setFullYear(this.getFullYear() + years);
        return this;
    };
});
