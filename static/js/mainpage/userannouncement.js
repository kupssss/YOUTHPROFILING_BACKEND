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

      if (navMenu.classList.contains("active")) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
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
            if (card.classList.contains("announcement")) {
              card.style.display = "block";
            } else {
              card.style.display = "none";
            }
          });
          if (upcomingEvents) upcomingEvents.style.display = "none";
        } else if (viewValue === "events") {
          updateCards.forEach((card) => {
            if (card.classList.contains("event")) {
              card.style.display = "block";
            } else {
              card.style.display = "none";
            }
          });
          if (upcomingEvents) upcomingEvents.style.display = "block";
        } else if (viewValue === "registered") {
          updateCards.forEach((card) => {
            const hasIndicator = card.querySelector(
              ".user-indicator .registered"
            );
            const hasStatus = card.querySelector(".registration-status");
            if (hasIndicator || hasStatus) {
              card.style.display = "block";
            } else {
              card.style.display = "none";
            }
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
      if (e.key === "Enter") {
        performSearch();
      }
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
    if (event.target === imageModal) {
      imageModal.style.display = "none";
      document.body.style.overflow = "auto";
    }
    if (event.target === logoutModal) {
      logoutModal.style.display = "none";
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (logoutModal) logoutModal.style.display = "block";
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

  initializeUserFeatures();
  initializeAnimations();

  function filterUpdates() {
    const categoryValue = categorySelect.value;
    const timeframeValue = timeframeSelect.value;

    updateCards.forEach((card) => {
      let showCard = true;

      if (categoryValue !== "all") {
        const cardCategory = card.getAttribute("data-category");
        if (cardCategory !== categoryValue) {
          showCard = false;
        }
      }

      if (timeframeValue !== "all") {
        if (Math.random() > 0.5) {
          showCard = false;
        }
      }

      card.style.display = showCard ? "block" : "none";
    });
  }

  function performSearch() {
    const searchTerm = searchInput.value.toLowerCase();

    updateCards.forEach((card) => {
      const title = card.querySelector("h3").textContent.toLowerCase();
      const excerpt = card
        .querySelector(".update-excerpt")
        .textContent.toLowerCase();

      if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  }

  function initializeUserFeatures() {
    const attendanceButtons = document.querySelectorAll(".attendance-btn");
    const volunteerButtons = document.querySelectorAll(".volunteer-btn");
    const remindButtons = document.querySelectorAll(".remind-btn");
    const eventTicketButtons = document.querySelectorAll(".event-ticket");
    const recommendationButtons = document.querySelectorAll(
      ".recommendation-btn"
    );
    const saveButtons = document.querySelectorAll(".update-save");
    const eventActions = document.querySelectorAll(".event-action");
    const registerButtons = document.querySelectorAll(".register-btn");

    if (saveButtons) {
      saveButtons.forEach((button) => {
        button.addEventListener("click", function () {
          this.classList.toggle("saved");
          const icon = this.querySelector("i");
          if (this.classList.contains("saved")) {
            icon.className = "fas fa-bookmark";
            showNotification("Saved to your bookmarks");
          } else {
            icon.className = "far fa-bookmark";
            showNotification("Removed from bookmarks");
          }
        });
      });
    }

    if (eventActions) {
      eventActions.forEach((button) => {
        button.addEventListener("click", function () {
          if (this.classList.contains("registered")) {
            showNotification("You are already registered for this event");
            return;
          }

          const eventTitle =
            this.closest(".event-highlight").querySelector("h3").textContent;
          this.classList.add("registered");
          this.innerHTML = '<i class="fas fa-check-circle"></i> Registered';

          showNotification(`Successfully registered for "${eventTitle}"`);
        });
      });
    }

    if (registerButtons) {
      registerButtons.forEach((button) => {
        button.addEventListener("click", function (e) {
          const eventCard = this.closest(".update-card");
          const eventId = eventCard ? eventCard.dataset.eventId : null;

          if (eventId && isUserRegistered(eventId)) {
            e.preventDefault();
            showNotification("You are already registered for this event");
            this.innerHTML =
              '<i class="fas fa-check-circle"></i> Already Registered';
            this.classList.remove("register-btn");
            this.classList.add("registered-btn");
            this.removeAttribute("href");
            this.style.pointerEvents = "none";
            this.style.opacity = "0.7";
          }
        });
      });
    }

    if (attendanceButtons) {
      attendanceButtons.forEach((button) => {
        button.addEventListener("click", function () {
          this.classList.toggle("attending");
          this.innerHTML = this.classList.contains("attending")
            ? '<i class="fas fa-calendar-check"></i> Attending'
            : '<i class="fas fa-calendar"></i> Attend';

          showNotification(
            this.classList.contains("attending")
              ? "Marked as attending"
              : "No longer attending"
          );
        });
      });
    }

    if (volunteerButtons) {
      volunteerButtons.forEach((button) => {
        button.addEventListener("click", function () {
          this.classList.toggle("volunteered");
          this.innerHTML = this.classList.contains("volunteered")
            ? '<i class="fas fa-hands-helping"></i> Volunteering'
            : '<i class="fas fa-hands-helping"></i> Volunteer';

          showNotification(
            this.classList.contains("volunteered")
              ? "Thank you for volunteering!"
              : "Volunteer status removed"
          );
        });
      });
    }

    if (remindButtons) {
      remindButtons.forEach((button) => {
        button.addEventListener("click", function () {
          showNotification("Reminder set for this event");
        });
      });
    }

    if (eventTicketButtons) {
      eventTicketButtons.forEach((button) => {
        button.addEventListener("click", function () {
          showNotification("Your event ticket would be displayed here");
        });
      });
    }

    if (recommendationButtons) {
      recommendationButtons.forEach((button) => {
        button.addEventListener("click", function () {
          const cardTitle = this.closest(".recommendation-card").querySelector(
            "h3"
          ).textContent;
          showNotification(`Loading details for: ${cardTitle}`);
        });
      });
    }
  }

  function showNotification(message) {
    const feedback = document.createElement("div");
    feedback.textContent = message;
    feedback.style.position = "fixed";
    feedback.style.bottom = "20px";
    feedback.style.right = "20px";
    feedback.style.background = "#1E40AF";
    feedback.style.color = "white";
    feedback.style.padding = "10px 20px";
    feedback.style.borderRadius = "8px";
    feedback.style.zIndex = "1000";
    feedback.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";

    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.style.opacity = "0";
      feedback.style.transition = "opacity 0.5s ease";
      setTimeout(() => feedback.remove(), 500);
    }, 2000);
  }

  function isUserRegistered(eventId) {
    const registeredEvents = document.querySelectorAll(".update-card.event");
    for (const event of registeredEvents) {
      if (event.dataset.eventId === eventId) {
        return (
          event.querySelector(".user-indicator .registered") !== null ||
          event.querySelector(".registration-status") !== null
        );
      }
    }
    return false;
  }

  function initializeAnimations() {
    function animateOnScroll() {
      const elements = document.querySelectorAll(
        ".update-card, .event-highlight, .stat-card, .recommendation-card"
      );

      elements.forEach((element) => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.3;

        if (elementPosition < screenPosition) {
          element.style.opacity = 1;
          element.style.transform = "translateY(0)";
        }
      });
    }

    const animatedElements = document.querySelectorAll(
      ".update-card, .event-highlight, .stat-card, .recommendation-card"
    );

    animatedElements.forEach((element) => {
      element.style.opacity = 0;
      element.style.transform = "translateY(20px)";
      element.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });

    window.addEventListener("scroll", animateOnScroll);
    animateOnScroll();
  }
});
