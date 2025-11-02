document.addEventListener("DOMContentLoaded", function () {
  const viewButtons = document.querySelectorAll(".view-btn");
  const updateCards = document.querySelectorAll(".update-card");
  const upcomingEvents = document.querySelector(".upcoming-events");
  const categorySelect = document.getElementById("category");
  const timeframeSelect = document.getElementById("timeframe");
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
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

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
      document.body.style.overflow = navMenu.classList.contains("active") ? "hidden" : "auto";
    });
  }

  document.querySelectorAll(".nav-link").forEach((n) =>
    n.addEventListener("click", () => {
      if (hamburger) hamburger.classList.remove("active");
      if (navMenu) navMenu.classList.remove("active");
      document.body.style.overflow = "auto";
    })
  );

  if (viewButtons) {
    viewButtons.forEach((button) => {
      button.addEventListener("click", () => {
        viewButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        const viewValue = button.getAttribute("data-view");

        if (viewValue === "all") {
          updateCards.forEach((card) => (card.style.display = "block"));
          if (upcomingEvents) upcomingEvents.style.display = "block";
        } else if (viewValue === "announcements") {
          updateCards.forEach((card) => {
            card.style.display = card.classList.contains("announcement") ? "block" : "none";
          });
          if (upcomingEvents) upcomingEvents.style.display = "none";
        } else if (viewValue === "events") {
          updateCards.forEach((card) => {
            card.style.display = card.classList.contains("event") ? "block" : "none";
          });
          if (upcomingEvents) upcomingEvents.style.display = "block";
        } else if (viewValue === "registered") {
          updateCards.forEach((card) => {
            const hasIndicator = card.querySelector(".user-indicator .status-confirmed, .user-indicator .status-pending, .user-indicator .status-waitlisted");
            const hasStatus = card.querySelector(".registration-status");
            card.style.display = (hasIndicator || hasStatus) ? "block" : "none";
          });
          if (upcomingEvents) upcomingEvents.style.display = "block";
        }
      });
    });
  }

  if (categorySelect && timeframeSelect) {
    categorySelect.addEventListener("change", filterUpdates);
    timeframeSelect.addEventListener("change", filterUpdates);
  }

  if (searchButton) {
    searchButton.addEventListener("click", performSearch);
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") performSearch();
    });
  }

  if (enlargeableImages) {
    enlargeableImages.forEach((image) => {
      image.addEventListener("click", function () {
        modalImage.src = this.src;
        modalImage.alt = this.alt;
        imageModal.style.display = "block";
        document.body.style.overflow = "hidden";
      });
    });
  }

  if (closeModalButtons) {
    closeModalButtons.forEach((button) => {
      button.addEventListener("click", function () {
        imageModal.style.display = "none";
        logoutModal.style.display = "none";
        document.body.style.overflow = "auto";
      });
    });
  }

  window.addEventListener("click", function (event) {
    if (event.target === imageModal || event.target === logoutModal) {
      imageModal.style.display = "none";
      logoutModal.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      logoutModal.style.display = "block";
    });
  }

  if (cancelLogout) {
    cancelLogout.addEventListener("click", function () {
      logoutModal.style.display = "none";
    });
  }

  if (confirmLogout) {
    confirmLogout.addEventListener("click", function () {
      window.location.href = "/logout/";
    });
  }

  function filterUpdates() {
    const categoryValue = categorySelect.value;
    const timeframeValue = timeframeSelect.value;

    updateCards.forEach((card) => {
      let showCard = true;

      if (categoryValue !== "all") {
        const cardCategory = card.getAttribute("data-category");
        if (cardCategory !== categoryValue) showCard = false;
      }

      if (timeframeValue !== "all") {
        if (Math.random() > 0.5) showCard = false;
      }

      card.style.display = showCard ? "block" : "none";
    });
  }

  function performSearch() {
    const searchTerm = searchInput.value.toLowerCase();

    updateCards.forEach((card) => {
      const title = card.querySelector("h3").textContent.toLowerCase();
      const excerpt = card.querySelector(".update-excerpt").textContent.toLowerCase();
      card.style.display = (title.includes(searchTerm) || excerpt.includes(searchTerm)) ? "block" : "none";
    });
  }

  function initializeAnimations() {
    function animateOnScroll() {
      const elements = document.querySelectorAll(".update-card, .event-highlight, .stat-card, .recommendation-card");
      elements.forEach((element) => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;
        if (elementPosition < screenPosition) {
          element.style.opacity = 1;
          element.style.transform = "translateY(0)";
        }
      });
    }

    const animatedElements = document.querySelectorAll(".update-card, .event-highlight, .stat-card, .recommendation-card");
    animatedElements.forEach((element) => {
      element.style.opacity = 0;
      element.style.transform = "translateY(20px)";
      element.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });

    window.addEventListener("scroll", animateOnScroll);
    animateOnScroll();
  }

  initializeAnimations();
});