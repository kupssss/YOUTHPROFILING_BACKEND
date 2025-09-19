document.addEventListener('DOMContentLoaded', function () {
    // ===========================
    // NAVIGATION (Hamburger Menu)
    // ===========================
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");

    if (hamburger && navMenu) {
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
            btn.addEventListener("click", function (e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    this.parentElement.classList.toggle("active");
                }
            });
        });
    }

    // ===========================
    // ANIMATION ON SCROLL
    // ===========================
    function animateOnScroll() {
        const elements = document.querySelectorAll('.service-card, .announcement-card, .event-card, .stat-item');
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            if (elementPosition < screenPosition) {
                element.style.opacity = 1;
                element.style.transform = 'translateY(0)';
            }
        });
    }

    const animatedElements = document.querySelectorAll('.service-card, .announcement-card, .event-card, .stat-item');
    animatedElements.forEach(element => {
        element.style.opacity = 0;
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();

    // ===========================
    // COUNTER ANIMATION
    // ===========================
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-item h3');
        const speed = 200;
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText.replace('+', '').replace('%', '');
            const increment = Math.ceil(target / speed);

            if (count < target) {
                if (counter.innerText.includes('%')) {
                    counter.innerText = Math.min(count + increment, target) + '%';
                } else {
                    counter.innerText = Math.min(count + increment, target) + '+';
                }
                setTimeout(animateCounters, 1);
            }
        });
    }

    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    }

    // ===========================
    // SMOOTH SCROLL FOR ANCHORS
    // ===========================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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

    // ===========================
    // FORM VALIDATION
    // ===========================
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            const inputs = this.querySelectorAll('input[required], textarea[required]');
            let valid = true;

            inputs.forEach(input => {
                if (!input.value.trim()) {
                    valid = false;
                    input.style.borderColor = 'red';
                    if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('error-message')) {
                        const errorMsg = document.createElement('div');
                        errorMsg.className = 'error-message';
                        errorMsg.style.color = 'red';
                        errorMsg.style.fontSize = '0.8rem';
                        errorMsg.style.marginTop = '5px';
                        errorMsg.textContent = 'This field is required';
                        input.parentNode.insertBefore(errorMsg, input.nextSibling);
                    }
                } else {
                    input.style.borderColor = '';
                    if (input.nextElementSibling && input.nextElementSibling.classList.contains('error-message')) {
                        input.nextElementSibling.remove();
                    }
                }
            });

            if (!valid) e.preventDefault();
        });
    });

    // ===========================
    // HERO PARALLAX SCROLL
    // ===========================
    window.addEventListener('scroll', function () {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        if (hero) {
            const rate = scrolled * -0.5;
            hero.style.backgroundPosition = `center ${rate}px`;
        }
    });

    // ===========================
    // LOGIN MODAL HANDLING
    // ===========================
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
        link.addEventListener('click', function (e) {
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

    if (closeModalBtn) closeModalBtn.addEventListener('click', hideLoginModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', hideLoginModal);

    window.addEventListener('click', function (event) {
        if (event.target === loginModal) hideLoginModal();
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && loginModal.style.display === 'block') hideLoginModal();
    });

    setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
    }, 100);
});
