function debounce(fn, wait) {
  let t;
  return function () {
    clearTimeout(t);
    const args = arguments;
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

function initFeather() {
  try {
    if (window.feather && typeof feather.replace === "function")
      feather.replace();
  } catch (e) {
    console.warn("Feather icons not available", e);
  }
}

function setActiveSidebar() {
  try {
    const links = document.querySelectorAll(".sidebar-link");
    const currentFile =
      window.location && window.location.pathname
        ? window.location.pathname.split("/").pop()
        : window.location
        ? window.location.href.split("/").pop()
        : "";
    links.forEach((a) => {
      const href = a.getAttribute("href");
      if (!href) return;
      const hrefFile = href.split("/").pop();
      if (
        hrefFile &&
        currentFile &&
        (hrefFile === currentFile || currentFile.includes(hrefFile))
      ) {
        links.forEach((l) => {
          l.classList.remove("active");
          l.classList.remove("text-white");
          l.classList.add("text-gray-700");
        });
        a.classList.add("active");
        a.classList.remove("text-gray-700");
        a.classList.add("text-white");
      }
    });
    links.forEach((a) =>
      a.addEventListener("click", function () {
        try {
          links.forEach((l) => {
            l.classList.remove("active");
            l.classList.remove("text-white");
            l.classList.add("text-gray-700");
          });
          this.classList.add("active");
          this.classList.remove("text-gray-700");
          this.classList.add("text-white");
        } catch (e) {}
      })
    );
  } catch (e) {
    console.warn("Sidebar active error", e);
  }
}

function addPrimaryButtonInteractions() {
  document
    .querySelectorAll(".bg-primary-500")
    .forEach((el) => el.classList.add("btn-animated"));
}

// Expose commonly used helpers
window.debounce = debounce;
window.initFeather = initFeather;
window.setActiveSidebar = setActiveSidebar;
window.addPrimaryButtonInteractions = addPrimaryButtonInteractions;