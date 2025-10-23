class MobileAPKPage {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initAnimations();
    }

    setupEventListeners() {
        const installGuideBtn = document.getElementById('installGuideBtn');
        const closeInstallModal = document.getElementById('closeInstallModal');
        const cancelInstallModal = document.getElementById('cancelInstallModal');
        const installModal = document.getElementById('installModal');
        const scrollIndicator = document.querySelector('.scroll-indicator');

        if (installGuideBtn) {
            installGuideBtn.addEventListener('click', () => this.showInstallInstructions());
        }
        if (closeInstallModal) {
            closeInstallModal.addEventListener('click', () => this.closeInstallModal());
        }
        if (cancelInstallModal) {
            cancelInstallModal.addEventListener('click', () => this.closeInstallModal());
        }
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                document.querySelector('.apk-features').scrollIntoView({ 
                    behavior: 'smooth' 
                });
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target === installModal) {
                this.closeInstallModal();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && installModal && installModal.style.display === 'block') {
                this.closeInstallModal();
            }
        });
    }

    showInstallInstructions() {
        const installModal = document.getElementById('installModal');
        if (installModal) {
            installModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    closeInstallModal() {
        const installModal = document.getElementById('installModal');
        if (installModal) {
            installModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    initAnimations() {
        const animatedElements = document.querySelectorAll('.feature-card, .step, .requirement, .qr-step');
        
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });

        this.animateOnScroll();
        window.addEventListener('scroll', () => this.animateOnScroll());
    }

    animateOnScroll() {
        const elements = document.querySelectorAll('.feature-card, .step, .requirement, .qr-step');
        const screenPosition = window.innerHeight / 1.3;

        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MobileAPKPage();
});