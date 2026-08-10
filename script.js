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

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
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
