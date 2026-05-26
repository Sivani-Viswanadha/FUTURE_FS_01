/* ============================================
   V. Sai Sivani — Portfolio Interactions
   ============================================ */

// ---------- Theme Toggle ----------
const themeToggle = document.getElementById('themeToggle');
const root = document.documentElement;

// Load saved preference (default = dark)
const savedTheme = localStorage.getItem('theme') || 'dark';
root.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = root.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ---------- Mobile Menu ----------
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ---------- Navbar scroll state ----------
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 30;
  navbar.classList.toggle('scrolled', scrolled);
  backToTop.classList.toggle('visible', window.scrollY > 500);
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ---------- Reveal on scroll ----------
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => observer.observe(el));

// ---------- Project card glow follow ----------
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mx', x + '%');
    card.style.setProperty('--my', y + '%');
  });
});

// ---------- Message form (backend API) ----------
// The form sends a POST request to our Express backend (backend/server.js).
// When deploying, change API_URL to your deployed backend URL.
const API_URL = 'https://future-fs-01-akj4.onrender.com';

const messageForm = document.getElementById('messageForm');
const formStatus = document.getElementById('formStatus');

if (messageForm) {
  messageForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // stop the browser from reloading the page

    const name = messageForm.name.value.trim();
    const email = messageForm.email.value.trim();
    const message = messageForm.message.value.trim();

    // Client-side validation (the server validates again, just in case)
    if (!name || !email || !message) {
      formStatus.textContent = 'Please fill out all fields.';
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      formStatus.textContent = 'Please enter a valid email address.';
      return;
    }

    const submitBtn = messageForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    try {
      // Loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      formStatus.textContent = 'Sending...';

      // Send the data to the backend as JSON
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        formStatus.textContent = 'Message sent successfully!';
        messageForm.reset();
      } else {
        formStatus.textContent = 'Failed to send message.';
      }
    } catch (err) {
      // Network error / backend not running
      formStatus.textContent = 'Failed to send message.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
}

// ---------- Year ----------
document.getElementById('year').textContent = new Date().getFullYear();
