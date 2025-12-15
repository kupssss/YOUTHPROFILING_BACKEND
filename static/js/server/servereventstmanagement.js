document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    setupSidebar();
    setupDropdowns();
    setupAccessControl();
    setupModal();
    setupForm();
    setupEventActions();
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
    const createBtn = document.getElementById('createEventBtn');
    const createFirstBtn = document.getElementById('createFirstEvent');
    const modal = document.getElementById('eventModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelForm = document.getElementById('cancelForm');
    const deleteModal = document.getElementById('deleteModal');
    const cancelDelete = document.getElementById('cancelDelete');
    
    if (createBtn) {
        createBtn.addEventListener('click', openEventModal);
    }
    
    if (createFirstBtn) {
        createFirstBtn.addEventListener('click', openEventModal);
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeEventModal);
    }
    
    if (cancelForm) {
        cancelForm.addEventListener('click', closeEventModal);
    }
    
    if (cancelDelete) {
        cancelDelete.addEventListener('click', function() {
            deleteModal.classList.remove('active');
        });
    }
    
    const confirmDelete = document.getElementById('confirmDelete');
    if (confirmDelete) {
        confirmDelete.addEventListener('click', function() {
            const eventId = deleteModal.getAttribute('data-id');
            if (eventId) {
                deleteEvent(eventId);
            }
            deleteModal.classList.remove('active');
        });
    }
    
    document.addEventListener('click', function(e) {
        if (e.target === modal) closeEventModal();
        if (e.target === deleteModal) deleteModal.classList.remove('active');
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeEventModal();
            deleteModal.classList.remove('active');
        }
    });
}

function setupForm() {
    const form = document.getElementById('eventForm');
    const excerptTextarea = document.getElementById('excerpt');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    const requiresRegistration = document.getElementById('requires_registration');
    const registrationFields = document.getElementById('registrationFields');
    
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
    
    if (requiresRegistration && registrationFields) {
        requiresRegistration.addEventListener('change', function() {
            registrationFields.style.display = this.checked ? 'grid' : 'none';
            if (this.checked) {
                setupDateValidation();
            }
        });
    }
}

function setupEventActions() {
    document.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = this.getAttribute('data-id');
            const card = this.closest('.event-card');
            if (!card.classList.contains('disabled')) {
                openEventModal(eventId);
            }
        });
    });
    
    document.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const eventId = this.getAttribute('data-id');
            const card = this.closest('.event-card');
            if (!card.classList.contains('disabled')) {
                const deleteModal = document.getElementById('deleteModal');
                deleteModal.setAttribute('data-id', eventId);
                deleteModal.classList.add('active');
            }
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
    
    document.querySelectorAll('.event-card').forEach((card, index) => {
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
    const startDateInput = document.getElementById('start_date');
    const endDateInput = document.getElementById('end_date');
    const registrationDeadlineInput = document.getElementById('registration_deadline');
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const minDate = now.toISOString().slice(0, 16);
    
    if (startDateInput) {
        startDateInput.min = minDate;
        
        startDateInput.addEventListener('change', function() {
            const startDate = new Date(this.value);
            
            if (endDateInput.value) {
                const endDate = new Date(endDateInput.value);
                if (endDate <= startDate) {
                    endDateInput.setCustomValidity('End date must be after start date');
                    endDateInput.reportValidity();
                } else {
                    endDateInput.setCustomValidity('');
                }
            }
            
            if (registrationDeadlineInput && registrationDeadlineInput.value) {
                const regDeadline = new Date(registrationDeadlineInput.value);
                if (regDeadline >= startDate) {
                    registrationDeadlineInput.setCustomValidity('Registration deadline must be before start date');
                    registrationDeadlineInput.reportValidity();
                } else {
                    registrationDeadlineInput.setCustomValidity('');
                }
            }
            
            endDateInput.min = this.value;
        });
    }
    
    if (endDateInput) {
        endDateInput.min = minDate;
        
        endDateInput.addEventListener('change', function() {
            if (startDateInput.value) {
                const startDate = new Date(startDateInput.value);
                const endDate = new Date(this.value);
                if (endDate <= startDate) {
                    this.setCustomValidity('End date must be after start date');
                    this.reportValidity();
                } else {
                    this.setCustomValidity('');
                }
            }
        });
    }
    
    if (registrationDeadlineInput) {
        registrationDeadlineInput.min = minDate;
        
        registrationDeadlineInput.addEventListener('change', function() {
            if (startDateInput.value) {
                const startDate = new Date(startDateInput.value);
                const regDeadline = new Date(this.value);
                if (regDeadline >= startDate) {
                    this.setCustomValidity('Registration deadline must be before start date');
                    this.reportValidity();
                } else {
                    this.setCustomValidity('');
                }
            }
        });
    }
}

function openEventModal(eventId = null) {
    const modal = document.getElementById('eventModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitText = document.getElementById('submitText');
    const form = document.getElementById('eventForm');
    
    if (eventId) {
        modalTitle.textContent = 'Edit Event';
        submitText.textContent = 'Update Event';
        populateFormWithEventData(eventId);
    } else {
        modalTitle.textContent = 'Create Event';
        submitText.textContent = 'Create Event';
        form.reset();
        document.getElementById('category').value = 'general';
        document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('excerptCount').textContent = '0';
        document.getElementById('registrationFields').style.display = 'none';
        document.getElementById('points_reward').value = '0';
        setupDateValidation();
    }
    
    modal.classList.add('active');
}

function closeEventModal() {
    document.getElementById('eventModal').classList.remove('active');
}

function populateFormWithEventData(eventId) {
    const event = eventsData.find(e => e.id == eventId);
    
    if (!event) return;
    
    document.getElementById('eventId').value = event.id;
    document.getElementById('title').value = event.title;
    document.getElementById('category').value = event.category;
    document.getElementById('excerpt').value = event.excerpt || '';
    document.getElementById('description').value = event.description;
    document.getElementById('location').value = event.location;
    document.getElementById('requires_registration').checked = event.requires_registration;
    document.getElementById('is_active').checked = event.is_active;
    document.getElementById('points_reward').value = event.points_reward;
    
    const startDateInput = document.getElementById('start_date');
    const endDateInput = document.getElementById('end_date');
    const registrationDeadlineInput = document.getElementById('registration_deadline');
    
    if (event.start_date) {
        const startDate = new Date(event.start_date);
        startDate.setMinutes(startDate.getMinutes() - startDate.getTimezoneOffset());
        startDateInput.value = startDate.toISOString().slice(0, 16);
    }
    
    if (event.end_date) {
        const endDate = new Date(event.end_date);
        endDate.setMinutes(endDate.getMinutes() - endDate.getTimezoneOffset());
        endDateInput.value = endDate.toISOString().slice(0, 16);
    }
    
    if (event.registration_deadline) {
        const regDeadline = new Date(event.registration_deadline);
        regDeadline.setMinutes(regDeadline.getMinutes() - regDeadline.getTimezoneOffset());
        registrationDeadlineInput.value = regDeadline.toISOString().slice(0, 16);
    }
    
    if (event.maximum_participants) {
        document.getElementById('maximum_participants').value = event.maximum_participants;
    }
    
    document.getElementById('registrationFields').style.display = event.requires_registration ? 'grid' : 'none';
    
    document.getElementById('excerptCount').textContent = event.excerpt ? event.excerpt.length : 0;
    
    const imagePreview = document.getElementById('imagePreview');
    if (event.image) {
        imagePreview.innerHTML = `<img src="${event.image}" alt="Event Image">`;
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
    const eventId = formData.get('id');
    const isEdit = !!eventId;
    
    const startDate = new Date(formData.get('start_date'));
    const endDate = new Date(formData.get('end_date'));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    if (startDate < now) {
        showMessage('Start date cannot be in the past.', 'error');
        return;
    }
    
    if (endDate <= startDate) {
        showMessage('End date must be after start date.', 'error');
        return;
    }
    
    const requiresRegistration = formData.get('requires_registration') === 'on';
    if (requiresRegistration) {
        const registrationDeadline = formData.get('registration_deadline');
        if (registrationDeadline) {
            const regDeadline = new Date(registrationDeadline);
            if (regDeadline >= startDate) {
                showMessage('Registration deadline must be before start date.', 'error');
                return;
            }
        }
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    
    const url = isEdit 
        ? `/server/events/${eventId}/update/` 
        : '/server/events/create/';
    
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
            closeEventModal();
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

function deleteEvent(eventId) {
    fetch(`/server/events/${eventId}/delete/`, {
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
    const existingMessage = document.querySelector('.event-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = `event-message message-${type}`;
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