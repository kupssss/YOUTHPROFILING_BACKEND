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


function initMap() {
    const mambuganCoords = [14.6255, 121.1750];
    

    const map = L.map('mambugan-map').setView(mambuganCoords, 14);
    

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    

    L.marker(mambuganCoords)
        .addTo(map)
        .bindPopup('<strong>Barangay Mambugan</strong><br>Antipolo City, Rizal')
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
    
    const animatedElements = document.querySelectorAll('.feature-card, .gallery-item, .mission-card, .vision-card');
    
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
    
    const imageFrames = document.querySelectorAll('.image-frame');
    imageFrames.forEach(frame => {
        frame.addEventListener('mouseenter', function() {
            this.querySelector('img').style.transform = 'scale(1.05)';
        });
        
        frame.addEventListener('mouseleave', function() {
            this.querySelector('img').style.transform = 'scale(1)';
        });
    });
    

    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.querySelector('img').style.transform = 'scale(1.1)';
            this.querySelector('.gallery-overlay').style.transform = 'translateY(0)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.querySelector('img').style.transform = 'scale(1)';
            this.querySelector('.gallery-overlay').style.transform = 'translateY(100%)';
        });
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