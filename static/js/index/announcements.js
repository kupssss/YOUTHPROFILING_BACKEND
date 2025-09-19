document.addEventListener('DOMContentLoaded', function() {
    const loginModal = document.getElementById('loginModal');
    const loginModalMessage = document.getElementById('loginModalMessage');
    const closeModalBtn = document.querySelector('.login-modal-close');
    const cancelModalBtn = document.getElementById('loginModalCancel');
    const requireLoginLinks = document.querySelectorAll('.require-login');

    function showLoginModal(message) {
        if (message) {
            loginModalMessage.textContent = message;
        }
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
        if (event.target === loginModal) {
            hideLoginModal();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && loginModal.style.display === 'block') {
            hideLoginModal();
        }
    });

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

    const viewButtons = document.querySelectorAll('.view-btn');
    const updateCards = document.querySelectorAll('.update-card');
    const upcomingEvents = document.querySelector('.upcoming-events');

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const viewValue = button.getAttribute('data-view');
            if (viewValue === 'all') {
                updateCards.forEach(card => card.style.display = 'block');
                if (upcomingEvents) upcomingEvents.style.display = 'block';
            } else if (viewValue === 'announcements') {
                updateCards.forEach(card => {
                    card.style.display = card.classList.contains('announcement') ? 'block' : 'none';
                });
                if (upcomingEvents) upcomingEvents.style.display = 'none';
            } else if (viewValue === 'events') {
                updateCards.forEach(card => {
                    card.style.display = card.classList.contains('event') ? 'block' : 'none';
                });
                if (upcomingEvents) upcomingEvents.style.display = 'block';
            }
        });
    });

    const categorySelect = document.getElementById('category');
    const timeframeSelect = document.getElementById('timeframe');

    categorySelect.addEventListener('change', filterUpdates);
    timeframeSelect.addEventListener('change', filterUpdates);

    function filterUpdates() {
        const categoryValue = categorySelect.value;
        const timeframeValue = timeframeSelect.value;
        updateCards.forEach(card => {
            let showCard = true;
            if (categoryValue !== 'all' && !card.classList.contains(categoryValue)) showCard = false;
            if (timeframeValue !== 'all' && Math.random() > 0.5) showCard = false;
            card.style.display = showCard ? 'block' : 'none';
        });
    }

    const searchInput = document.querySelector('.search-bar input');
    const searchButton = document.querySelector('.search-bar button');

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        updateCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const excerpt = card.querySelector('.update-excerpt').textContent.toLowerCase();
            card.style.display = (title.includes(searchTerm) || excerpt.includes(searchTerm)) ? 'block' : 'none';
        });
    }

    const saveButtons = document.querySelectorAll('.update-save');
    saveButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('saved');
            this.innerHTML = this.classList.contains('saved') ? '<i class="fas fa-bookmark"></i>' : '<i class="far fa-bookmark"></i>';
            const feedback = document.createElement('div');
            feedback.textContent = this.classList.contains('saved') ? 'Saved to your bookmarks' : 'Removed from bookmarks';
            feedback.style.position = 'fixed';
            feedback.style.bottom = '20px';
            feedback.style.right = '20px';
            feedback.style.background = '#1E40AF';
            feedback.style.color = 'white';
            feedback.style.padding = '10px 20px';
            feedback.style.borderRadius = '8px';
            feedback.style.zIndex = '1000';
            feedback.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            document.body.appendChild(feedback);
            setTimeout(() => {
                feedback.style.opacity = '0';
                feedback.style.transition = 'opacity 0.5s ease';
                setTimeout(() => feedback.remove(), 500);
            }, 2000);
        });
    });

    const eventActions = document.querySelectorAll('.event-action');
    eventActions.forEach(button => {
        button.addEventListener('click', function() {
            const eventTitle = this.closest('.event-highlight').querySelector('h3').textContent;
            alert(`Registration for "${eventTitle}" would open in a real application.`);
        });
    });

    const calendarNavs = document.querySelectorAll('.calendar-nav');
    calendarNavs.forEach(button => {
        button.addEventListener('click', function() {
            alert('Calendar navigation would work in a real application with proper date handling.');
        });
    });

    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach(day => {
        day.addEventListener('click', function() {
            if (this.classList.contains('event-day')) {
                alert(`You clicked on a day with events. In a real application, this would show event details.`);
            }
        });
    });

    const newsletterForm = document.querySelector('.newsletter-form');
    const emailInput = newsletterForm.querySelector('input[type="email"]');
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateEmail(emailInput.value)) {
            alert('Thank you for subscribing to our newsletter!');
            emailInput.value = '';
        } else {
            alert('Please enter a valid email address.');
        }
    });

    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function animateOnScroll() {
        const elements = document.querySelectorAll('.update-card, .event-highlight');
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            if (elementPosition < screenPosition) {
                element.style.opacity = 1;
                element.style.transform = 'translateY(0)';
            }
        });
    }

    const animatedElements = document.querySelectorAll('.update-card, .event-highlight');
    animatedElements.forEach(element => {
        element.style.opacity = 0;
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();

    const pageButtons = document.querySelectorAll('.page-btn');
    pageButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('disabled')) return;
            pageButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            simulatePageLoad();
        });
    });

    function simulatePageLoad() {
        const container = document.querySelector('.updates-list');
        container.style.opacity = '0.5';
        setTimeout(() => container.style.opacity = '1', 300);
    }
});
