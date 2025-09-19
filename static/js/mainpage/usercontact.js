document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const contactForm = document.getElementById('contactForm');
    const serviceButtons = document.querySelectorAll('.btn-service');
    const modal = document.getElementById('serviceModal');
    const closeModal = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modalTitle');
    const serviceForm = document.getElementById('serviceForm');
    const urgencyField = document.getElementById('urgencyField');
    const cancelService = document.getElementById('cancelService');
    const saveDraftBtn = document.getElementById('save-draft');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogout = document.getElementById('confirmLogout');
    const cancelLogout = document.getElementById('cancelLogout');
    const closeButtons = document.querySelectorAll('.close');
    const faqItems = document.querySelectorAll('.faq-item');

    /* === NAV MENU === */
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    /* === CONTACT FORM === */
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const subject = document.getElementById('subject').value;
            formData.append('subject', subject);

            fetch('/contact/send-message/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCSRFToken()
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Message sent successfully! We will respond within 24 hours.');
                    contactForm.reset();
                    localStorage.removeItem('contactDraft');
                } else {
                    showNotification('Error sending message: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('An error occurred while sending your message.');
            });
        });
    }

    /* === SERVICE BUTTONS / MODAL === */
    if (serviceButtons) {
    serviceButtons.forEach(button => {
        button.addEventListener('click', function() {
            const serviceType = this.getAttribute('data-service');
            document.getElementById('serviceType').value = serviceType;

            if (serviceType === 'complaint') {
                modalTitle.textContent = 'File a Complaint';
                urgencyField.style.display = 'none';  
            } else if (serviceType === 'suggestion') {
                modalTitle.textContent = 'Make a Suggestion';
                urgencyField.style.display = 'none'; 
            } else if (serviceType === 'support') {
                window.location.href = '/support/tickets/';
                return;
            }

            modal.style.display = 'block';
        });
    });
}

    if (closeModal) {
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
            urgencyField.style.display = 'none'; 
        });
    }

    if (cancelService) {
        cancelService.addEventListener('click', function() {
            modal.style.display = 'none';
            urgencyField.style.display = 'none'; 
        });
    }

    /* === SERVICE FORM SUBMIT === */
    if (serviceForm) {
        serviceForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const serviceType = document.getElementById('serviceType').value;

            let url = '';
            if (serviceType === 'complaint') {
                url = '/contact/file-complaint/';
            } else if (serviceType === 'suggestion') {
                url = '/contact/make-suggestion/';
            }

            fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': getCSRFToken()
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification('Thank you for your submission! We will review it soon.');
                    serviceForm.reset();
                    modal.style.display = 'none';
                    urgencyField.style.display = 'none';
                    setTimeout(() => {
                        location.reload();
                    }, 2000);
                } else {
                    showNotification('Error submitting form: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('An error occurred while submitting your form.');
            });
        });
    }

    /* === SAVE DRAFT === */
    if (saveDraftBtn) {
        saveDraftBtn.addEventListener('click', function() {
            const message = document.getElementById('message').value;
            if (message.trim()) {
                localStorage.setItem('contactDraft', message);
                showNotification('Draft saved successfully!');
            } else {
                showNotification('No message to save as draft.');
            }
        });
    }

    const savedDraft = localStorage.getItem('contactDraft');
    if (savedDraft && document.getElementById('message')) {
        document.getElementById('message').value = savedDraft;
    }

    /* === LOGOUT MODAL === */
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logoutModal.style.display = 'block';
        });
    }

    if (closeButtons) {
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                logoutModal.style.display = 'none';
            });
        });
    }

    if (cancelLogout) {
        cancelLogout.addEventListener('click', function() {
            logoutModal.style.display = 'none';
        });
    }

    if (confirmLogout) {
        confirmLogout.addEventListener('click', function() {
            fetch('/logout/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken()
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    localStorage.removeItem('contactDraft');
                    window.location.href = data.redirect || '/';
                } else {
                    showNotification('Logout failed. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('An error occurred during logout.');
            });
        });
    }

    /* === FAQ TOGGLE === */
    if (faqItems) {
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', function() {
                item.classList.toggle('active');
            });
        });
    }

    initMap();

    /* === MODAL BACKDROP CLICK === */
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            urgencyField.style.display = 'none';
        }
        if (event.target === logoutModal) {
            logoutModal.style.display = 'none';
        }
    });
});

function initMap() {
    const mapContainer = document.getElementById('contact-map');
    if (!mapContainer) return;

    try {
        const map = L.map('contact-map').setView([14.6255, 121.1750], 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker([14.6255, 121.1750]).addTo(map)
            .bindPopup('<strong>SK Mambugan Office</strong><br>Ruhat 3 Lower Barangay Mambugan, Antipolo City')
            .openPopup();

        mapContainer.style.height = '400px';
    } catch (error) {
        console.error('Error initializing map:', error);
        mapContainer.innerHTML = '<div class="map-error"><i class="fas fa-map-marked-alt"></i><p>Map could not be loaded. <a href="https://www.google.com/maps/place/Mambugan,+Antipolo,+Rizal" target="_blank">View on Google Maps</a></p></div>';
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function getCSRFToken() {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
    return cookieValue || '';
}
