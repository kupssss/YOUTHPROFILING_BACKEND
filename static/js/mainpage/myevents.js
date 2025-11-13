document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const eventCards = document.querySelectorAll('.event-card');
    const searchInput = document.getElementById('eventsSearch');
    const eventModal = document.getElementById('eventModal');
    const evaluationModal = document.getElementById('evaluationModal');
    const modalClose = document.querySelectorAll('.close');
    const viewMoreBtn = document.querySelector('.view-more-btn');
    const pastEvents = document.querySelectorAll('.past');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const evaluationForm = document.getElementById('evaluationForm');
    const cancelEvaluationBtn = document.getElementById('cancelEvaluation');
    const closeSuccessModal = document.getElementById('closeSuccessModal');

    let currentRegistrationId = null;
    let currentEventId = null;

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('event-action-btn')) {
            e.preventDefault();
            const button = e.target;
            const card = button.closest('.event-card');
            const registrationId = card.getAttribute('data-registration-id');
            const status = card.getAttribute('data-status');
            const title = card.querySelector('.event-title').textContent;
            
            if (button.classList.contains('evaluate-btn')) {
                openEvaluationModal(registrationId, title);
            } else {
                openEventModal(registrationId, status);
            }
        }
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            eventCards.forEach(card => {
                card.style.display = 'flex';
                
                if (filter === 'upcoming') {
                    if (!card.classList.contains('upcoming')) {
                        card.style.display = 'none';
                    }
                } else if (filter === 'past') {
                    if (!card.classList.contains('past')) {
                        card.style.display = 'none';
                    }
                } else if (filter === 'attended') {
                    const status = card.getAttribute('data-status');
                    if (status !== 'attended') {
                        card.style.display = 'none';
                    }
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

    function openEventModal(registrationId, status) {
        currentRegistrationId = registrationId;
        
        const modalActions = document.getElementById('modalActions');
        modalActions.innerHTML = '<p>Loading...</p>';
        eventModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        fetch(`/api/event-registration/${registrationId}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    populateEventModal(data.registration, status);
                } else {
                    showError('Error loading event details: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Error loading event details. Please try again.');
            });
    }

    function populateEventModal(registration, status) {
        document.getElementById('modalEventTitle').textContent = registration.event_title;
        document.getElementById('modalEventDate').textContent = registration.event_date;
        document.getElementById('modalEventTime').textContent = registration.event_time;
        document.getElementById('modalEventLocation').textContent = registration.event_location;
        document.getElementById('modalEventDescription').textContent = registration.event_description;
        document.getElementById('modalParticipantsCount').textContent = registration.current_participants;
        document.getElementById('modalMaxParticipants').textContent = registration.max_participants || 'Unlimited';
        document.getElementById('modalPointsCount').textContent = registration.points_reward || '0';
        document.getElementById('modalRegistrationStatus').textContent = status;
        document.getElementById('modalRegistrationStatus').className = `status-badge ${status}`;
        document.getElementById('modalRegistrationDate').textContent = registration.registration_date;
        document.getElementById('modalEmergencyContact').textContent = registration.emergency_contact || 'Not provided';

        currentEventId = registration.event_id;

        const modalActions = document.getElementById('modalActions');
        modalActions.innerHTML = '';

        switch(status) {
            case 'confirmed':
            case 'pending':
                modalActions.innerHTML = `
                    <button class="modal-btn secondary" id="modalCancelBtn">Cancel Registration</button>
                    <button class="modal-btn primary" id="modalViewEventBtn">View Event Details</button>
                `;
                break;
            case 'waitlisted':
                modalActions.innerHTML = `
                    <button class="modal-btn secondary" id="modalCancelBtn">Cancel Registration</button>
                    <span class="waitlist-info">You are on the waitlist for this event</span>
                `;
                break;
            case 'attended':
                if (registration.feedback_provided) {
                    modalActions.innerHTML = `
                        <span class="evaluation-status"><i class="fas fa-check-circle"></i> Evaluation Submitted</span>
                        ${registration.certificate_issued ? '<button class="modal-btn primary" id="modalViewCertificate">View Certificate</button>' : ''}
                    `;
                } else {
                    modalActions.innerHTML = `
                        <button class="modal-btn primary" id="modalEvaluateBtn">Evaluate Event</button>
                    `;
                }
                break;
            case 'cancelled':
                modalActions.innerHTML = `
                    <span class="cancelled-status">Registration Cancelled</span>
                `;
                break;
            default:
                modalActions.innerHTML = `
                    <button class="modal-btn primary" id="modalViewEventBtn">View Event Details</button>
                `;
        }

        setTimeout(() => {
            const cancelBtn = document.getElementById('modalCancelBtn');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => cancelRegistration(currentRegistrationId));
            }

            const evaluateBtn = document.getElementById('modalEvaluateBtn');
            if (evaluateBtn) {
                evaluateBtn.addEventListener('click', () => {
                    const eventTitle = document.getElementById('modalEventTitle').textContent;
                    openEvaluationModal(currentRegistrationId, eventTitle);
                });
            }

            const viewEventBtn = document.getElementById('modalViewEventBtn');
            if (viewEventBtn) {
                viewEventBtn.addEventListener('click', () => {
                    eventModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                    if (currentEventId) {
                        window.location.href = `/event/${currentEventId}/`;
                    }
                });
            }

            const viewCertificateBtn = document.getElementById('modalViewCertificate');
            if (viewCertificateBtn) {
                viewCertificateBtn.addEventListener('click', () => {
                    alert('Certificate viewing functionality would be implemented here');
                });
            }
        }, 100);
    }

    function openEvaluationModal(registrationId, eventTitle) {
        currentRegistrationId = registrationId;
        document.getElementById('evaluationEventTitle').textContent = eventTitle;
        
        if (evaluationForm) {
            evaluationForm.reset();
            document.getElementById('commentsCounter').textContent = '0/500';
            document.getElementById('suggestionsCounter').textContent = '0/300';
            document.getElementById('commentsCounter').classList.remove('near-limit', 'over-limit');
            document.getElementById('suggestionsCounter').classList.remove('near-limit', 'over-limit');
        }
        
        evaluationModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        setupCharacterCounters();
        setupStarRating();
    }

    function cancelRegistration(registrationId) {
        if (confirm('Are you sure you want to cancel your registration?')) {
            const modalActions = document.getElementById('modalActions');
            modalActions.innerHTML = '<p>Cancelling...</p>';

            fetch(`/api/cancel-registration/${registrationId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken'),
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Registration cancelled successfully.');
                    eventModal.style.display = 'none';
                    location.reload();
                } else {
                    showError('Error cancelling registration: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showError('Error cancelling registration');
            });
        }
    }

    modalClose.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            eventModal.style.display = 'none';
            evaluationModal.style.display = 'none';
            document.getElementById('successModal').style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === eventModal || event.target === evaluationModal || event.target === document.getElementById('successModal')) {
            eventModal.style.display = 'none';
            evaluationModal.style.display = 'none';
            document.getElementById('successModal').style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    if (evaluationForm) {
        evaluationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitEvaluation();
        });
    }

    if (cancelEvaluationBtn) {
        cancelEvaluationBtn.addEventListener('click', function() {
            evaluationModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    if (closeSuccessModal) {
        closeSuccessModal.addEventListener('click', function() {
            document.getElementById('successModal').style.display = 'none';
            location.reload();
        });
    }

    function submitEvaluation() {
        const rating = document.querySelector('input[name="rating"]:checked');
        
        if (!rating) {
            showRatingError();
            return;
        }

        const evaluationData = {
            rating: rating.value,
            comments: document.getElementById('comments').value,
            suggestions: document.getElementById('suggestions').value,
            would_attend_again: document.getElementById('would_attend_again').checked
        };

        const submitBtn = evaluationForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;

        fetch(`/api/submit-evaluation/${currentRegistrationId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(evaluationData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                evaluationModal.style.display = 'none';
                document.getElementById('successModal').style.display = 'flex';
                
                setTimeout(() => {
                    document.getElementById('successModal').style.display = 'none';
                    location.reload();
                }, 3000);
            } else {
                alert('Error submitting evaluation: ' + data.error);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error submitting evaluation');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
    }

    function showRatingError() {
        const starRating = document.querySelector('.star-rating');
        starRating.style.animation = 'shake 0.5s ease-in-out';
        
        setTimeout(() => {
            starRating.style.animation = '';
        }, 500);
        
        let errorMsg = starRating.querySelector('.rating-error');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'rating-error';
            errorMsg.style.color = '#EF4444';
            errorMsg.style.fontSize = '0.9rem';
            errorMsg.style.marginTop = '10px';
            errorMsg.style.textAlign = 'center';
            starRating.parentNode.appendChild(errorMsg);
        }
        errorMsg.textContent = 'Please select a rating before submitting';
        
        setTimeout(() => {
            errorMsg.remove();
        }, 3000);
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

    function showError(message) {
        const modalActions = document.getElementById('modalActions');
        modalActions.innerHTML = `<p class="error-message">${message}</p>`;
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

    function setupCharacterCounters() {
        const commentsTextarea = document.getElementById('comments');
        const suggestionsTextarea = document.getElementById('suggestions');
        const commentsCounter = document.getElementById('commentsCounter');
        const suggestionsCounter = document.getElementById('suggestionsCounter');

        if (commentsTextarea && commentsCounter) {
            commentsTextarea.addEventListener('input', function() {
                const length = this.value.length;
                commentsCounter.textContent = `${length}/500`;
                updateCounterStyle(commentsCounter, length, 500);
            });
        }

        if (suggestionsTextarea && suggestionsCounter) {
            suggestionsTextarea.addEventListener('input', function() {
                const length = this.value.length;
                suggestionsCounter.textContent = `${length}/300`;
                updateCounterStyle(suggestionsCounter, length, 300);
            });
        }
    }

    function updateCounterStyle(counter, length, maxLength) {
        counter.classList.remove('near-limit', 'over-limit');
        if (length > maxLength * 0.8) {
            counter.classList.add('near-limit');
        }
        if (length > maxLength) {
            counter.classList.add('over-limit');
        }
    }

    function setupStarRating() {
        const stars = document.querySelectorAll('.star-rating label');
        
        stars.forEach(star => {
            star.addEventListener('mouseenter', function() {
                const rating = this.getAttribute('data-rating');
            });
            
            star.addEventListener('click', function() {
                const ratingValue = this.previousElementSibling.value;
            });
        });
    }

    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
});