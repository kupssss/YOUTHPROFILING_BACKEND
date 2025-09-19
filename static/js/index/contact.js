const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
    document.body.style.overflow = navMenu.classList.contains("active") ? "hidden" : "auto";
});

document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
    document.body.style.overflow = "auto";
}));

document.querySelectorAll(".dropbtn").forEach(btn => {
    btn.addEventListener("click", function(e) {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            this.parentElement.classList.toggle("active");
        }
    });
});

function initMap() {
    const mambuganCoords = [14.6255, 121.1750];
    const map = L.map('contact-map').setView(mambuganCoords, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.marker(mambuganCoords)
        .addTo(map)
        .bindPopup('<strong>SK Mambugan Office</strong><br>Ruhat 3 Lower Barangay Mambugan, Antipolo City')
        .openPopup();
    L.circle(mambuganCoords, {
        color: '#1E40AF',
        fillColor: '#3B82F6',
        fillOpacity: 0.2,
        radius: 1000
    }).addTo(map);
}

document.addEventListener('DOMContentLoaded', function() {
    initMap();

    const loginModal = document.getElementById('loginModal');
    const loginModalMessage = document.getElementById('loginModalMessage');
    const closeModalBtn = document.querySelector('.login-modal-close');
    const cancelModalBtn = document.getElementById('loginModalCancel');
    const requireLoginLinks = document.querySelectorAll('.require-login');

    function showLoginModal(message) {
        if (message) loginModalMessage.textContent = message;
        loginModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    function hideLoginModal() {
        loginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    requireLoginLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const message = this.getAttribute('data-message') || 'You need to be logged in to access this content.';
            showLoginModal(message);
            setTimeout(() => {
                if (loginModal.style.display === 'block') {
                    window.location.href = "{% url 'login' %}";
                }
            }, 5000);
        });
    });

    closeModalBtn.addEventListener('click', hideLoginModal);
    cancelModalBtn.addEventListener('click', hideLoginModal);
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) hideLoginModal();
    });
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && loginModal.style.display === 'block') hideLoginModal();
    });

    const animatedElements = document.querySelectorAll('.info-card, .contact-form-container, .service-card, .faq-item');
    animatedElements.forEach(element => {
        element.style.opacity = 0;
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    function animateOnScroll() {
        animatedElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            if (elementPosition < screenPosition) {
                element.style.opacity = 1;
                element.style.transform = 'translateY(0)';
            }
        });
    }

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();

    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            question.parentElement.classList.toggle('active');
        });
    });

    const contactForm = document.querySelector('.contact-form');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });

    const serviceButtons = document.querySelectorAll('.btn-service');
    const modal = document.getElementById('serviceModal');
    const closeModal = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modalTitle');
    const serviceForm = document.getElementById('serviceForm');
    const urgencyField = document.getElementById('urgencyField');

    serviceButtons.forEach(button => {
        button.addEventListener('click', function() {
            const serviceType = this.getAttribute('data-service');
            if (serviceType === 'complaint') {
                modalTitle.textContent = 'File a Complaint';
                urgencyField.style.display = 'block';
            } else {
                modalTitle.textContent = 'Make a Suggestion';
                urgencyField.style.display = 'none';
            }
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });

    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    serviceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const serviceType = modalTitle.textContent.includes('Complaint') ? 'complaint' : 'suggestion';
        const formData = {
            type: serviceType,
            name: document.getElementById('serviceName').value,
            contact: document.getElementById('serviceContact').value,
            details: document.getElementById('serviceDetails').value,
            urgency: serviceType === 'complaint' ? document.getElementById('serviceUrgency').value : null,
            anonymous: document.getElementById('anonymousSubmit').checked
        };
        if (formData.anonymous) {
            formData.name = 'Anonymous';
            formData.contact = 'Not provided';
        }
        alert(`Thank you for your ${serviceType}. We appreciate your feedback!`);
        serviceForm.reset();
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});
