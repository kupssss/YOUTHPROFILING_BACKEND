document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");
    const imageModal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    const closeModalButtons = document.querySelectorAll(".close");
    const logoutBtn = document.getElementById("logout-btn");
    const logoutModal = document.getElementById("logoutModal");
    const confirmLogout = document.getElementById("confirmLogout");
    const cancelLogout = document.getElementById("cancelLogout");
    const enlargeableImages = document.querySelectorAll(".enlargeable-image");
    const copyLinkBtn = document.getElementById("copy-link");
    const mapContainer = document.getElementById("map");

    // Mobile navigation toggle
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

    // Close mobile menu when clicking on links
    document.querySelectorAll(".nav-link").forEach((n) =>
        n.addEventListener("click", () => {
            if (hamburger) hamburger.classList.remove("active");
            if (navMenu) navMenu.classList.remove("active");
            document.body.style.overflow = "auto";
        })
    );

    // Image modal functionality
    if (enlargeableImages) {
        enlargeableImages.forEach((image) => {
            image.addEventListener("click", function () {
                modalImage.src = this.src;
                modalImage.alt = this.alt;
                imageModal.style.display = "flex";
                document.body.style.overflow = "hidden";
            });
        });
    }

    // Close modal functionality
    if (closeModalButtons) {
        closeModalButtons.forEach((button) => {
            button.addEventListener("click", function () {
                imageModal.style.display = "none";
                logoutModal.style.display = "none";
                document.body.style.overflow = "auto";
            });
        });
    }

    // Close modals when clicking outside
    window.addEventListener("click", function (event) {
        if (event.target === imageModal) {
            imageModal.style.display = "none";
            document.body.style.overflow = "auto";
        }
        if (event.target === logoutModal) {
            logoutModal.style.display = "none";
        }
    });

    // Logout modal functionality
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            if (logoutModal) logoutModal.style.display = "flex";
        });
    }

    if (cancelLogout) {
        cancelLogout.addEventListener("click", function () {
            if (logoutModal) logoutModal.style.display = "none";
        });
    }

    if (confirmLogout) {
        confirmLogout.addEventListener("click", function () {
            window.location.href = "/logout/";
        });
    }

    // Copy link functionality
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener("click", function (e) {
            e.preventDefault();
            const url = window.location.href;
            
            navigator.clipboard.writeText(url).then(() => {
                showNotification("Link copied to clipboard!");
            }).catch(err => {
                console.error('Failed to copy: ', err);
                showNotification("Failed to copy link");
            });
        });
    }

    if (mapContainer) {
       const mapContainer = document.getElementById("map");

if (mapContainer) {
    try {
        const map = L.map('map').setView([14.6255, 121.1750], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        L.marker([14.6255, 121.1750]).addTo(map)
            .bindPopup('<strong>SK Mambugan Office</strong><br>Ruhat 3 Lower Barangay Mambugan, Antipolo City')
            .openPopup();
            
        mapContainer.style.height = '400px';
    } catch (error) {
        console.error('Error initializing map:', error);
        mapContainer.innerHTML = `
            <div class="map-error">
                <i class="fas fa-map-marked-alt"></i>
                <p>Map could not be loaded. 
                <a href="https://www.google.com/maps/place/Mambugan,+Antipolo,+Rizal" target="_blank">
                View on Google Maps</a></p>
            </div>`;
    }
}

    }

    const addToCalendarBtn = document.querySelector(".btn-calendar");
    if (addToCalendarBtn) {
        addToCalendarBtn.addEventListener("click", function (e) {
            e.preventDefault();
            
            const eventTitle = document.querySelector(".event-header h1").textContent;
            const eventDate = document.querySelector(".event-meta .fa-calendar").nextElementSibling.textContent;
            const eventTime = document.querySelector(".event-meta .fa-clock").nextElementSibling.textContent;
            const eventLocation = document.querySelector(".event-meta .fa-map-marker-alt").nextElementSibling.textContent;
            
            showNotification(`"${eventTitle}" added to your calendar`);
        });
    }

    const shareButtons = document.querySelectorAll(".share-btn:not(#copy-link)");
    if (shareButtons) {
        shareButtons.forEach(button => {
            button.addEventListener("click", function (e) {
                e.preventDefault();
                const platform = this.classList[1];
                const url = encodeURIComponent(window.location.href);
                const title = encodeURIComponent(document.querySelector(".event-header h1").textContent);
                
                let shareUrl;
                
                switch(platform) {
                    case 'facebook':
                        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                        break;
                    case 'twitter':
                        shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`;
                        break;
                    case 'whatsapp':
                        shareUrl = `https://wa.me/?text=${title} ${url}`;
                        break;
                    default:
                        return;
                }
                
                window.open(shareUrl, '_blank');
            });
        });
    }

    // Notification function
    function showNotification(message) {
        const feedback = document.createElement("div");
        feedback.textContent = message;
        feedback.style.position = "fixed";
        feedback.style.bottom = "20px";
        feedback.style.right = "20px";
        feedback.style.background = "#1E40AF";
        feedback.style.color = "white";
        feedback.style.padding = "12px 20px";
        feedback.style.borderRadius = "8px";
        feedback.style.zIndex = "10000";
        feedback.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        feedback.style.fontFamily = "'Poppins', sans-serif";

        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.style.opacity = "0";
            feedback.style.transition = "opacity 0.5s ease";
            setTimeout(() => feedback.remove(), 500);
        }, 3000);
    }
    function animateOnScroll() {
        const elements = document.querySelectorAll(".event-card, .registration-card, .organizer-card, .share-card");
        
        elements.forEach((element) => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;

            if (elementPosition < screenPosition) {
                element.style.opacity = 1;
                element.style.transform = "translateY(0)";
            }
        });
    }

    const animatedElements = document.querySelectorAll(".event-card, .registration-card, .organizer-card, .share-card");
    animatedElements.forEach((element) => {
        element.style.opacity = 0;
        element.style.transform = "translateY(20px)";
        element.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });

    window.addEventListener("scroll", animateOnScroll);
    animateOnScroll();
});