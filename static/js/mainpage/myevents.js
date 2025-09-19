// static/js/mainpage/myevents.js
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const eventCards = document.querySelectorAll('.event-card');
    const searchInput = document.getElementById('eventsSearch');
    const eventModal = document.getElementById('eventModal');
    const modalClose = document.querySelector('.close');
    const eventActionButtons = document.querySelectorAll('.event-action-btn');
    const viewMoreBtn = document.querySelector('.view-more-btn');
    const pastEvents = document.querySelectorAll('.past');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            eventCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'flex';
                } else if (filter === 'upcoming') {
                    card.style.display = card.classList.contains('upcoming') ? 'flex' : 'none';
                } else if (filter === 'past') {
                    card.style.display = card.classList.contains('past') ? 'flex' : 'none';
                } else if (filter === 'registered') {
                    const status = card.getAttribute('data-status');
                    card.style.display = status === 'registered' || status === 'confirmed' ? 'flex' : 'none';
                }
            });
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            eventCards.forEach(card => {
                const title = card.querySelector('.event-title').textContent.toLowerCase();
                const description = card.querySelector('.event-description').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || description.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    eventActionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.event-card');
            const title = card.querySelector('.event-title').textContent;
            const date = card.querySelector('.date-month').textContent + ' ' + card.querySelector('.date-day').textContent;
            const time = card.querySelector('.event-time').textContent.replace('🕒 ', '');
            const location = card.querySelector('.event-location').textContent.replace('📍 ', '');
            const description = card.querySelector('.event-description').textContent;

            document.getElementById('modalEventTitle').textContent = title;
            document.getElementById('modalEventDate').textContent = date;
            document.getElementById('modalEventTime').textContent = time;
            document.getElementById('modalEventLocation').textContent = location;
            document.getElementById('modalEventDescription').textContent = description;

            eventModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', function() {
            eventModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === eventModal) {
            eventModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    const registerBtn = document.getElementById('modalRegisterBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');
    
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            alert('Successfully registered for this event!');
            eventModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to cancel your registration?')) {
                alert('Registration cancelled successfully.');
                eventModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    if (viewMoreBtn && pastEvents.length > 3) {
        for (let i = 3; i < pastEvents.length; i++) {
            pastEvents[i].style.display = 'none';
        }
        
        viewMoreBtn.addEventListener('click', function() {
            pastEvents.forEach(event => {
                event.style.display = 'flex';
            });
            this.style.display = 'none';
        });
    }

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    const animatedElements = document.querySelectorAll('.event-card, .achievement-card, .stat-card');
    
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
    
    animatedElements.forEach(element => {
        element.style.opacity = 0;
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
});