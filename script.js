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

const scriptureReader = document.querySelector('.scriptures-reader');

if (scriptureReader) {
  const bookTabs = [...scriptureReader.querySelectorAll('.book-tab')];
  const bookPanels = [...scriptureReader.querySelectorAll('.book-panel')];
  const pagerLabel = scriptureReader.querySelector('.book-pager-label');
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII'];
  let currentBook = 0;

  const activateBook = (index) => {
    currentBook = (index + bookTabs.length) % bookTabs.length;

    bookTabs.forEach((tab, i) => {
      const isActive = i === currentBook;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      bookPanels[i].hidden = !isActive;
      bookPanels[i].classList.toggle('is-active', isActive);
    });

    if (pagerLabel) {
      pagerLabel.textContent = `${romanNumerals[currentBook]} of ${romanNumerals.length}`;
    }
  };

  bookTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateBook(i));

    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const nextIndex = event.key === 'ArrowRight' ? currentBook + 1 : currentBook - 1;
      const target = (nextIndex + bookTabs.length) % bookTabs.length;
      activateBook(target);
      bookTabs[target].focus();
    });
  });

  scriptureReader.querySelectorAll('.book-pager-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const direction = button.dataset.dir === 'next' ? 1 : -1;
      activateBook(currentBook + direction);
      bookTabs[currentBook].focus();
    });
  });

  window.selectBook = (name) => {
    const index = bookTabs.findIndex((tab) => tab.dataset.book === name);
    if (index > -1) activateBook(index);
  };

  activateBook(0);
}

const verseBand = document.querySelector('.verse-band');

if (verseBand) {
  const slide = verseBand.querySelector('.verse-slide');
  const verseText = slide.querySelector('.verse-text');
  const verseCitation = slide.querySelector('.verse-citation');
  const progressBar = verseBand.querySelector('.verse-progress span');
  const versePool = [...document.querySelectorAll('.book-panel')].flatMap((panel) => {
    const book = (panel.querySelector('.book-header h3') || {}).textContent?.trim() || 'The Book';
    return [...panel.querySelectorAll('.book-verse')].map((verse) => {
      const number = (verse.querySelector('.verse-num') || {}).textContent?.trim() || '1';
      const clone = verse.cloneNode(true);
      clone.querySelector('.verse-num')?.remove();
      return {
        text: clone.textContent.replace(/\s+/g, ' ').trim(),
        citation: `${book}, 1:${number}`,
      };
    });
  });

  const ROTATION_MS = 20000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let currentIndex = -1;
  let fadeToken = 0;
  let timer = null;

  const restartProgress = () => {
    if (!progressBar) return;
    progressBar.style.animation = 'none';
    void progressBar.offsetWidth;
    progressBar.style.animation = '';
  };

  const pickIndex = () => {
    if (versePool.length < 2) return 0;
    let index = Math.floor(Math.random() * versePool.length);
    while (index === currentIndex) {
      index = Math.floor(Math.random() * versePool.length);
    }
    return index;
  };

  const showVerse = (index) => {
    const verse = versePool[index];
    if (!verse) return;
    const token = ++fadeToken;
    currentIndex = index;
    slide.classList.add('is-fading');
    window.setTimeout(() => {
      if (token !== fadeToken) return;
      verseText.textContent = `\u201C${verse.text}\u201D`;
      verseCitation.textContent = verse.citation;
      slide.classList.remove('is-fading');
      restartProgress();
    }, reducedMotion ? 0 : 260);
  };

  const startRotation = () => {
    if (timer) return;
    timer = window.setInterval(() => showVerse(pickIndex()), ROTATION_MS);
  };

  const stopRotation = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  if (versePool.length) {
    showVerse(Math.floor(Math.random() * versePool.length));
    startRotation();
  }

  verseBand.addEventListener('mouseenter', stopRotation);
  verseBand.addEventListener('mouseleave', startRotation);
  verseBand.addEventListener('focusin', stopRotation);
  verseBand.addEventListener('focusout', startRotation);

  verseBand.querySelector('.verse-prev')?.addEventListener('click', () => {
    stopRotation();
    showVerse(pickIndex());
    startRotation();
  });

  verseBand.querySelector('.verse-next')?.addEventListener('click', () => {
    stopRotation();
    showVerse(pickIndex());
    startRotation();
  });
}

document.querySelectorAll('.doctrine-link').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    if (window.selectBook) window.selectBook(link.dataset.book);
    const target = document.getElementById('scriptures');
    if (target) {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  });
});
