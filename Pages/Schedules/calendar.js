const calendarState = { year: 2025 };
const calendarLimits = { minYear: 2025, maxYear: 2030 };

function setCalendar(year) {
  calendarState.year = year;
}

function renderSchedule() {
  const grid = document.getElementById("calendar-grid");
  const upcoming = document.getElementById("upcoming-events");
  if (!grid || !upcoming) return;
  const year = calendarState.year || new Date().getFullYear();

  const mNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const events = EventStore.all();

  // make calendar-grid a 3-column layout of month cards
  grid.innerHTML = "";
  grid.className = "grid grid-cols-1 md:grid-cols-3 gap-4";

  const titleEl = document.getElementById("calendar-title");
  if (titleEl) titleEl.textContent = `${year}`;

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  for (let month = 0; month < 12; month++) {
    const monthWrap = document.createElement("div");
    monthWrap.className = "bg-white rounded-xl shadow-sm p-4";

    const header = document.createElement("div");
    header.className = "mb-3 flex items-center justify-between";
    const h = document.createElement("h4");
    h.className = "font-semibold text-gray-800";
    h.textContent = `${mNames[month]} ${year}`;
    header.appendChild(h);
    monthWrap.appendChild(header);

    // weekday headings
    const weekdays = document.createElement("div");
    weekdays.className =
      "grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2";
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((w) => {
      const d = document.createElement("div");
      d.textContent = w;
      weekdays.appendChild(d);
    });
    monthWrap.appendChild(weekdays);

    const monthGrid = document.createElement("div");
    monthGrid.className = "grid grid-cols-7 gap-1";
    const first = new Date(year, month, 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < startDay; i++) {
      const cell = document.createElement("div");
      cell.className =
        "calendar-day h-20 p-2 border border-gray-100 text-gray-400 text-sm";
      monthGrid.appendChild(cell);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement("div");
      cell.className = "calendar-day h-20 p-2 border border-gray-100 text-sm";
      const dt = document.createElement("div");
      dt.className = "font-semibold text-sm";
      dt.textContent = d;
      cell.appendChild(dt);
      const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
      const evs = events.filter((e) => e.date === dateStr);
      evs.slice(0, 2).forEach((ev) => {
        const b = document.createElement("div");
        b.className = "text-xs mt-1 text-primary-500 truncate";
        b.textContent = ev.title;
        b.title = ev.title;
        b.addEventListener("click", () => viewEvent(ev.id));
        cell.appendChild(b);
      });
      if (evs.length > 2) {
        const more = document.createElement("div");
        more.className = "text-xs text-gray-400 mt-1";
        more.textContent = `+${evs.length - 2} more`;
        cell.appendChild(more);
      }
      monthGrid.appendChild(cell);
    }

    monthWrap.appendChild(monthGrid);
    grid.appendChild(monthWrap);
  }

  // upcoming events list (top 10)
  upcoming.innerHTML = "";
  const upcomingList = EventStore.all()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 10);
  if (!upcomingList.length) {
    upcoming.innerHTML =
      '<div class="text-center text-gray-500 py-6">No events yet. Use "Add Event" to create one.</div>';
    return;
  }
  upcomingList.forEach((ev) => {
    const card = document.createElement("div");
    card.className =
      "event-card bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between";
    card.innerHTML = `<div class="flex items-center"><div class="bg-gray-100 rounded-lg p-3 mr-4"><i data-feather="calendar" class="text-primary-500"></i></div><div><h4 class="font-semibold text-gray-800">${escapeHtml(
      ev.title
    )}</h4><p class="text-sm text-gray-500">${escapeHtml(ev.date)} ${escapeHtml(
      ev.time || ""
    )}</p></div></div><div class="flex items-center space-x-2"><button data-event-view="${
      ev.id
    }" class="p-2 text-blue-600" title="View" aria-label="View event"><i data-feather="eye"></i></button><button data-event-edit="${
      ev.id
    }" class="p-2 text-indigo-600" title="Edit" aria-label="Edit event"><i data-feather="edit-2"></i></button><button data-event-delete="${
      ev.id
    }" class="p-2 text-red-600" title="Delete" aria-label="Delete event"><i data-feather="trash-2"></i></button></div>`;
    upcoming.appendChild(card);
  });

  upcoming
    .querySelectorAll("[data-event-view]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        viewEvent(b.getAttribute("data-event-view"))
      )
    );
  upcoming
    .querySelectorAll("[data-event-edit]")
    .forEach((b) =>
      b.addEventListener("click", () =>
        editEvent(b.getAttribute("data-event-edit"))
      )
    );
  upcoming.querySelectorAll("[data-event-delete]").forEach((b) =>
    b.addEventListener("click", () => {
      if (confirm("Delete this event?")) {
        EventStore.remove(b.getAttribute("data-event-delete"));
        renderSchedule();
      }
    })
  );

  try {
    if (window.feather) feather.replace();
  } catch (e) {}
  try {
    if (typeof window.__updateCalendarNav === "function")
      window.__updateCalendarNav();
  } catch (e) {}
}

// year selector initializer (deprecated - now using year navigation buttons)
function initYearSelector() {
  // This function is no longer used as we're using prev/next year buttons
}

function openEventModal(existing) {
  const isEdit = !!existing;
  const form = document.createElement("form");
  form.className = "space-y-3";
  form.innerHTML = `
        <div><label class="block text-sm text-gray-700">Title</label><input name="title" value="${
          existing ? escapeHtml(existing.title) : ""
        }" required class="w-full px-3 py-2 border rounded-lg" /></div>
        <div class="grid grid-cols-2 gap-2"><div><label class="block text-sm text-gray-700">Date</label><input type="date" name="date" value="${
          existing ? escapeHtml(existing.date) : ""
        }" class="w-full px-3 py-2 border rounded-lg" /></div><div><label class="block text-sm text-gray-700">Time</label><input type="time" name="time" value="${
    existing ? escapeHtml(existing.time || "") : ""
  }" class="w-full px-3 py-2 border rounded-lg" /></div></div>
        <div><label class="block text-sm text-gray-700">Description</label><textarea name="description" class="w-full px-3 py-2 border rounded-lg" rows="3">${
          existing ? escapeHtml(existing.description || "") : ""
        }</textarea></div>
        <div class="flex justify-end"><button type="submit" class="bg-primary-500 btn-animated text-white px-4 py-2 rounded-lg">${
          isEdit ? "Save" : "Add"
        }</button></div>
    `;
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    const payload = {
      title: form.title.value.trim(),
      date: form.date.value,
      time: form.time.value,
      description: form.description.value.trim(),
    };
    if (!payload.title || !payload.date) {
      alert("Title and date required");
      return;
    }
    if (isEdit) {
      EventStore.update(existing.id, payload);
    } else {
      EventStore.add(payload);
    }
    closeModal();
    renderSchedule();
  });
  openModal({
    title: isEdit ? "Edit " + existing.title : "Add Event",
    content: form,
  });
}

function viewEvent(id) {
  const ev = EventStore.all().find((x) => x.id === id);
  if (!ev) return alert("Event not found");
  const el = document.createElement("div");
  el.innerHTML = `<h3 class="text-lg font-semibold mb-2">${escapeHtml(
    ev.title
  )}</h3><p class="text-sm text-gray-700 mb-2">${escapeHtml(
    ev.description || ""
  )}</p><p class="text-sm text-gray-500">Date: ${escapeHtml(
    ev.date || ""
  )}</p><p class="text-sm text-gray-500">Time: ${escapeHtml(
    ev.time || ""
  )}</p>`;
  openModal({ title: "Event Details", content: el });
}

function editEvent(id) {
  const ev = EventStore.all().find((x) => x.id === id);
  if (!ev) return alert("Event not found");
  openEventModal(ev);
}

function initCalendarNavigation() {
  // Prevent duplicate initialization
  if (window.__calendarNavInitialized) return;
  window.__calendarNavInitialized = true;

  const prev = document.getElementById("btn-prev-year");
  const next = document.getElementById("btn-next-year");
  const jumpBtn = document.getElementById("btn-jump-to-year");
  const dropdown = document.getElementById("year-dropdown");
  const yearList = document.getElementById("year-list");

  if (prev) {
    prev.addEventListener("click", function () {
      let y = calendarState.year;
      y--;
      if (y < calendarLimits.minYear) return;
      setCalendar(y);
      renderSchedule();
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      let y = calendarState.year;
      y++;
      if (y > calendarLimits.maxYear) return;
      setCalendar(y);
      renderSchedule();
    });
  }

  // Jump to Year functionality
  if (jumpBtn && dropdown && yearList) {
    // Populate year list with improved organization
    function populateYearList() {
      yearList.innerHTML = "";
      const currentYear = new Date().getFullYear();
      console.log(
        "Populating years from",
        calendarLimits.minYear,
        "to",
        calendarLimits.maxYear
      );

      for (let y = calendarLimits.minYear; y <= calendarLimits.maxYear; y++) {
        const btn = document.createElement("button");
        btn.type = "button";
        // Fixed height to prevent layout shift
        btn.style.cssText =
          "display: flex; align-items: center; justify-content: center; width: 100%; height: 110px; position: relative; overflow: hidden;";
        btn.className =
          "relative w-full text-center px-4 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer transform";

        // Different styling based on year status
        if (y === calendarState.year) {
          // Currently selected year - Vibrant gradient
          btn.className +=
            " text-white shadow-lg ring-4 ring-primary-200 ring-opacity-50";
          btn.style.background =
            "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)";
          btn.innerHTML = `
            <div class="relative z-10 flex flex-col items-center justify-center">
              <div class="text-2xl font-bold mb-1" style="line-height: 1.2;">${y}</div>
              <div class="font-medium tracking-wide text-center" style="opacity: 0.95; font-size: 0.65rem; line-height: 1.2;">✓ Viewing<br>Now</div>
            </div>
            <div class="absolute top-0 right-0 w-16 h-16 bg-white opacity-10 rounded-full -mr-8 -mt-8"></div>
          `;
        } else if (y === currentYear) {
          // Today's year - Special highlight
          btn.className +=
            " text-primary-700 border-3 shadow-md hover:shadow-xl";
          btn.style.background =
            "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)";
          btn.style.borderColor = "#0ea5e9";
          btn.style.borderWidth = "2px";
          btn.style.borderStyle = "solid";
          btn.innerHTML = `
            <div class="relative z-10 flex flex-col items-center justify-center">
              <div class="text-2xl font-bold mb-1" style="line-height: 1.2;">${y}</div>
              <div class="text-xs font-semibold flex items-center justify-center whitespace-nowrap">
                <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
                </svg>
                Today
              </div>
            </div>
          `;
        } else if (y < currentYear) {
          // Past years - Subtle gray
          btn.className +=
            " text-gray-700 hover:text-gray-900 shadow-sm border border-gray-200";
          btn.style.background =
            "linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)";
          btn.innerHTML = `
            <div class="relative z-10 flex flex-col items-center justify-center">
              <div class="text-2xl font-bold mb-1" style="line-height: 1.2;">${y}</div>
              <div class="text-xs text-gray-500 whitespace-nowrap">Past</div>
            </div>
          `;
        } else {
          // Future years - Blue tinted
          btn.className +=
            " text-blue-800 shadow-sm border border-blue-200 hover:border-blue-400";
          btn.style.background =
            "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)";
          btn.innerHTML = `
            <div class="relative z-10 flex flex-col items-center justify-center">
              <div class="text-2xl font-bold mb-1" style="line-height: 1.2;">${y}</div>
              <div class="text-xs text-blue-600 whitespace-nowrap">Future</div>
            </div>
          `;
        }

        // Add ripple effect on click
        btn.addEventListener("mousedown", function (e) {
          const ripple = document.createElement("span");
          ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            width: 100px;
            height: 100px;
            margin-top: -50px;
            margin-left: -50px;
            top: ${e.offsetY}px;
            left: ${e.offsetX}px;
            animation: ripple 0.6s;
            pointer-events: none;
          `;
          this.appendChild(ripple);
          setTimeout(() => ripple.remove(), 600);
        });

        btn.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          setCalendar(y);
          renderSchedule();
          dropdown.classList.add("hidden");
        });

        yearList.appendChild(btn);
      }
      console.log("Added", yearList.children.length, "year buttons");
    }

    // Toggle dropdown
    jumpBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const isHidden = dropdown.classList.contains("hidden");
      if (isHidden) {
        populateYearList(); // Refresh to highlight current year
        dropdown.classList.remove("hidden");
      } else {
        dropdown.classList.add("hidden");
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
      if (!jumpBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add("hidden");
      }
    });
  }

  function updateButtonStates() {
    if (!prev || !next) return;
    const atMin = calendarState.year === calendarLimits.minYear;
    const atMax = calendarState.year === calendarLimits.maxYear;
    prev.disabled = atMin;
    prev.classList.toggle("opacity-50", atMin);
    next.disabled = atMax;
    next.classList.toggle("opacity-50", atMax);
  }

  window.__updateCalendarNav = updateButtonStates;
}
