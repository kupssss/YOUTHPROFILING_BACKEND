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
            
            if (!hasAccess && !this.classList.contains('active')) {
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
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    const detailsBtns = document.querySelectorAll('.details-btn');
    const reasonModal = document.getElementById('reasonModal');
    const failureReason = document.getElementById('failureReason');
    const closeReasonModal = document.getElementById('closeReasonModal');
    const modalClose = document.querySelector('.modal-close');
    
    detailsBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const reason = this.getAttribute('data-reason');
            failureReason.textContent = reason;
            reasonModal.style.display = 'flex';
        });
    });
    
    if (closeReasonModal) {
        closeReasonModal.addEventListener('click', function() {
            reasonModal.style.display = 'none';
        });
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            reasonModal.style.display = 'none';
        });
    }
    
    reasonModal.addEventListener('click', function(e) {
        if (e.target === reasonModal) {
            reasonModal.style.display = 'none';
        }
    });
    
    const refreshBtn = document.getElementById('refreshLogs');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            this.classList.add('loading');
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
            
            setTimeout(() => {
                location.reload();
            }, 1000);
        });
    }
    
    const userLogsSearch = document.getElementById('userLogsSearch');
    const auditLogsSearch = document.getElementById('auditLogsSearch');
    
    function setupSearch(input, rowsSelector) {
        if (input) {
            input.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const rows = document.querySelectorAll(rowsSelector);
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(searchTerm) ? '' : 'none';
                });
            });
        }
    }
    
    setupSearch(userLogsSearch, '#user-logs-tab .log-row');
    setupSearch(auditLogsSearch, '#audit-logs-tab .log-row');
    
    function initAnimations() {
        const statCards = document.querySelectorAll('.log-stat-card');
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
    
    function autoRefreshLogs() {
        setTimeout(() => {
            const refreshBtn = document.getElementById('refreshLogs');
            if (refreshBtn && !refreshBtn.classList.contains('loading')) {
                refreshBtn.click();
            }
        }, 30000);
    }
    
    initAnimations();
    autoRefreshLogs();
    
    const enableAlerts = document.getElementById('enableAlerts');
    const cleanupLogs = document.getElementById('cleanupLogs');
    
    if (enableAlerts) {
        enableAlerts.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Configuring...';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Alerts Enabled';
                this.style.background = 'rgba(74, 222, 128, 0.2)';
                this.style.color = '#4ADE80';
                this.style.borderColor = 'rgba(74, 222, 128, 0.3)';
            }, 1500);
        });
    }
    
    if (cleanupLogs) {
        cleanupLogs.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cleaning...';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Cleanup Complete';
                this.style.background = 'rgba(74, 222, 128, 0.2)';
                this.style.color = '#4ADE80';
                this.style.borderColor = 'rgba(74, 222, 128, 0.3)';
            }, 2000);
        });
    }
    
    const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
    if (mobileSidebarToggle) {
        mobileSidebarToggle.style.display = 'block';
        mobileSidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
});