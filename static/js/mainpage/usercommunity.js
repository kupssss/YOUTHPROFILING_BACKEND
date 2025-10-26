document.addEventListener('DOMContentLoaded', function() {
    const createPostBtn = document.getElementById('createPostBtn');
    const firstPostBtn = document.getElementById('firstPostBtn');
    const postInput = document.getElementById('postInput');
    const postModal = document.getElementById('createPostModal');
    const closeModal = document.querySelectorAll('.close');
    const postForm = document.getElementById('postForm');
    const likeButtons = document.querySelectorAll('.like-btn:not(.disabled)');
    const commentInputs = document.querySelectorAll('.comment-input-field:not(.disabled)');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const optionsToggles = document.querySelectorAll('.options-toggle');
    const deletePostButtons = document.querySelectorAll('.delete-post');
    
    const autoShowModals = document.querySelectorAll('.modal.show-on-load');
    
    autoShowModals.forEach(modal => {
        modal.style.display = 'block';
        
        setTimeout(() => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        }, 5000);
    });

    if (postInput && createPostBtn) {
        postInput.addEventListener('click', function() {
            postModal.style.display = 'block';
            document.getElementById('postEditor').value = '';
            document.getElementById('mediaPreview').innerHTML = '';
            document.getElementById('imageUpload').value = '';
        });
        
        createPostBtn.addEventListener('click', function() {
            postModal.style.display = 'block';
            document.getElementById('postEditor').value = '';
            document.getElementById('mediaPreview').innerHTML = '';
            document.getElementById('imageUpload').value = '';
        });
    }
    
    if (firstPostBtn) {
        firstPostBtn.addEventListener('click', function() {
            postModal.style.display = 'block';
            document.getElementById('postEditor').value = '';
            document.getElementById('mediaPreview').innerHTML = '';
            document.getElementById('imageUpload').value = '';
        });
    }
    
    closeModal.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    closeModalButtons.forEach(btn => {
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
    
    if (postForm) {
        postForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const content = document.getElementById('postEditor').value.trim();
            
            if (!content && !formData.get('image')) {
                alert('Please write something or add an image to post.');
                return;
            }
            
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    postModal.style.display = 'none';
                    document.getElementById('postEditor').value = '';
                    document.getElementById('mediaPreview').innerHTML = '';
                    document.getElementById('imageUpload').value = '';
                    location.reload();
                } else {
                    alert('Error creating post: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while creating the post.');
            });
        });
    }
    
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            const icon = this.querySelector('i');
            
            fetch(`/community/posts/${postId}/like/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const likeCount = this.closest('.post-card').querySelector('.reaction-count');
                    likeCount.textContent = data.like_count;
                    
                    if (data.liked) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                        this.classList.add('liked');
                        this.querySelector('span').textContent = 'Liked';
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                        this.classList.remove('liked');
                        this.querySelector('span').textContent = 'Like';
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        });
    });

    commentInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const postId = this.getAttribute('data-post-id');
                const content = this.value.trim();
                
                if (content) {
                    fetch(`/community/posts/${postId}/comment/`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken'),
                        },
                        body: JSON.stringify({ content: content })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            this.value = '';
                            location.reload();
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });
                }
            }
        });
    });
    
    const imageUpload = document.getElementById('imageUpload');
    const mediaPreview = document.getElementById('mediaPreview');
    
    if (imageUpload) {
        imageUpload.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                
                if (!file.type.match('image.*')) {
                    alert('Please select an image file.');
                    this.value = '';
                    return;
                }
                
                if (file.size > 5 * 1024 * 1024) {
                    alert('Image size should be less than 5MB.');
                    this.value = '';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '300px';
                    img.style.objectFit = 'contain';
                    mediaPreview.innerHTML = '';
                    mediaPreview.appendChild(img);
                    
                    mediaPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                reader.readAsDataURL(file);
            } else {
                mediaPreview.innerHTML = '';
            }
        });
    }

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    optionsToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const menu = this.nextElementSibling;
            document.querySelectorAll('.options-menu').forEach(m => {
                if (m !== menu) {
                    m.style.opacity = '0';
                    m.style.visibility = 'hidden';
                }
            });
            menu.style.opacity = menu.style.opacity === '1' ? '0' : '1';
            menu.style.visibility = menu.style.visibility === 'visible' ? 'hidden' : 'visible';
        });
    });

    document.addEventListener('click', function() {
        document.querySelectorAll('.options-menu').forEach(menu => {
            menu.style.opacity = '0';
            menu.style.visibility = 'hidden';
        });
    });

    deletePostButtons.forEach(button => {
        button.addEventListener('click', function() {
            const postId = this.getAttribute('data-post-id');
            if (confirm('Are you sure you want to delete this post?')) {
                fetch(`/community/posts/${postId}/delete/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        location.reload();
                    } else {
                        alert('Error deleting post: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('An error occurred while deleting the post.');
                });
            }
        });
    });

    const pendingCommentInputs = document.querySelectorAll('.pending-comments .comment-input-field');
    
    pendingCommentInputs.forEach(input => {
        input.addEventListener('click', function(e) {
            e.preventDefault();
            alert('This feature will be available once your post is approved by the admin.');
        });
    });

    const pendingLikeButtons = document.querySelectorAll('.pending-actions .like-btn');
    
    pendingLikeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('This feature will be available once your post is approved by the admin.');
        });
    });

    const pendingCommentButtons = document.querySelectorAll('.pending-actions .comment-btn');
    
    pendingCommentButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('This feature will be available once your post is approved by the admin.');
        });
    });

    const pendingShareButtons = document.querySelectorAll('.pending-actions .share-btn');
    
    pendingShareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('This feature will be available once your post is approved by the admin.');
        });
    });

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

    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogout = document.getElementById('confirmLogout');
    const cancelLogout = document.getElementById('cancelLogout');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (logoutModal) logoutModal.style.display = 'block';
        });
    }

    if (cancelLogout) {
        cancelLogout.addEventListener('click', function() {
            if (logoutModal) logoutModal.style.display = 'none';
        });
    }

    if (confirmLogout) {
        confirmLogout.addEventListener('click', function() {
            window.location.href = "/logout/";
        });
    }

    window.addEventListener('click', function(event) {
        if (event.target === logoutModal) {
            logoutModal.style.display = 'none';
        }
    });

    const postCards = document.querySelectorAll('.post-card');
    postCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.12)';
        });
    });

    const sidebarCards = document.querySelectorAll('.sidebar-card');
    sidebarCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.12)';
        });
    });
});