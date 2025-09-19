const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
    
    if (navMenu.classList.contains("active")) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "auto";
    }
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
            const dropdown = this.parentElement;
            dropdown.classList.toggle("active");
        }
    });
});

function animateOnScroll() {
    const elements = document.querySelectorAll('.developer-card, .purpose-item, .tech-item');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        
        if (elementPosition < screenPosition) {
            element.style.opacity = 1;
            element.style.transform = 'translateY(0)';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.developer-card, .purpose-item, .tech-item');
    
    animatedElements.forEach(element => {
        element.style.opacity = 0;
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
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

const developerCards = document.querySelectorAll('.developer-card');
developerCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.querySelector('.developer-image img').style.transform = 'scale(1.1)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.querySelector('.developer-image img').style.transform = 'scale(1)';
    });
});


window.addEventListener('load', function() {
    setTimeout(() => {
        document.querySelector('.project-hero').style.opacity = '1';
        document.querySelector('.project-hero').style.transform = 'translateY(0)';
    }, 100);
});