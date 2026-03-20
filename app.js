function setYear() {
  const el = document.getElementById("year");
  if (el) el.textContent = String(new Date().getFullYear());
}

function setupNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.contains("nav-open");
    nav.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(!isOpen));
  });

  // Închide meniul mobil imediat după ce apeși pe un link.
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      if (nav.classList.contains("nav-open")) {
        nav.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  // Escape închide meniul (UX bun la prezentare).
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("nav-open")) {
      nav.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function setError(fieldName, message) {
  const el = document.querySelector(`[data-error="${fieldName}"]`);
  if (!el) return;
  el.textContent = message || "";
}

function clearErrors() {
  ["name", "email", "message"].forEach((k) => setError(k, ""));
}

function setupContactForm() {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("status");
  const submitBtn = document.getElementById("submitBtn");
  if (!form || !status || !submitBtn) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearErrors();
    status.textContent = "";

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    const errors = {};
    if (!name || name.length < 2) errors.name = "Te rog introdu un nume (minim 2 caractere).";
    if (!email || !validateEmail(email)) errors.email = "Te rog introdu un email valid.";
    if (!message || message.length < 10) errors.message = "Mesajul trebuie sa aiba minim 10 caractere.";
    if (message.length > 2000) errors.message = "Mesajul e prea lung (max 2000 caractere).";

    if (Object.keys(errors).length > 0) {
      if (errors.name) setError("name", errors.name);
      if (errors.email) setError("email", errors.email);
      if (errors.message) setError("message", errors.message);
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Se trimite...";

    try {
      const resp = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || !data.ok) {
        status.textContent = data.error ? data.error : "A apărut o problemă la trimitere.";
        status.style.color = "#ffb3b3";
        return;
      }

      status.textContent = "Mesaj trimis! Multumesc.";
      status.style.color = "#78ffb3";
      form.reset();
    } catch {
      status.textContent = "Nu s-a putut conecta la server.";
      status.style.color = "#ffb3b3";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Trimite mesaj";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setYear();
  setupNavToggle();
  setupContactForm();

  // Buton „Sus” la scroll (pentru prezentare).
  const toTopBtn = document.getElementById("toTopBtn");
  if (toTopBtn) {
    const onScroll = () => {
      const show = window.scrollY > 600;
      toTopBtn.classList.toggle("is-visible", show);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    toTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Mini FAQ (accordion).
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-btn");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      item.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  // Animații discrete: elementele se „revelează” când intră în viewport.
  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const targets = document.querySelectorAll(
    ".section-head, .hero-card, .hero-copy, .info-card, .card, .timeline-body, .contact-aside"
  );

  if (prefersReduced) {
    targets.forEach((t) => t.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      }
    },
    { threshold: 0.12 }
  );

  targets.forEach((t) => observer.observe(t));
});

