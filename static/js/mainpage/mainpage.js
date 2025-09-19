document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logoutModal');
    const confirmLogout = document.getElementById('confirmLogout');
    const cancelLogout = document.getElementById('cancelLogout');
    const closeModal = document.querySelector('.close');
    const animatedElements = document.querySelectorAll('.service-card, .announcement-card, .event-card, .action-card');

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navMenu.classList.toggle("active");
            
            if (navMenu.classList.contains("active")) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "auto";
            }
        });
    }

    document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
        if (hamburger) hamburger.classList.remove("active");
        if (navMenu) navMenu.classList.remove("active");
        document.body.style.overflow = "auto";
    }));

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (logoutModal) logoutModal.style.display = 'block';
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', function() {
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

    let userInactiveTime = 0;
    const inactivityInterval = setInterval(() => {
        userInactiveTime += 1;
        if (userInactiveTime === 15 * 60) {
            console.log('User inactive for 15 minutes');
        }
    }, 1000);

    document.addEventListener('mousemove', resetInactiveTime);
    document.addEventListener('keypress', resetInactiveTime);

    function resetInactiveTime() {
        userInactiveTime = 0;
    }

    function updateUserNotifications() {
        console.log('Checking for user notifications...');
    }

    updateUserNotifications();
});