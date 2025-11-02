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
    
    function openAddAdminModal() {
        addAdminModal.style.display = 'flex';
        document.getElementById('addAdminForm').reset();
    }
    
    function closeAddAdminModal() {
        addAdminModal.style.display = 'none';
    }
    
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
    
    if (submitAddAdmin) {
        submitAddAdmin.addEventListener('click', function() {
            const form = document.getElementById('addAdminForm');
            const formData = new FormData(form);
            
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
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
    
    const viewBtns = document.querySelectorAll('.view-btn');
    const editBtns = document.querySelectorAll('.edit-btn');
    const toggleBtns = document.querySelectorAll('.deactivate-btn, .activate-btn');
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const adminId = this.getAttribute('data-admin-id');
            alert('View details for admin ID: ' + adminId);
        });
    });
    
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const adminId = this.getAttribute('data-admin-id');
            alert('Edit admin ID: ' + adminId);
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
                setTimeout(() => {
                    if (action === 'deactivate') {
                        this.className = 'action-btn activate-btn';
                        this.innerHTML = '<i class="fas fa-check"></i>';
                    } else {
                        this.className = 'action-btn deactivate-btn';
                        this.innerHTML = '<i class="fas fa-times"></i>';
                    }
                    alert('Admin ' + action + 'd successfully!');
                }, 1000);
            }
        });
    });
    
    const managePermissions = document.getElementById('managePermissions');
    const viewAuditLogs = document.getElementById('viewAuditLogs');
    
    if (managePermissions) {
        managePermissions.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-sliders-h"></i> Manage Permissions';
                alert('Permission management feature would open here');
            }, 1000);
        });
    }
    
    if (viewAuditLogs) {
        viewAuditLogs.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-clipboard-list"></i> View Audit Logs';
                alert('Audit logs feature would open here');
            }, 1000);
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
    
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    if (mobileSidebarToggle) {
        mobileSidebarToggle.style.display = 'block';
        mobileSidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    initAnimations();
});