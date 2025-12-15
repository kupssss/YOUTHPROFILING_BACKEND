document.addEventListener('DOMContentLoaded', function() {
    updateCurrentDate();
    setupSidebar();
    setupDropdowns();
    setupAccessControl();
    setupModal();
    setupForm();
    setupTabs();
    setupUserActions();
    setupSearchFilters();
    setupAnimations();
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
    document.addEventListener('click', function(e) {
        const modals = document.querySelectorAll('.modal.active');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
}

function setupForm() {
    const toggleEncryptionKey = document.getElementById('toggleEncryptionKey');
    const encryptionKeyInput = document.getElementById('encryptionKey');
    
    if (toggleEncryptionKey && encryptionKeyInput) {
        toggleEncryptionKey.addEventListener('click', function() {
            const type = encryptionKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
            encryptionKeyInput.setAttribute('type', type);
            const eyeIcon = this.querySelector('i');
            eyeIcon.className = type === 'text' ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    }
    
    const encryptionForm = document.getElementById('encryptionForm');
    
    if (encryptionForm) {
        encryptionForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const encryptionKey = document.getElementById('encryptionKey').value;
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
            submitBtn.disabled = true;
            
            try {
                const response = await fetch('/server/auth/verify-encryption-key/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken
                    },
                    body: JSON.stringify({ encryption_key: encryptionKey })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showMessage('Encryption key verified successfully!', 'success');
                    setTimeout(() => {
                        document.getElementById('encryptionModal').classList.remove('active');
                        document.querySelector('.management-content').classList.remove('hidden');
                        document.querySelector('.encryption-status').innerHTML = `
                            <i class="fas fa-lock-open"></i>
                            <span>Encryption: Verified</span>
                        `;
                        document.querySelector('.encryption-status').classList.add('verified');
                        initAnimations();
                    }, 1500);
                } else {
                    showMessage(data.message, 'error');
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                showMessage('Network error. Please try again.', 'error');
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }
        });
    }
}

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

function setupUserActions() {
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            showUserDetails(userId);
        });
    });
    
    document.querySelectorAll('.btn-verify').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            verifyUser(userId);
        });
    });
    
    document.querySelectorAll('.btn-waitlist').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            showWaitlistModal(userId);
        });
    });
    
    document.querySelectorAll('.btn-approve-waitlist').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            approveWaitlistUser(userId);
        });
    });
    
    document.querySelectorAll('.btn-needs-info').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            showNeedsInfoModal(userId);
        });
    });
    
    document.querySelectorAll('.btn-toggle').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.getAttribute('data-user-id');
            const isActive = this.getAttribute('data-active') === 'true';
            toggleUserStatus(userId, isActive);
        });
    });
    
    const closeUserModal = document.getElementById('closeUserModal');
    const userDetailModal = document.getElementById('userDetailModal');
    
    if (closeUserModal && userDetailModal) {
        closeUserModal.addEventListener('click', function() {
            userDetailModal.classList.remove('active');
        });
    }
    
    const closeWaitlistModal = document.getElementById('closeWaitlistModal');
    const cancelWaitlist = document.getElementById('cancelWaitlist');
    const waitlistUserForm = document.getElementById('waitlistUserForm');
    
    if (closeWaitlistModal) {
        closeWaitlistModal.addEventListener('click', function() {
            document.getElementById('waitlistUserModal').classList.remove('active');
            waitlistUserForm.reset();
        });
    }
    
    if (cancelWaitlist) {
        cancelWaitlist.addEventListener('click', function() {
            document.getElementById('waitlistUserModal').classList.remove('active');
            waitlistUserForm.reset();
        });
    }
    
    if (waitlistUserForm) {
        waitlistUserForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const userId = document.getElementById('waitlistUserId').value;
            const waitlistReason = document.getElementById('waitlistReason').value;
            const additionalMessage = document.getElementById('waitlistMessage').value;
            
            if (!waitlistReason) {
                showMessage('Please select a waitlist reason', 'error');
                return;
            }
            
            await waitlistUser(userId, waitlistReason, additionalMessage);
            document.getElementById('waitlistUserModal').classList.remove('active');
            waitlistUserForm.reset();
        });
    }
}

function setupSearchFilters() {
    const searchInput = document.getElementById('userSearch');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const activeTable = document.querySelector('.tab-pane.active table tbody');
            if (activeTable) {
                const rows = activeTable.querySelectorAll('tr');
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            }
        });
    }
    
    const statusFilter = document.getElementById('statusFilter');
    const verificationFilter = document.getElementById('verificationFilter');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    if (verificationFilter) {
        verificationFilter.addEventListener('change', applyFilters);
    }
}

function setupAnimations() {
    document.querySelectorAll('.stat-item').forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
    
    document.querySelectorAll('.users-table tbody tr').forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        row.style.transition = `opacity 0.5s ease ${0.3 + (index * 0.05)}s, transform 0.5s ease ${0.3 + (index * 0.05)}s`;
        setTimeout(() => {
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, 300 + (index * 50));
    });
}

function applyFilters() {
    const statusValue = document.getElementById('statusFilter')?.value || '';
    const verificationValue = document.getElementById('verificationFilter')?.value || '';
    const activeTable = document.querySelector('.tab-pane.active table tbody');
    
    if (activeTable) {
        const rows = activeTable.querySelectorAll('tr');
        rows.forEach(row => {
            let showRow = true;
            
            if (statusValue) {
                const statusBadge = row.querySelector('.status-badge');
                if (statusBadge) {
                    const status = statusBadge.textContent.toLowerCase();
                    if (statusValue === 'active' && !status.includes('active')) {
                        showRow = false;
                    } else if (statusValue === 'inactive' && !status.includes('inactive')) {
                        showRow = false;
                    }
                }
            }
            
            if (verificationValue && showRow) {
                const verificationBadge = row.querySelector('.verification-badge');
                if (verificationBadge) {
                    const verification = verificationBadge.textContent.toLowerCase();
                    if (verificationValue === 'verified' && !verification.includes('verified')) {
                        showRow = false;
                    } else if (verificationValue === 'pending' && !verification.includes('pending')) {
                        showRow = false;
                    }
                }
            }
            
            row.style.display = showRow ? '' : 'none';
        });
    }
}

function showWaitlistModal(userId) {
    document.getElementById('waitlistUserId').value = userId;
    document.getElementById('waitlistReason').value = '';
    document.getElementById('waitlistMessage').value = '';
    document.getElementById('waitlistUserModal').classList.add('active');
}

function showNeedsInfoModal(userId) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-question-circle"></i> Request More Information</h2>
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="needsInfoForm">
                    <input type="hidden" id="needsInfoUserId" name="user_id" value="${userId}">
                    <div class="form-group">
                        <label for="infoRequest">What information is needed?</label>
                        <div class="input-group">
                            <i class="fas fa-comment-alt"></i>
                            <textarea id="infoRequest" name="info_request" required 
                                      placeholder="Specify what additional information or documents are needed from the user..." 
                                      rows="4"></textarea>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" id="cancelNeedsInfo">
                            Cancel
                        </button>
                        <button type="submit" class="btn-primary">
                            <i class="fas fa-paper-plane"></i>
                            Send Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.modal-close').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.querySelector('#cancelNeedsInfo').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.querySelector('#needsInfoForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const userId = document.getElementById('needsInfoUserId').value;
        const infoRequest = document.getElementById('infoRequest').value;
        await requestMoreInfo(userId, infoRequest);
        modal.remove();
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

async function showUserDetails(userId) {
    const modal = document.getElementById('userDetailModal');
    const content = modal.querySelector('.user-detail-content');
    
    modal.classList.add('active');
    content.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <span>Loading user details...</span>
        </div>
    `;
    
    try {
        const response = await fetch(`/server/user-management/user/${userId}/details/`, {
            headers: { 'X-CSRFToken': csrfToken }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const user = data.user;
            content.innerHTML = `
                <div class="user-profile-header">
                    <div class="profile-header-content">
                        <div class="profile-avatar-large">
                            ${user.profile_picture ? 
                                `<img src="${user.profile_picture}" alt="${user.first_name} ${user.last_name}">` :
                                `<div class="avatar-initials-large">${user.first_name[0]}${user.last_name[0]}</div>`
                            }
                        </div>
                        <div class="profile-info-large">
                            <h2>${user.first_name} ${user.last_name}</h2>
                            <p>@${user.username} • ${user.registration_no}</p>
                            <div class="profile-status">
                                <span class="status-badge ${user.is_active ? 'active' : 'inactive'}">
                                    ${user.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span class="verification-badge ${user.is_admin_verified ? 'verified' : 'pending'}">
                                    ${user.is_admin_verified ? 'Verified' : 'Pending Verification'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="user-details-grid">
                    <div class="detail-section">
                        <h3><i class="fas fa-user-circle"></i> Personal Information</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Full Name</label>
                                <span>${user.first_name} ${user.middle_name || ''} ${user.last_name} ${user.suffix || ''}</span>
                            </div>
                            <div class="detail-item">
                                <label>Gender</label>
                                <span>${user.gender}</span>
                            </div>
                            <div class="detail-item">
                                <label>Birthdate</label>
                                <span>${user.birthdate}</span>
                            </div>
                            <div class="detail-item">
                                <label>Age</label>
                                <span>${user.age} years old</span>
                            </div>
                            <div class="detail-item">
                                <label>Civil Status</label>
                                <span>${user.civil_status}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3><i class="fas fa-address-card"></i> Contact Information</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Email</label>
                                <span>${user.email}</span>
                            </div>
                            <div class="detail-item">
                                <label>Phone</label>
                                <span>${user.contact_number}</span>
                            </div>
                            <div class="detail-item full-width">
                                <label>Address</label>
                                <span>${user.address}</span>
                            </div>
                            <div class="detail-item">
                                <label>Purok/Zone</label>
                                <span>${user.purok_zone}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3><i class="fas fa-graduation-cap"></i> Education & Employment</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Education Level</label>
                                <span>${user.education}</span>
                            </div>
                            <div class="detail-item">
                                <label>Youth Classification</label>
                                <span>${user.youth_classification}</span>
                            </div>
                            <div class="detail-item">
                                <label>Work Status</label>
                                <span>${user.work_status}</span>
                            </div>
                            <div class="detail-item">
                                <label>Age Group</label>
                                <span>${user.age_group}</span>
                            </div>
                            <div class="detail-item">
                                <label>SK Voter</label>
                                <span>${user.sk_voter ? 'Yes' : 'No'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3><i class="fas fa-id-card"></i> Identification</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>ID Type</label>
                                <span>${user.id_type}</span>
                            </div>
                            <div class="detail-item full-width">
                                <label>ID Picture</label>
                                ${user.id_picture ? 
                                    `<img src="${user.id_picture}" alt="ID Picture" class="id-image">` :
                                    '<span>No ID picture uploaded</span>'
                                }
                            </div>
                            <div class="detail-item full-width">
                                <label>Birth Certificate</label>
                                ${user.birth_certificate ? 
                                    `<a href="${user.birth_certificate}" target="_blank" class="document-link">
                                        <i class="fas fa-file-pdf"></i> View Birth Certificate
                                    </a>` :
                                    '<span>No birth certificate uploaded</span>'
                                }
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h3><i class="fas fa-info-circle"></i> Account Information</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Registration Date</label>
                                <span>${user.created_at}</span>
                            </div>
                            <div class="detail-item">
                                <label>Email Verified</label>
                                <span class="status-badge ${user.is_email_verified ? 'active' : 'inactive'}">
                                    ${user.is_email_verified ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div class="detail-item">
                                <label>Admin Verified</label>
                                <span class="status-badge ${user.is_admin_verified ? 'active' : 'inactive'}">
                                    ${user.is_admin_verified ? 'Yes' : 'No'}
                                </span>
                            </div>
                            <div class="detail-item">
                                <label>Account Status</label>
                                <span class="status-badge ${user.is_active ? 'active' : 'inactive'}">
                                    ${user.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error Loading User Details</h3>
                    <p>${data.message}</p>
                </div>
            `;
        }
    } catch (error) {
        content.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Network Error</h3>
                <p>Unable to load user details. Please check your connection and try again.</p>
            </div>
        `;
    }
}

async function verifyUser(userId) {
    const button = document.querySelector(`.btn-verify[data-user-id="${userId}"]`);
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    button.disabled = true;
    
    try {
        const response = await fetch(`/server/user-management/user/${userId}/verify/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(data.message, 'success');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showMessage(data.message, 'error');
            button.innerHTML = originalHTML;
            button.disabled = false;
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
        button.innerHTML = originalHTML;
        button.disabled = false;
    }
}

async function waitlistUser(userId, waitlistReason, additionalMessage) {
    const button = document.querySelector(`.btn-waitlist[data-user-id="${userId}"]`);
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Moving...';
    button.disabled = true;
    
    try {
        const response = await fetch(`/server/user-management/user/${userId}/reject/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                waitlist_reason: waitlistReason,
                additional_message: additionalMessage
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(data.message, 'success');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showMessage(data.message, 'error');
            button.innerHTML = originalHTML;
            button.disabled = false;
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
        button.innerHTML = originalHTML;
        button.disabled = false;
    }
}

async function approveWaitlistUser(userId) {
    const button = document.querySelector(`.btn-approve-waitlist[data-user-id="${userId}"]`);
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Approving...';
    button.disabled = true;
    
    try {
        const response = await fetch(`/server/user-management/user/${userId}/approve-waitlist/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(data.message, 'success');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showMessage(data.message, 'error');
            button.innerHTML = originalHTML;
            button.disabled = false;
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
        button.innerHTML = originalHTML;
        button.disabled = false;
    }
}

async function requestMoreInfo(userId, infoRequest) {
    const button = document.querySelector(`.btn-needs-info[data-user-id="${userId}"]`);
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    button.disabled = true;
    
    try {
        const response = await fetch(`/server/user-management/user/${userId}/request-info/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({ info_request: infoRequest })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(data.message, 'success');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showMessage(data.message, 'error');
            button.innerHTML = originalHTML;
            button.disabled = false;
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
        button.innerHTML = originalHTML;
        button.disabled = false;
    }
}

async function toggleUserStatus(userId, isActive) {
    const button = document.querySelector(`.btn-toggle[data-user-id="${userId}"]`);
    const originalHTML = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    button.disabled = true;
    
    try {
        const response = await fetch(`/server/user-management/user/${userId}/toggle-status/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(data.message, 'success');
            setTimeout(() => window.location.reload(), 1500);
        } else {
            showMessage(data.message, 'error');
            button.innerHTML = originalHTML;
            button.disabled = false;
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
        button.innerHTML = originalHTML;
        button.disabled = false;
    }
}

function showMessage(message, type) {
    const existingMessage = document.querySelector('.user-management-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageEl = document.createElement('div');
    messageEl.className = `user-management-message message-${type}`;
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
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: rgba(74, 222, 128, 0.9); color: white;' : 
          type === 'error' ? 'background: rgba(239, 68, 68, 0.9); color: white;' :
          'background: rgba(58, 123, 250, 0.9); color: white;'}
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

function initAnimations() {
    document.querySelectorAll('.stat-item').forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 + (index * 100));
    });
    
    document.querySelectorAll('.users-table tbody tr').forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        row.style.transition = `opacity 0.5s ease ${0.3 + (index * 0.05)}s, transform 0.5s ease ${0.3 + (index * 0.05)}s`;
        setTimeout(() => {
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
        }, 300 + (index * 50));
    });
}

if (encryptionVerified) {
    initAnimations();
}