// Prima Vista — Bio Reinigung: interactions
// Icons, sticky-header shadow, mobile drawer, scroll-reveal, contact-form validation.

// Icons (Lucide UMD loaded from CDN before this script)
if (window.lucide) lucide.createIcons();

// Sticky header shadow
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Mobile menu
const toggle = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
toggle.addEventListener('click', () => {
  const open = mobileNav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
});
mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileNav.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

// Scroll reveal
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = (Math.min(i % 4, 3) * 60) + 'ms';
  io.observe(el);
});

// Form validation
const form = document.getElementById('contactForm');
const success = document.getElementById('formSuccess');
const validators = {
  name: v => v.trim().length > 1,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  message: v => v.trim().length > 4,
};
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let ok = true;
  Object.keys(validators).forEach(id => {
    const input = document.getElementById(id);
    const field = input.closest('.field');
    const valid = validators[id](input.value);
    field.classList.toggle('invalid', !valid);
    if (!valid) ok = false;
  });
  if (ok) {
    form.reset();
    success.classList.add('show');
    setTimeout(() => success.classList.remove('show'), 5000);
  }
});
form.querySelectorAll('input, textarea').forEach(el => {
  el.addEventListener('input', () => el.closest('.field').classList.remove('invalid'));
});
