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
    
    const createBtn = document.getElementById('createAnnouncementBtn');
    const createFirstBtn = document.getElementById('createFirstAnnouncement');
    const modal = document.getElementById('announcementModal');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelForm = document.getElementById('cancelForm');
    
    if (createBtn) {
        createBtn.addEventListener('click', function() {
            openAnnouncementModal();
        });
    }
    
    if (createFirstBtn) {
        createFirstBtn.addEventListener('click', function() {
            openAnnouncementModal();
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            closeAnnouncementModal();
        });
    }
    
    if (cancelForm) {
        cancelForm.addEventListener('click', function() {
            closeAnnouncementModal();
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
            const announcementId = deleteModal.getAttribute('data-id');
            if (announcementId) {
                deleteAnnouncement(announcementId);
            }
            deleteModal.classList.remove('active');
        });
    }
    
    document.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeAnnouncementModal();
        }
        if (e.target === deleteModal) {
            deleteModal.classList.remove('active');
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAnnouncementModal();
            deleteModal.classList.remove('active');
        }
    });
    
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
            document.getElementById('imagePreview').style.display = 'none';
            document.getElementById('excerptCount').textContent = '0';
        }
        
        modal.classList.add('active');
    }
    
    function closeAnnouncementModal() {
        const modal = document.getElementById('announcementModal');
        modal.classList.remove('active');
    }
    
    function populateFormWithAnnouncementData(announcementId) {
        const announcement = announcementsData.find(a => a.id == announcementId);
        
        if (announcement) {
            document.getElementById('announcementId').value = announcement.id;
            document.getElementById('title').value = announcement.title;
            document.getElementById('category').value = announcement.category;
            document.getElementById('excerpt').value = announcement.excerpt || '';
            document.getElementById('content').value = announcement.content;
            document.getElementById('location').value = announcement.location || '';
            document.getElementById('is_important').checked = announcement.is_important;
            document.getElementById('is_active').checked = announcement.is_active;
            
            if (announcement.effective_date) {
                document.getElementById('effective_date').value = formatDateForInput(announcement.effective_date);
            }
            if (announcement.deadline) {
                document.getElementById('deadline').value = formatDateForInput(announcement.deadline);
            }
            
            document.getElementById('excerptCount').textContent = announcement.excerpt ? announcement.excerpt.length : 0;
            
            const imagePreview = document.getElementById('imagePreview');
            if (announcement.image) {
                imagePreview.innerHTML = `<img src="${announcement.image}" alt="Announcement Image">`;
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
    
    const searchInput = document.getElementById('announcementSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const importanceFilter = document.getElementById('importanceFilter');
    const applyFiltersBtn = document.getElementById('applyFilters');
    const clearFiltersBtn = document.getElementById('clearFilters');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterAnnouncements);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterAnnouncements);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterAnnouncements);
    }
    
    if (importanceFilter) {
        importanceFilter.addEventListener('change', filterAnnouncements);
    }
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', filterAnnouncements);
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    function filterAnnouncements() {
        const searchTerm = document.getElementById('announcementSearch').value.toLowerCase();
        const category = document.getElementById('categoryFilter').value;
        const status = document.getElementById('statusFilter').value;
        const importance = document.getElementById('importanceFilter').value;
        
        const announcementCards = document.querySelectorAll('.announcement-card');
        
        announcementCards.forEach(card => {
            const title = card.querySelector('.announcement-title').textContent.toLowerCase();
            const excerpt = card.querySelector('.announcement-excerpt').textContent.toLowerCase();
            const cardCategory = card.getAttribute('data-category');
            const cardStatus = card.getAttribute('data-status');
            const cardImportant = card.getAttribute('data-important');
            
            const matchesSearch = title.includes(searchTerm) || excerpt.includes(searchTerm);
            const matchesCategory = !category || cardCategory === category;
            const matchesStatus = !status || cardStatus === status;
            const matchesImportance = !importance || cardImportant === importance;
            
            if (matchesSearch && matchesCategory && matchesStatus && matchesImportance) {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
    }
    
    function clearFilters() {
        document.getElementById('announcementSearch').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('importanceFilter').value = '';
        
        filterAnnouncements();
    }
    
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
        const announcementId = formData.get('id');
        const isEdit = !!announcementId;
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        const url = isEdit 
            ? `/server/announcements/${announcementId}/update/` 
            : '/server/announcements/create/';
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
                closeAnnouncementModal();
                
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
            const announcementId = this.getAttribute('data-id');
            openAnnouncementModal(announcementId);
        });
    });
    
    document.querySelectorAll('.action-btn.activate, .action-btn.deactivate').forEach(btn => {
        btn.addEventListener('click', function() {
            const announcementId = this.getAttribute('data-id');
            const isActivate = this.classList.contains('activate');
            toggleAnnouncementStatus(announcementId, isActivate);
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
    
    function toggleAnnouncementStatus(announcementId, activate) {
        const action = activate ? 'activate' : 'deactivate';
        
        fetch(`/server/announcements/${announcementId}/toggle-status/`, {
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

    function deleteAnnouncement(announcementId) {
        console.log(`Attempting to delete announcement with ID: ${announcementId}`);
        
        fetch(`/server/announcements/${announcementId}/delete/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data);
            if (data.success) {
                showMessage(data.message, 'success');
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showMessage(data.message || 'Unknown error occurred', 'error');
            }
        })
        .catch(error => {
            console.error('Error details:', error);
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
    const announcementCards = document.querySelectorAll('.announcement-card');
    
    statCards.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
    
    announcementCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ease ${0.3 + (index * 0.05)}s, transform 0.5s ease ${0.3 + (index * 0.05)}s`;
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 300 + (index * 50));
    });
});