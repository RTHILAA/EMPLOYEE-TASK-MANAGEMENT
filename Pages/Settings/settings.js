(function () {
  const KEY = "tfp_settings_v1";

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }
  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function saveSettings(obj) {
    try {
      localStorage.setItem(KEY, JSON.stringify(obj));
      return true;
    } catch (e) {
      console.warn("saveSettings failed", e);
      return false;
    }
  }
  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function gatherGeneral() {
    return {
      companyName: qs("#s_companyName") ? qs("#s_companyName").value : "",
      industry: qs("#s_industry") ? qs("#s_industry").value : "",
      website: qs("#s_website") ? qs("#s_website").value : "",
      timezone: qs("#s_timezone") ? qs("#s_timezone").value : "",
      darkMode: qs("#s_darkMode") ? qs("#s_darkMode").checked : false,
      emailNotifications: qs("#s_emailNotifications")
        ? qs("#s_emailNotifications").checked
        : false,
      autoSave: qs("#s_autoSave") ? qs("#s_autoSave").checked : false,
      defaultPriority: qs("#s_defaultPriority")
        ? qs("#s_defaultPriority").value
        : "Medium",
      assignmentNotification: qs("#s_assignmentNotification")
        ? qs("#s_assignmentNotification").value
        : "Immediately",
      enableDependencies: qs("#s_enableDependencies")
        ? qs("#s_enableDependencies").checked
        : false,
    };
  }

  function gatherAccount() {
    return {
      fullname: qs("#a_fullname") ? qs("#a_fullname").value : "",
      email: qs("#a_email") ? qs("#a_email").value : "",
    };
  }

  function gatherNotifications() {
    return {
      emailTask: qs("#n_emailTask") ? qs("#n_emailTask").checked : false,
      weeklySummary: qs("#n_weeklySummary")
        ? qs("#n_weeklySummary").checked
        : false,
    };
  }

  function gatherSecurity() {
    return {
      password: qs("#sec_password") ? qs("#sec_password").value : "",
      twofa: qs("#sec_2fa") ? qs("#sec_2fa").checked : false,
    };
  }

  function gatherIntegrations() {
    return {
      slack: false,
      gcal: false,
    };
  }

  function gatherBilling() {
    return {
      card: qs("#b_card") ? qs("#b_card").value : "",
    };
  }

  function applySettings(s) {
    if (!s) return;
    if (qs("#s_companyName")) qs("#s_companyName").value = s.companyName || "";
    if (qs("#s_industry")) qs("#s_industry").value = s.industry || "";
    if (qs("#s_website")) qs("#s_website").value = s.website || "";
    if (qs("#s_timezone")) qs("#s_timezone").value = s.timezone || "";
    if (qs("#s_darkMode")) qs("#s_darkMode").checked = !!s.darkMode;
    if (qs("#s_emailNotifications"))
      qs("#s_emailNotifications").checked = !!s.emailNotifications;
    if (qs("#s_autoSave")) qs("#s_autoSave").checked = !!s.autoSave;
    if (qs("#s_defaultPriority"))
      qs("#s_defaultPriority").value = s.defaultPriority || "Medium";
    if (qs("#s_assignmentNotification"))
      qs("#s_assignmentNotification").value =
        s.assignmentNotification || "Immediately";
    if (qs("#s_enableDependencies"))
      qs("#s_enableDependencies").checked = !!s.enableDependencies;

    if (qs("#a_fullname"))
      qs("#a_fullname").value =
        (s.account && s.account.fullname) || qs("#a_fullname").value || "";
    if (qs("#a_email"))
      qs("#a_email").value =
        (s.account && s.account.email) || qs("#a_email").value || "";

    if (qs("#n_emailTask"))
      qs("#n_emailTask").checked = !!(
        s.notifications && s.notifications.emailTask
      );
    if (qs("#n_weeklySummary"))
      qs("#n_weeklySummary").checked = !!(
        s.notifications && s.notifications.weeklySummary
      );

    if (qs("#sec_2fa"))
      qs("#sec_2fa").checked = !!(s.security && s.security.twofa);

    if (qs("#b_card"))
      qs("#b_card").value = (s.billing && s.billing.card) || "";

    // profile preview if stored (data URL)
    if (s.account && s.account.profileDataUrl && qs("#a_profilePreview")) {
      qs("#a_profilePreview").src = s.account.profileDataUrl;
    }
  }

  function saveAll() {
    const payload = {
      general: gatherGeneral(),
      account: gatherAccount(),
      notifications: gatherNotifications(),
      security: gatherSecurity(),
      integrations: gatherIntegrations(),
      billing: gatherBilling(),
    };
    const ok = saveSettings(payload);
    if (ok)
      openModal({
        title: "Settings saved",
        content:
          '<p class="text-sm text-gray-700">Your settings were saved locally.</p>',
      });
    return ok;
  }

  function initTabs() {
    const tabs = qsa(".nav-link");
    const panels = qsa(".settings-panel");
    function show(tabName) {
      panels.forEach((p) => {
        p.classList.add("hidden");
        p.setAttribute("aria-hidden", "true");
      });
      const sel = "#tab-" + tabName;
      const panel = document.querySelector(sel);
      if (panel) {
        panel.classList.remove("hidden");
        panel.setAttribute("aria-hidden", "false");
      }
      tabs.forEach((t) => t.classList.remove("active"));
      const btn = tabs.find((t) => t.getAttribute("data-tab") === tabName);
      if (btn) btn.classList.add("active");
    }
    tabs.forEach((t) => {
      t.addEventListener("click", function () {
        const name = t.getAttribute("data-tab");
        if (name) show(name);
      });
    });
    // default show general
    show("general");
  }

  function initProfilePreview() {
    const fileIn = qs("#a_profileFile");
    if (!fileIn) return;
    fileIn.addEventListener("change", function () {
      const f = this.files && this.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        const dataUrl = e.target.result;
        if (qs("#a_profilePreview")) qs("#a_profilePreview").src = dataUrl; // save into local settings
        const s = loadSettings();
        s.account = s.account || {};
        s.account.profileDataUrl = dataUrl;
        saveSettings(s);
      };
      reader.readAsDataURL(f);
    });
  }

  // bind Save Changes button in header
  function bindSaveButton() {
    const btn = document.querySelector('[data-modal-target="save-changes"]');
    if (!btn) return;
    btn.addEventListener("click", function () {
      // gather and save
      saveAll();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    try {
      initTabs();
      initProfilePreview();
      bindSaveButton();
      const existing = loadSettings();
      applySettings(existing);
    } catch (e) {
      console.warn("settings init error", e);
    }
  });
})();
