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
    
    const archivesSearch = document.getElementById('archivesSearch');
    
    if (archivesSearch) {
        archivesSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('.archive-row');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
    
    const viewDataBtns = document.querySelectorAll('.view-data-btn');
    const archiveDetailModal = document.getElementById('archiveDetailModal');
    const closeDetailModal = document.getElementById('closeDetailModal');
    const modalClose = document.querySelector('.modal-close');
    
    viewDataBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const archiveId = this.getAttribute('data-archive-id');
            
            document.getElementById('archiveUserId').textContent = archiveId;
            document.getElementById('detailOriginalId').textContent = 'Loading...';
            document.getElementById('detailArchivedBy').textContent = 'Loading...';
            document.getElementById('detailArchivedAt').textContent = 'Loading...';
            document.getElementById('detailDeletionReason').textContent = 'Loading...';
            document.getElementById('detailFilesList').innerHTML = '<div class="file-item"><i class="fas fa-spinner fa-spin"></i><span>Loading files...</span></div>';
            document.getElementById('userDataViewer').textContent = 'Loading user data...';
            
            archiveDetailModal.style.display = 'flex';
            
            setTimeout(() => {
                const row = this.closest('.archive-row');
                const originalId = row.querySelector('.user-id strong').textContent.replace('#', '');
                const archivedBy = row.querySelector('.archiver-info span').textContent;
                const archivedAt = row.querySelector('.timestamp .date').textContent + ' ' + row.querySelector('.timestamp .time').textContent;
                const deletionReason = row.querySelector('.deletion-reason') ? row.querySelector('.deletion-reason').textContent : 'No reason provided';
                
                document.getElementById('detailOriginalId').textContent = originalId;
                document.getElementById('detailArchivedBy').textContent = archivedBy;
                document.getElementById('detailArchivedAt').textContent = archivedAt;
                document.getElementById('detailDeletionReason').textContent = deletionReason;
                
                const filesList = document.getElementById('detailFilesList');
                filesList.innerHTML = '';
                
                const fileBadges = row.querySelectorAll('.file-badge');
                if (fileBadges.length > 0) {
                    fileBadges.forEach(badge => {
                        const fileItem = document.createElement('div');
                        fileItem.className = 'file-item';
                        fileItem.innerHTML = `<i class="${badge.querySelector('i').className}"></i><span>${badge.textContent.trim()}</span>`;
                        filesList.appendChild(fileItem);
                    });
                } else {
                    filesList.innerHTML = '<div class="file-item"><i class="fas fa-times-circle"></i><span>No files available</span></div>';
                }
                
                document.getElementById('userDataViewer').textContent = JSON.stringify({
                    user_id: originalId,
                    archived_by: archivedBy,
                    archived_at: archivedAt,
                    deletion_reason: deletionReason,
                    sample_data: {
                        username: "sample_user",
                        email: "user@example.com",
                        full_name: "Sample User Data"
                    }
                }, null, 2);
            }, 500);
        });
    });
    
    if (closeDetailModal) {
        closeDetailModal.addEventListener('click', function() {
            archiveDetailModal.style.display = 'none';
        });
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            archiveDetailModal.style.display = 'none';
        });
    }
    
    archiveDetailModal.addEventListener('click', function(e) {
        if (e.target === archiveDetailModal) {
            archiveDetailModal.style.display = 'none';
        }
    });
    
    const exportArchive = document.getElementById('exportArchive');
    if (exportArchive) {
        exportArchive.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Exported!';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-download"></i> Export This Archive';
                }, 2000);
            }, 1500);
        });
    }
    
    const advancedSearch = document.getElementById('advancedSearch');
    const bulkExport = document.getElementById('bulkExport');
    const cleanupArchives = document.getElementById('cleanupArchives');
    
    if (advancedSearch) {
        advancedSearch.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening...';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-search"></i> Open Search';
                alert('Advanced search feature would open here');
            }, 1000);
        });
    }
    
    if (bulkExport) {
        bulkExport.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Export Complete!';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-file-export"></i> Export All';
                }, 2000);
            }, 2000);
        });
    }
    
    if (cleanupArchives) {
        cleanupArchives.addEventListener('click', function() {
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cleaning...';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Cleanup Complete!';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-tools"></i> Run Cleanup';
                }, 2000);
            }, 1500);
        });
    }
    
    function initAnimations() {
        const statCards = document.querySelectorAll('.archive-stat-card');
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