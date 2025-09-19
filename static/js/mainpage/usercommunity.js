document.addEventListener('DOMContentLoaded', function() {
    const createPostBtn = document.getElementById('createPostBtn');
    const postInput = document.getElementById('postInput');
    const postModal = document.getElementById('createPostModal');
    const closeModal = document.querySelector('.close');
    const postForm = document.getElementById('postForm');
    const likeButtons = document.querySelectorAll('.like-btn');
    const commentInputs = document.querySelectorAll('.comment-input-field');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
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
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            postModal.style.display = 'none';
            document.getElementById('postEditor').value = '';
            document.getElementById('mediaPreview').innerHTML = '';
            document.getElementById('imageUpload').value = '';
        });
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === postModal) {
            postModal.style.display = 'none';
            document.getElementById('postEditor').value = '';
            document.getElementById('mediaPreview').innerHTML = '';
            document.getElementById('imageUpload').value = '';
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
    const closeLogoutModal = document.querySelector('.close-logout'); 

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (logoutModal) logoutModal.style.display = 'block';
        });
    }

    if (closeLogoutModal) {
        closeLogoutModal.addEventListener('click', function() {
            if (logoutModal) logoutModal.style.display = 'none';
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
});
