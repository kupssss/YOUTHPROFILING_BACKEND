document.addEventListener('DOMContentLoaded', function() {
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
    
    updateCurrentDate();
    
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.server-sidebar');
    const mainContent = document.querySelector('.server-main-content');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            
            const icon = sidebarToggle.querySelector('i');
            if (sidebar.classList.contains('collapsed')) {
                icon.className = 'fas fa-bars';
            } else {
                icon.className = 'fas fa-times';
            }
        });
    }
    
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdown = this.closest('.nav-dropdown');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            this.classList.toggle('active');
            menu.classList.toggle('show');
        });
    });
    
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
    
    const createBtn = document.getElementById('createEventBtn');
    const createFirstBtn = document.getElementById('createFirstEvent');
    const modal = document.getElementById('eventModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelForm = document.getElementById('cancelForm');
    
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            openEventModal();
        });
    }
    
    if (createFirstBtn) {
        createFirstBtn.addEventListener('click', function() {
            openEventModal();
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            closeEventModal();
        });
    }
    
    if (cancelForm) {
        cancelForm.addEventListener('click', function() {
            closeEventModal();
        });
    }
    
    const deleteModal = document.getElementById('deleteModal');
    const cancelDelete = document.getElementById('cancelDelete');
    const confirmDelete = document.getElementById('confirmDelete');
    
    if (cancelDelete) {
        cancelDelete.addEventListener('click', function() {
            deleteModal.classList.remove('active');
        });
    }
    
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
        if (e.target === modal) {
            closeEventModal();
        }
        if (e.target === deleteModal) {
            deleteModal.classList.remove('active');
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeEventModal();
            deleteModal.classList.remove('active');
        }
    });
    
    const requiresRegistration = document.getElementById('requires_registration');
    const registrationFields = document.getElementById('registrationFields');
    
    if (requiresRegistration && registrationFields) {
        requiresRegistration.addEventListener('change', function() {
            registrationFields.style.display = this.checked ? 'grid' : 'none';
        });
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
        }
        
        modal.classList.add('active');
    }
    
    function closeEventModal() {
        const modal = document.getElementById('eventModal');
        modal.classList.remove('active');
    }
    
    function populateFormWithEventData(eventId) {
        const event = eventsData.find(e => e.id == eventId);
        
        if (event) {
            document.getElementById('eventId').value = event.id;
            document.getElementById('title').value = event.title;
            document.getElementById('category').value = event.category;
            document.getElementById('excerpt').value = event.excerpt || '';
            document.getElementById('description').value = event.description;
            document.getElementById('location').value = event.location;
            document.getElementById('requires_registration').checked = event.requires_registration;
            document.getElementById('is_active').checked = event.is_active;
            document.getElementById('points_reward').value = event.points_reward;
            
            if (event.start_date) {
                document.getElementById('start_date').value = formatDateForInput(event.start_date);
            }
            if (event.end_date) {
                document.getElementById('end_date').value = formatDateForInput(event.end_date);
            }
            if (event.registration_deadline) {
                document.getElementById('registration_deadline').value = formatDateForInput(event.registration_deadline);
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
        }
    }
    
    function formatDateForInput(dateString) {
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16);
    }
    
    const form = document.getElementById('eventForm');
    const excerptTextarea = document.getElementById('excerpt');
    const imageInput = document.getElementById('image');
    const imagePreview = document.getElementById('imagePreview');
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    if (excerptTextarea) {
        excerptTextarea.addEventListener('input', function() {
            const count = this.value.length;
            document.getElementById('excerptCount').textContent = count;
            
            if (count > 300) {
                this.value = this.value.substring(0, 300);
                document.getElementById('excerptCount').textContent = '300';
                document.getElementById('excerptCount').style.color = '#f44336';
            } else {
                document.getElementById('excerptCount').style.color = '#A0AEC0';
            }
        });
    }
    
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
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
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const eventId = formData.get('id');
        const isEdit = !!eventId;
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        const url = isEdit 
            ? `/server/events/${eventId}/update/` 
            : '/server/events/create/';
        const method = 'POST';
        
        fetch(url, {
            method: method,
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
                
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
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
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
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
            `;
            document.head.appendChild(style);
        }
    }
    
    const statCards = document.querySelectorAll('.stat-card');
    const eventCards = document.querySelectorAll('.event-card');
    
    statCards.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
    
    eventCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ease ${0.3 + (index * 0.05)}s, transform 0.5s ease ${0.3 + (index * 0.05)}s`;
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300 + (index * 50));
    });
});