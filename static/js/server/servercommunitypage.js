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
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
    
    const approveBtns = document.querySelectorAll('.approve-btn');
    const rejectBtns = document.querySelectorAll('.reject-btn');
    const viewBtns = document.querySelectorAll('.view-btn');
    
    const postDetailModal = document.getElementById('postDetailModal');
    const rejectPostModal = document.getElementById('rejectPostModal');
    const closeBtns = document.querySelectorAll('.close, .close-modal');
    
    approveBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            if (postId && postId !== 'null') {
                approvePost(postId);
            } else {
                alert('Invalid post ID');
            }
        });
    });
    
    rejectBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            if (postId && postId !== 'null') {
                document.getElementById('rejectPostId').value = postId;
                rejectPostModal.style.display = 'block';
            } else {
                alert('Invalid post ID');
            }
        });
    });
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id') || this.getAttribute('data-complaint-id') || this.getAttribute('data-suggestion-id') || this.getAttribute('data-message-id');
            if (postId && postId !== 'null') {
                viewPostDetails(postId);
            } else {
                alert('Invalid item ID');
            }
        });
    });
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    const rejectPostForm = document.getElementById('rejectPostForm');
    if (rejectPostForm) {
        rejectPostForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const postId = document.getElementById('rejectPostId').value;
            const reason = document.getElementById('rejectionReason').value;
            
            if (postId && postId !== 'null') {
                rejectPost(postId, reason);
            } else {
                alert('Invalid post ID');
            }
        });
    }
    
    const progressBtns = document.querySelectorAll('.progress-btn');
    const resolveBtns = document.querySelectorAll('.resolve-btn');
    const considerBtns = document.querySelectorAll('.consider-btn');
    const implementBtns = document.querySelectorAll('.implement-btn');
    const markReadBtns = document.querySelectorAll('.mark-read-btn');
    
    progressBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const complaintId = this.getAttribute('data-complaint-id');
            if (complaintId && complaintId !== 'null') {
                updateComplaintStatus(complaintId, 'in_progress');
            } else {
                alert('Invalid complaint ID');
            }
        });
    });
    
    resolveBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const complaintId = this.getAttribute('data-complaint-id');
            if (complaintId && complaintId !== 'null') {
                updateComplaintStatus(complaintId, 'resolved');
            } else {
                alert('Invalid complaint ID');
            }
        });
    });
    
    considerBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const suggestionId = this.getAttribute('data-suggestion-id');
            if (suggestionId && suggestionId !== 'null') {
                updateSuggestionStatus(suggestionId, 'under_consideration');
            } else {
                alert('Invalid suggestion ID');
            }
        });
    });
    
    implementBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const suggestionId = this.getAttribute('data-suggestion-id');
            if (suggestionId && suggestionId !== 'null') {
                updateSuggestionStatus(suggestionId, 'implemented');
            } else {
                alert('Invalid suggestion ID');
            }
        });
    });
    
    markReadBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const messageId = this.getAttribute('data-message-id');
            if (messageId && messageId !== 'null') {
                markMessageAsRead(messageId);
            } else {
                alert('Invalid message ID');
            }
        });
    });
    
    const filters = document.querySelectorAll('select[id$="Filter"]');
    filters.forEach(filter => {
        filter.addEventListener('change', function() {
            filterContent(this);
        });
    });
    
    function approvePost(postId) {
        fetch(communityData.apiEndpoints.approvePost, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ post_id: parseInt(postId) })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Error approving post: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while approving the post.');
        });
    }
    
    function rejectPost(postId, reason) {
        fetch(communityData.apiEndpoints.rejectPost, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ 
                post_id: parseInt(postId),
                reason: reason
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                rejectPostModal.style.display = 'none';
                document.getElementById('rejectionReason').value = '';
                location.reload();
            } else {
                alert('Error rejecting post: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while rejecting the post.');
        });
    }
    
    function viewPostDetails(postId) {
        fetch(`${communityData.apiEndpoints.getPostDetails}?post_id=${parseInt(postId)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayPostDetails(data.post);
            } else {
                alert('Error loading post details: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while loading post details.');
        });
    }
    
    function displayPostDetails(post) {
        const content = document.getElementById('postDetailContent');
        content.innerHTML = `
            <div class="post-detail">
                <div class="poster-info">
                    <div class="poster-avatar">
                        ${post.profile_picture ? 
                            `<img src="${post.profile_picture}" alt="${post.user_name}">` : 
                            `<div class="avatar-initials">${post.user_initials}</div>`
                        }
                    </div>
                    <div class="poster-details">
                        <h4>${post.user_name}</h4>
                        <p>${post.created_at}</p>
                    </div>
                </div>
                <div class="post-content">
                    <p>${post.content}</p>
                    ${post.image ? `<div class="post-image"><img src="${post.image}" alt="Post image"></div>` : ''}
                </div>
                <div class="post-stats">
                    <div class="stat">
                        <i class="fas fa-heart"></i>
                        <span>${post.like_count} Likes</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-comment"></i>
                        <span>${post.comment_count} Comments</span>
                    </div>
                </div>
                <div class="post-status">
                    <strong>Status:</strong> 
                    <span class="status-badge status-${post.status}">${post.status}</span>
                </div>
                ${post.rejection_reason ? `
                <div class="rejection-reason">
                    <strong>Rejection Reason:</strong>
                    <p>${post.rejection_reason}</p>
                </div>
                ` : ''}
            </div>
        `;
        postDetailModal.style.display = 'block';
    }
    
    function updateComplaintStatus(complaintId, status) {
        fetch(communityData.apiEndpoints.updateComplaint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ 
                complaint_id: parseInt(complaintId),
                status: status
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Error updating complaint: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while updating the complaint.');
        });
    }
    
    function updateSuggestionStatus(suggestionId, status) {
        fetch(communityData.apiEndpoints.updateSuggestion, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ 
                suggestion_id: parseInt(suggestionId),
                status: status
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Error updating suggestion: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while updating the suggestion.');
        });
    }
    
    function markMessageAsRead(messageId) {
        fetch(communityData.apiEndpoints.markMessageRead, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ message_id: parseInt(messageId) })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Error marking message as read: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while marking the message as read.');
        });
    }
    
    function filterContent(filterElement) {
        const filterValue = filterElement.value;
        const container = filterElement.closest('.tab-pane').querySelector('[class$="-container"]');
        const items = container.querySelectorAll('[class$="-card"]');
        
        items.forEach(item => {
            if (filterValue === 'all') {
                item.style.display = 'block';
            } else {
                const itemStatus = item.getAttribute('data-status');
                if (itemStatus === filterValue) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            }
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
    
    const postCards = document.querySelectorAll('.admin-post-card, .complaint-card, .suggestion-card, .message-card');
    postCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.25)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
        });
    });
});