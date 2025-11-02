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
    const deleteModal = document.getElementById('deleteModal');
    const modalOkBtn = document.getElementById('modalOkBtn');
    const closeModal = document.querySelectorAll('.close');
    const deleteConfirmBtn = document.getElementById('deleteConfirmBtn');
    const deleteCancelBtn = document.getElementById('deleteCancelBtn');
    
    let currentFileTypeToDelete = '';

    const fileInputs = document.querySelectorAll('.file-input');
    fileInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const previewContainer = this.closest('.file-upload-container').querySelector('.current-file-preview');
                
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        previewContainer.innerHTML = `
                            <img src="${e.target.result}" alt="Preview" class="file-preview-image">
                            <button type="button" class="delete-file-btn" data-file-type="${input.name}">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        `;
                        attachDeleteHandlers();
                    };
                    reader.readAsDataURL(file);
                } else {
                    previewContainer.innerHTML = `
                        <div class="file-info">
                            <i class="fas fa-file-pdf"></i>
                            <span>${file.name}</span>
                            <a href="#" class="view-file-btn" onclick="return false;">
                                <i class="fas fa-eye"></i> View
                            </a>
                        </div>
                        <button type="button" class="delete-file-btn" data-file-type="${input.name}">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    `;
                    attachDeleteHandlers();
                }
            }
        });
    });

    function attachDeleteHandlers() {
        const deleteButtons = document.querySelectorAll('.delete-file-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                currentFileTypeToDelete = this.getAttribute('data-file-type');
                const modalMessage = document.getElementById('deleteModalMessage');
                modalMessage.textContent = `Are you sure you want to remove the ${currentFileTypeToDelete.replace('_', ' ')}?`;
                deleteModal.style.display = 'block';
            });
        });
    }

    attachDeleteHandlers();

    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', function() {
            if (currentFileTypeToDelete === 'profile_picture') {
                fetch('/api/delete-profile-picture/', {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRFToken': getCSRFToken()
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const previewContainer = document.querySelector(`[data-file-type="${currentFileTypeToDelete}"]`).closest('.current-file-preview');
                        previewContainer.innerHTML = `
                            <div class="no-file-placeholder">
                                <i class="fas fa-user-circle"></i>
                                <span>No ${currentFileTypeToDelete.replace('_', ' ')} uploaded</span>
                            </div>
                        `;
                        const fileInput = document.getElementById(currentFileTypeToDelete);
                        if (fileInput) {
                            fileInput.value = '';
                        }
                    } else {
                        alert('Error: ' + data.message);
                    }
                    deleteModal.style.display = 'none';
                });
            } else {
                const previewContainer = document.querySelector(`[data-file-type="${currentFileTypeToDelete}"]`).closest('.current-file-preview');
                previewContainer.innerHTML = `
                    <div class="no-file-placeholder">
                        <i class="fas fa-file"></i>
                        <span>No ${currentFileTypeToDelete.replace('_', ' ')} uploaded</span>
                    </div>
                `;
                
                const fileInput = document.getElementById(currentFileTypeToDelete);
                if (fileInput) {
                    fileInput.value = '';
                }
                deleteModal.style.display = 'none';
            }
        });
    }

    if (deleteCancelBtn) {
        deleteCancelBtn.addEventListener('click', function() {
            deleteModal.style.display = 'none';
        });
    }

    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const saveBtn = this.querySelector('.save-btn');
            const originalText = saveBtn.innerHTML;
            
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            saveBtn.disabled = true;
            
            fetch('/api/update-profile/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': getCSRFToken()
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const modalMessage = document.getElementById('modalMessage');
                    modalMessage.textContent = data.message || 'Your profile has been updated successfully.';
                    successModal.style.display = 'block';
                    setTimeout(adjustTextForID, 100);
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    alert('Error updating profile: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while updating your profile.');
            })
            .finally(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
            });
        });
    }
    
    if (modalOkBtn) {
        modalOkBtn.addEventListener('click', function() {
            successModal.style.display = 'none';
        });
    }
    
    closeModal.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            successModal.style.display = 'none';
            deleteModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === successModal) {
            successModal.style.display = 'none';
        }
        if (event.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });

    const flipIdBtn = document.getElementById('flipIdBtn');
    const idCardWrapper = document.querySelector('.id-card-wrapper');
    
    if (flipIdBtn && idCardWrapper) {
        flipIdBtn.addEventListener('click', function() {
            idCardWrapper.classList.toggle('flipped');
        });
    }

    const birthdateInput = document.getElementById('birthdate');
    const ageInput = document.getElementById('age');
    const ageGroupInput = document.getElementById('age_group');
    
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
            
            let ageGroup = '';
            if (age >= 15 && age <= 17) ageGroup = '15-17';
            else if (age >= 18 && age <= 21) ageGroup = '18-21';
            else if (age >= 22 && age <= 25) ageGroup = '22-25';
            else if (age >= 26 && age <= 30) ageGroup = '26-30';
            
            if (ageGroup) {
                ageGroupInput.value = ageGroup;
            }
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