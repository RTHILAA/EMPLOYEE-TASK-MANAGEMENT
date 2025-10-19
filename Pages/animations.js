// Small animation initializer: on-load and scroll reveal
(function () {
  // helper: add anim-hidden to elements we want revealed on scroll
  function setupHidden(selector) {
    document
      .querySelectorAll(selector)
      .forEach((el) => el.classList.add("anim-hidden"));
  }

  // reveal using IntersectionObserver
  function revealOnScroll() {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    document.querySelectorAll(".anim-hidden").forEach((el) => io.observe(el));
  }

  // animate progress bars on load (keeps existing behaviour)
  function animateProgressBars() {
    document.querySelectorAll(".progress-bar").forEach((bar) => {
      const final =
        bar.getAttribute("data-final-width") || bar.style.width || "100%";
      bar.style.width = "0";
      requestAnimationFrame(() => {
        setTimeout(() => (bar.style.width = final), 120);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    // default selectors to reveal
    setupHidden(
      ".task-card, .employee-card, .report-card, .event-card, .setting-card, .calendar-day, .bg-white.rounded-xl"
    );
    revealOnScroll();
    animateProgressBars();

    // small initial header animation
    document.querySelectorAll("header, .grid > .bg-white").forEach((h, i) => {
      if (h) h.classList.add("fade-in-up");
    });
  });
})();
