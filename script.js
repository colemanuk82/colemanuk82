const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('#primary-nav');
const navLinks = document.querySelectorAll('.primary-nav a');
const mailingForm = document.querySelector('#mailing-form');
const formNote = document.querySelector('#form-note');
const year = document.querySelector('#current-year');

if (year) {
  year.textContent = new Date().getFullYear();
}

if (menuToggle && primaryNav) {
  const closeMenu = () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    primaryNav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    primaryNav.classList.toggle('is-open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('click', (event) => {
    if (!primaryNav.contains(event.target) && !menuToggle.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

const sectionLinks = [...navLinks].filter((link) => link.hash && document.getElementById(link.hash.slice(1)));

if (sectionLinks.length && 'IntersectionObserver' in window) {
  const visibleSections = new Map();
  const sections = sectionLinks.map((link) => document.getElementById(link.hash.slice(1)));

  const updateActiveLink = () => {
    const currentSection = [...visibleSections.entries()].sort((a, b) => a[1] - b[1])[0]?.[0];

    if (!currentSection) return;

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.hash === `#${currentSection}`);
    });
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visibleSections.set(entry.target.id, entry.boundingClientRect.top);
      } else {
        visibleSections.delete(entry.target.id);
      }
    });

    updateActiveLink();
  }, { rootMargin: '-24% 0px -60% 0px' });

  sections.forEach((section) => sectionObserver.observe(section));
}

if (mailingForm && formNote) {
  mailingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const emailInput = mailingForm.querySelector('input[type="email"]');

    if (!emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }

    formNote.textContent = 'You are on the list. See you Sunday.';
    formNote.classList.add('success');
    mailingForm.reset();
  });
}
