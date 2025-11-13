function openAddAdminModal() {
    addAdminModal.style.display = 'flex';
    document.getElementById('addAdminForm').reset();
    document.querySelector('.custom-password-field').style.display = 'none';
    
    setTimeout(() => {
        const modalBody = addAdminModal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.scrollTop = 0;
        }
    }, 100);
}

function closeAddAdminModal() {
    addAdminModal.style.display = 'none';
}

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
    const closeUnauthorizedModal = document.getElementById('closeUnauthorizedModal');
    
    systemSettingsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const hasAccess = this.getAttribute('data-has-access') === 'true';
            
            if (!hasAccess && !this.classList.contains('active')) {
                e.preventDefault();
                unauthorizedModal.style.display = 'flex';
            }
        });
    });
    
    if (closeUnauthorizedModal && unauthorizedModal) {
        closeUnauthorizedModal.addEventListener('click', function() {
            unauthorizedModal.style.display = 'none';
        });
        
        unauthorizedModal.addEventListener('click', function(e) {
            if (e.target === unauthorizedModal) {
                unauthorizedModal.style.display = 'none';
            }
        });
    }
    
    const addAdminBtn = document.getElementById('addAdminBtn');
    const quickAddAdmin = document.getElementById('quickAddAdmin');
    const addAdminModal = document.getElementById('addAdminModal');
    const cancelAddAdmin = document.getElementById('cancelAddAdmin');
    const submitAddAdmin = document.getElementById('submitAddAdmin');
    const modalClose = document.querySelectorAll('.modal-close');
    const successModal = document.getElementById('successModal');
    const closeSuccessModal = document.getElementById('closeSuccessModal');
    const viewAdminModal = document.getElementById('viewAdminModal');
    const editAdminModal = document.getElementById('editAdminModal');
    const viewBtns = document.querySelectorAll('.view-btn');
    const editBtns = document.querySelectorAll('.edit-btn');
    const toggleBtns = document.querySelectorAll('.deactivate-btn, .activate-btn');
    
    if (addAdminBtn) {
        addAdminBtn.addEventListener('click', openAddAdminModal);
    }
    
    if (quickAddAdmin && !quickAddAdmin.disabled) {
        quickAddAdmin.addEventListener('click', openAddAdminModal);
    }
    
    if (cancelAddAdmin) {
        cancelAddAdmin.addEventListener('click', closeAddAdminModal);
    }
    
    modalClose.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    addAdminModal.addEventListener('click', function(e) {
        if (e.target === addAdminModal) {
            closeAddAdminModal();
        }
    });
    
    successModal.addEventListener('click', function(e) {
        if (e.target === successModal) {
            successModal.style.display = 'none';
        }
    });
    
    if (closeSuccessModal) {
        closeSuccessModal.addEventListener('click', function() {
            successModal.style.display = 'none';
            location.reload();
        });
    }
    
    const passwordOptions = document.querySelectorAll('input[name="password_option"]');
    const customPasswordField = document.querySelector('.custom-password-field');
    
    passwordOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'custom') {
                customPasswordField.style.display = 'block';
            } else {
                customPasswordField.style.display = 'none';
            }
        });
    });
    
    if (submitAddAdmin) {
        submitAddAdmin.addEventListener('click', function() {
            const form = document.getElementById('addAdminForm');
            const formData = new FormData(form);
            
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            const passwordOption = document.querySelector('input[name="password_option"]:checked').value;
            if (passwordOption === 'custom') {
                const customPassword = document.getElementById('custom_password').value;
                if (!customPassword || customPassword.length < 8) {
                    alert('Custom password must be at least 8 characters long');
                    return;
                }
            }
            
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
            this.disabled = true;
            
            fetch('/server/admins/create/', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    closeAddAdminModal();
                    document.getElementById('successMessage').textContent = data.message;
                    successModal.style.display = 'flex';
                } else {
                    alert('Error: ' + data.error);
                    this.innerHTML = '<i class="fas fa-user-plus"></i> Create Administrator';
                    this.disabled = false;
                }
            })
            .catch(error => {
                alert('Error creating admin: ' + error);
                this.innerHTML = '<i class="fas fa-user-plus"></i> Create Administrator';
                this.disabled = false;
            });
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
    
    const adminsSearch = document.getElementById('adminsSearch');
    
    if (adminsSearch) {
        adminsSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('.admin-row');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
    
    const filterBtn = document.getElementById('adminsFilter');
    const filterMenu = document.getElementById('filterMenu');
    let currentFilter = 'all';
    
    if (filterBtn && filterMenu) {
        filterBtn.addEventListener('click', function() {
            filterMenu.classList.toggle('show');
        });
        
        document.addEventListener('click', function(e) {
            if (!filterBtn.contains(e.target) && !filterMenu.contains(e.target)) {
                filterMenu.classList.remove('show');
            }
        });
        
        const filterOptions = filterMenu.querySelectorAll('.filter-option');
        filterOptions.forEach(option => {
            option.addEventListener('click', function() {
                const role = this.getAttribute('data-role');
                currentFilter = role;
                
                filterOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                const rows = document.querySelectorAll('.admin-row');
                rows.forEach(row => {
                    if (role === 'all') {
                        row.style.display = '';
                    } else {
                        row.style.display = row.getAttribute('data-role') === role ? '' : 'none';
                    }
                });
                
                filterMenu.classList.remove('show');
            });
        });
    }
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const adminId = this.getAttribute('data-admin-id');
            const row = this.closest('.admin-row');
            
            const adminData = {
                name: row.querySelector('.admin-details strong').textContent,
                username: row.querySelector('.admin-details span').textContent.replace('@', ''),
                email: row.querySelector('.admin-details small').textContent,
                role: row.querySelector('.role-badge').textContent.trim(),
                department: row.querySelector('.department small')?.textContent || 'Not specified',
                contact: row.querySelector('.contact-item:nth-child(2) span')?.textContent || 'Not provided',
                status: row.querySelector('.status-badge').textContent.trim(),
                lastLogin: row.querySelector('.timestamp .date')?.textContent || 'Never',
                dateJoined: row.querySelector('.timestamp:last-child .date').textContent,
                permissions: Array.from(row.querySelectorAll('.perm-badge')).map(badge => badge.textContent).join(', ') || 'None'
            };
            
            const detailsHtml = `
                <div class="admin-details-modal">
                    <div class="detail-section">
                        <h4>Profile Information</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Full Name:</label>
                                <span>${adminData.name}</span>
                            </div>
                            <div class="detail-item">
                                <label>Username:</label>
                                <span>${adminData.username}</span>
                            </div>
                            <div class="detail-item">
                                <label>Email:</label>
                                <span>${adminData.email}</span>
                            </div>
                            <div class="detail-item">
                                <label>Role:</label>
                                <span>${adminData.role}</span>
                            </div>
                            <div class="detail-item">
                                <label>Department:</label>
                                <span>${adminData.department}</span>
                            </div>
                            <div class="detail-item">
                                <label>Contact:</label>
                                <span>${adminData.contact}</span>
                            </div>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h4>Account Status</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Status:</label>
                                <span class="status-${adminData.status.toLowerCase()}">${adminData.status}</span>
                            </div>
                            <div class="detail-item">
                                <label>Last Login:</label>
                                <span>${adminData.lastLogin}</span>
                            </div>
                            <div class="detail-item">
                                <label>Date Joined:</label>
                                <span>${adminData.dateJoined}</span>
                            </div>
                            <div class="detail-item">
                                <label>Permissions:</label>
                                <span>${adminData.permissions}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.getElementById('adminDetailsContent').innerHTML = detailsHtml;
            viewAdminModal.style.display = 'flex';
            
            setTimeout(() => {
                const modalBody = viewAdminModal.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.scrollTop = 0;
                }
            }, 100);
        });
    });
    
    document.getElementById('closeViewModal')?.addEventListener('click', function() {
        viewAdminModal.style.display = 'none';
    });
    
    viewAdminModal.addEventListener('click', function(e) {
        if (e.target === viewAdminModal) {
            viewAdminModal.style.display = 'none';
        }
    });
    
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const adminId = this.getAttribute('data-admin-id');
            const row = this.closest('.admin-row');
            
            const adminData = {
                name: row.querySelector('.admin-details strong').textContent,
                username: row.querySelector('.admin-details span').textContent.replace('@', ''),
                email: row.querySelector('.admin-details small').textContent,
                role: row.getAttribute('data-role'),
                department: row.querySelector('.department small')?.textContent || '',
                contact: row.querySelector('.contact-item:nth-child(2) span')?.textContent || '',
                can_manage_users: row.querySelector('.perm-badge:nth-child(1)') !== null,
                can_manage_announcements: row.querySelector('.perm-badge:nth-child(2)') !== null,
                can_manage_events: row.querySelector('.perm-badge:nth-child(3)') !== null,
                can_view_reports: row.querySelector('.perm-badge:nth-child(4)') !== null,
                can_manage_settings: row.querySelector('.perm-badge:nth-child(5)') !== null
            };
            
            const nameParts = adminData.name.split(' ');
            const firstName = nameParts[0];
            const lastName = nameParts[nameParts.length - 1];
            
            const editHtml = `
                <div class="form-grid">
                    <div class="form-group">
                        <label for="edit_username">Username</label>
                        <input type="text" id="edit_username" name="username" value="${adminData.username}" readonly>
                        <small>Username cannot be changed</small>
                    </div>
                    <div class="form-group">
                        <label for="edit_email">Email Address</label>
                        <input type="email" id="edit_email" name="email" value="${adminData.email}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit_first_name">First Name</label>
                        <input type="text" id="edit_first_name" name="first_name" value="${firstName}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit_last_name">Last Name</label>
                        <input type="text" id="edit_last_name" name="last_name" value="${lastName}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit_middle_name">Middle Name</label>
                        <input type="text" id="edit_middle_name" name="middle_name" placeholder="Optional middle name">
                    </div>
                    <div class="form-group">
                        <label for="edit_role">Admin Role</label>
                        <select id="edit_role" name="role" required class="styled-select">
                            <option value="super_admin" ${adminData.role === 'super_admin' ? 'selected' : ''}>Super Administrator</option>
                            <option value="sk_chairman" ${adminData.role === 'sk_chairman' ? 'selected' : ''}>SK Chairman</option>
                            <option value="sk_secretary" ${adminData.role === 'sk_secretary' ? 'selected' : ''}>SK Secretary</option>
                            <option value="sk_treasurer" ${adminData.role === 'sk_treasurer' ? 'selected' : ''}>SK Treasurer</option>
                            <option value="sk_councilor" ${adminData.role === 'sk_councilor' ? 'selected' : ''}>SK Councilor</option>
                            <option value="staff" ${adminData.role === 'staff' ? 'selected' : ''}>Staff Member</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit_department">Department</label>
                        <input type="text" id="edit_department" name="department" value="${adminData.department}">
                    </div>
                    <div class="form-group full-width">
                        <label for="edit_contact_number">Contact Number</label>
                        <input type="tel" id="edit_contact_number" name="contact_number" value="${adminData.contact}">
                    </div>
                    <div class="form-group full-width file-input-wrapper">
                        <label for="edit_profile_picture">Profile Picture</label>
                        <input type="file" id="edit_profile_picture" name="profile_picture" accept="image/*">
                        <small>Optional - Select new profile picture (JPG, PNG, GIF)</small>
                    </div>
                    <div class="form-group full-width">
                        <label>Permissions</label>
                        <div class="permissions-grid">
                            <label class="checkbox-label">
                                <input type="checkbox" name="can_manage_users" value="true" ${adminData.can_manage_users ? 'checked' : ''}>
                                <span class="checkmark"></span>
                                Manage Users
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="can_manage_announcements" value="true" ${adminData.can_manage_announcements ? 'checked' : ''}>
                                <span class="checkmark"></span>
                                Manage Announcements
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="can_manage_events" value="true" ${adminData.can_manage_events ? 'checked' : ''}>
                                <span class="checkmark"></span>
                                Manage Events
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="can_view_reports" value="true" ${adminData.can_view_reports ? 'checked' : ''}>
                                <span class="checkmark"></span>
                                View Reports
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="can_manage_settings" value="true" ${adminData.can_manage_settings ? 'checked' : ''}>
                                <span class="checkmark"></span>
                                Manage Settings
                            </label>
                        </div>
                    </div>
                    <div class="form-group full-width">
                        <label>Change Password (Optional)</label>
                        <input type="password" id="edit_password" name="password" placeholder="Leave blank to keep current password">
                        <small>Enter new password to change (minimum 8 characters)</small>
                    </div>
                </div>
            `;
            
            document.getElementById('editAdminContent').innerHTML = editHtml;
            editAdminModal.style.display = 'flex';
            
            setTimeout(() => {
                const modalBody = editAdminModal.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.scrollTop = 0;
                }
            }, 100);
        });
    });
    
    document.getElementById('cancelEditAdmin')?.addEventListener('click', function() {
        editAdminModal.style.display = 'none';
    });
    
    editAdminModal.addEventListener('click', function(e) {
        if (e.target === editAdminModal) {
            editAdminModal.style.display = 'none';
        }
    });
    
    document.getElementById('submitEditAdmin')?.addEventListener('click', function() {
        const form = document.getElementById('editAdminForm');
        const formData = new FormData(form);
        const adminId = document.querySelector('.edit-btn.active')?.getAttribute('data-admin-id');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        this.disabled = true;
        
        fetch(`/server/admins/update/${adminId}/`, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                editAdminModal.style.display = 'none';
                document.getElementById('successMessage').textContent = data.message;
                successModal.style.display = 'flex';
            } else {
                alert('Error: ' + data.error);
                this.innerHTML = '<i class="fas fa-save"></i> Save Changes';
                this.disabled = false;
            }
        })
        .catch(error => {
            alert('Error updating admin: ' + error);
            this.innerHTML = '<i class="fas fa-save"></i> Save Changes';
            this.disabled = false;
        });
    });
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const adminId = this.getAttribute('data-admin-id');
            const action = this.classList.contains('deactivate-btn') ? 'deactivate' : 'activate';
            const confirmMessage = action === 'deactivate' 
                ? 'Are you sure you want to deactivate this administrator?'
                : 'Are you sure you want to activate this administrator?';
            
            if (confirm(confirmMessage)) {
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                fetch(`/server/admins/${action}/${adminId}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Error: ' + data.error);
                        this.innerHTML = '<i class="fas fa-times"></i>';
                    }
                })
                .catch(error => {
                    alert('Error: ' + error);
                    this.innerHTML = '<i class="fas fa-times"></i>';
                });
            }
        });
    });
    
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    if (mobileSidebarToggle) {
        mobileSidebarToggle.style.display = 'block';
        mobileSidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    function initAnimations() {
        const statCards = document.querySelectorAll('.admin-stat-card');
        const actionCards = document.querySelectorAll('.action-card');
        
        statCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });
        
        actionCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = `opacity 0.5s ease ${0.3 + (index * 0.1)}s, transform 0.5s ease ${0.3 + (index * 0.1)}s`;
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 300 + (index * 100));
        });
    }
    
    initAnimations();
});