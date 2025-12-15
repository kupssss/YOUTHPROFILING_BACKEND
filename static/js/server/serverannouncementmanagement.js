document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    setupSidebar();
    setupDropdowns();
    setupAccessControl();
    setupModal();
    setupForm();
    setupAnnouncementActions();
    setupAnimations();
    setupDateValidation();
});

function updateCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', options);
}

function setupSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.server-sidebar');
    const mainContent = document.querySelector('.server-main-content');
    const mobileToggle = document.getElementById('mobileSidebarToggle');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            const icon = sidebarToggle.querySelector('i');
            icon.className = sidebar.classList.contains('collapsed') ? 'fas fa-bars' : 'fas fa-times';
        });
    }
    
    if (mobileToggle && sidebar) {
        mobileToggle.style.display = 'block';
        mobileToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
}

function setupDropdowns() {
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.closest('.nav-dropdown');
            const menu = dropdown.querySelector('.dropdown-menu');
            this.classList.toggle('active');
            menu.classList.toggle('show');
        });
    });
}

function setupAccessControl() {
    const systemSettingsLinks = document.querySelectorAll('.system-settings-link');
    const unauthorizedModal = document.getElementById('unauthorizedModal');
    const closeModal = document.querySelector('.close-modal');
    
    systemSettingsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const hasAccess = this.getAttribute('data-has-access') === 'true';
            if (!hasAccess) {
                e.preventDefault();
                unauthorizedModal.style.display = 'flex';
            }
        });
    });
    
    if (closeModal && unauthorizedModal) {
        closeModal.addEventListener('click', function() {
            unauthorizedModal.style.display = 'none';
        });
        
        unauthorizedModal.addEventListener('click', function(e) {
            if (e.target === unauthorizedModal) {
                unauthorizedModal.style.display = 'none';
            }
        });
    }
}

function setupModal() {
    const createBtn = document.getElementById('createAnnouncementBtn');
    const modal = document.getElementById('announcementModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelForm = document.getElementById('cancelForm');
    const deleteModal = document.getElementById('deleteModal');
    const cancelDelete = document.getElementById('cancelDelete');
    
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            openAnnouncementModal();
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeAnnouncementModal);
    }
    
    if (cancelForm) {
        cancelForm.addEventListener('click', closeAnnouncementModal);
    }
    
    if (cancelDelete) {
        cancelDelete.addEventListener('click', function() {
            deleteModal.classList.remove('active');
        });
    }
    
    const confirmDelete = document.getElementById('confirmDelete');
    if (confirmDelete) {
        confirmDelete.addEventListener('click', function() {
            const announcementId = deleteModal.getAttribute('data-id');
            if (announcementId) {
                deleteAnnouncement(announcementId);
            }
            deleteModal.classList.remove('active');
        });
    }
    
    document.addEventListener('click', function(e) {
        if (e.target === modal) closeAnnouncementModal();
        if (e.target === deleteModal) deleteModal.classList.remove('active');
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAnnouncementModal();
            deleteModal.classList.remove('active');
        }
    });
}

function setupForm() {
    const form = document.getElementById('announcementForm');
    const excerptTextarea = document.getElementById('excerpt');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    if (excerptTextarea) {
        excerptTextarea.addEventListener('input', function() {
            const count = this.value.length;
            const countSpan = document.getElementById('excerptCount');
            countSpan.textContent = count;
            countSpan.style.color = count > 300 ? '#f44336' : '#A0AEC0';
            if (count > 300) {
                this.value = this.value.substring(0, 300);
                countSpan.textContent = '300';
            }
        });
    }
    
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            const imagePreview = document.getElementById('imagePreview');
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Image Preview">`;
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                imagePreview.style.display = 'none';
            }
        });
    }
}

function setupAnnouncementActions() {
    document.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const announcementId = this.getAttribute('data-id');
            openAnnouncementModal(announcementId);
        });
    });
    
    document.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const announcementId = this.getAttribute('data-id');
            const deleteModal = document.getElementById('deleteModal');
            deleteModal.setAttribute('data-id', announcementId);
            deleteModal.classList.add('active');
        });
    });
}

function setupAnimations() {
    document.querySelectorAll('.stat-card').forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
    
    document.querySelectorAll('.announcement-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ease ${0.3 + (index * 0.05)}s, transform 0.5s ease ${0.3 + (index * 0.05)}s`;
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300 + (index * 50));
    });
}

function setupDateValidation() {
    const effectiveDateInput = document.getElementById('effective_date');
    const deadlineInput = document.getElementById('deadline');
    
    if (effectiveDateInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const minDate = now.toISOString().slice(0, 16);
        effectiveDateInput.min = minDate;
        
        effectiveDateInput.addEventListener('change', function() {
            if (deadlineInput.value) {
                const effectiveDate = new Date(this.value);
                const deadlineDate = new Date(deadlineInput.value);
                if (deadlineDate < effectiveDate) {
                    deadlineInput.setCustomValidity('Deadline must be after effective date');
                    deadlineInput.reportValidity();
                } else {
                    deadlineInput.setCustomValidity('');
                }
            }
        });
    }
    
    if (deadlineInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        deadlineInput.min = now.toISOString().slice(0, 16);
    }
}

function openAnnouncementModal(announcementId = null) {
    const modal = document.getElementById('announcementModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitText = document.getElementById('submitText');
    const form = document.getElementById('announcementForm');
    
    if (announcementId) {
        modalTitle.textContent = 'Edit Announcement';
        submitText.textContent = 'Update Announcement';
        populateFormWithAnnouncementData(announcementId);
    } else {
        modalTitle.textContent = 'Create Announcement';
        submitText.textContent = 'Create Announcement';
        form.reset();
        document.getElementById('category').value = 'general';
        document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('excerptCount').textContent = '0';
        setupDateValidation();
    }
    
    modal.classList.add('active');
}

function closeAnnouncementModal() {
    document.getElementById('announcementModal').classList.remove('active');
}

function populateFormWithAnnouncementData(announcementId) {
    const announcement = announcementsData.find(a => a.id == announcementId);
    
    if (!announcement) return;
    
    document.getElementById('announcementId').value = announcement.id;
    document.getElementById('title').value = announcement.title;
    document.getElementById('category').value = announcement.category;
    document.getElementById('excerpt').value = announcement.excerpt || '';
    document.getElementById('content').value = announcement.content;
    document.getElementById('location').value = announcement.location || '';
    document.getElementById('is_important').checked = announcement.is_important;
    document.getElementById('is_active').checked = announcement.is_active;
    
    const effectiveDateInput = document.getElementById('effective_date');
    const deadlineInput = document.getElementById('deadline');
    
    if (announcement.effective_date) {
        const effectiveDate = new Date(announcement.effective_date);
        effectiveDate.setMinutes(effectiveDate.getMinutes() - effectiveDate.getTimezoneOffset());
        effectiveDateInput.value = effectiveDate.toISOString().slice(0, 16);
    }
    
    if (announcement.deadline) {
        const deadline = new Date(announcement.deadline);
        deadline.setMinutes(deadline.getMinutes() - deadline.getTimezoneOffset());
        deadlineInput.value = deadline.toISOString().slice(0, 16);
    }
    
    document.getElementById('excerptCount').textContent = announcement.excerpt ? announcement.excerpt.length : 0;
    
    const imagePreview = document.getElementById('imagePreview');
    if (announcement.image) {
        imagePreview.innerHTML = `<img src="${announcement.image}" alt="Announcement Image">`;
        imagePreview.style.display = 'block';
    } else {
        imagePreview.style.display = 'none';
    }
    
    setupDateValidation();
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const announcementId = formData.get('id');
    const isEdit = !!announcementId;
    
    const effectiveDate = new Date(formData.get('effective_date'));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (effectiveDate < now) {
        showMessage('Effective date cannot be in the past.', 'error');
        return;
    }
    
    const deadline = formData.get('deadline');
    if (deadline) {
        const deadlineDate = new Date(deadline);
        if (deadlineDate < effectiveDate) {
            showMessage('Deadline must be after effective date.', 'error');
            return;
        }
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    const url = isEdit 
        ? `/server/announcements/${announcementId}/update/` 
        : '/server/announcements/create/';
    
    fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': csrfToken,
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            closeAnnouncementModal();
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showMessage(data.message, 'error');
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Network error. Please try again.', 'error');
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
    });
}

function deleteAnnouncement(announcementId) {
    fetch(`/server/announcements/${announcementId}/delete/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showMessage(data.message, 'success');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showMessage(data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Network error. Please try again.', 'error');
    });
}

function showMessage(message, type) {
    const existingMessage = document.querySelector('.announcement-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = `announcement-message message-${type}`;
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
        z-index: 3000;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: rgba(46, 125, 50, 0.9); color: white;' : 
          type === 'error' ? 'background: rgba(211, 47, 47, 0.9); color: white;' :
          'background: rgba(25, 118, 210, 0.9); color: white;'}
        backdrop-filter: blur(10px);
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
}