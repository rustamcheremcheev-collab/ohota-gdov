(function () {
  const header = document.querySelector('[data-site-header]');
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  const navLinks = nav ? [...nav.querySelectorAll('a[href^="#"]')] : [];

  function setNavOpen(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('is-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      setNavOpen(!nav.classList.contains('is-open'));
    });
    navLinks.forEach((link) => {
      link.addEventListener('click', () => setNavOpen(false));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setNavOpen(false);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    const id = anchor.getAttribute('href');
    if (!id || id === '#') return;
    const el = document.querySelector(id);
    if (!el) return;
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const offset = header ? header.offsetHeight : 0;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 60);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const sections = [...document.querySelectorAll('main section[id]')];
  let ticking = false;

  function syncActiveNav() {
    if (!sections.length || !nav) return;
    const fromTop = (header?.offsetHeight || 0) + 48;
    let currentId = sections[0]?.id || '';
    sections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= fromTop && rect.bottom > fromTop) {
        currentId = sec.id;
      }
    });
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === '#' + currentId;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        syncActiveNav();
      });
    },
    { passive: true }
  );

  window.addEventListener('resize', syncActiveNav, { passive: true });
  syncActiveNav();

  // Gallery & Lightbox
  const galleryGrid = document.querySelector('[data-gallery-grid]');
  const galleryLoadMore = document.querySelector('[data-gallery-load-more]');
  const lightbox = document.querySelector('[data-lightbox]');
  const lightboxImg = document.querySelector('[data-lightbox-img]');
  const lightboxCounter = document.querySelector('[data-lightbox-counter]');
  const lightboxClose = document.querySelector('[data-lightbox-close]');
  const lightboxOverlay = document.querySelector('[data-lightbox-overlay]');
  const lightboxPrev = document.querySelector('[data-lightbox-prev]');
  const lightboxNext = document.querySelector('[data-lightbox-next]');

  if (galleryGrid) {
    let visibleCount = 8;
    const allImages = [...galleryGrid.querySelectorAll('img')];
    let currentLightboxIndex = 0;
    let visibleImages = [];

    function updateGalleryVisibility() {
      allImages.forEach((img, idx) => {
        if (idx < visibleCount) {
          img.classList.remove('gallery-hidden');
        } else {
          img.classList.add('gallery-hidden');
        }
      });
      visibleImages = allImages.filter((_, idx) => idx < visibleCount);
      if (galleryLoadMore) {
        galleryLoadMore.style.display = visibleCount >= allImages.length ? 'none' : 'inline-flex';
      }
    }

    function attachImageClickHandlers() {
      visibleImages.forEach((img, idx) => {
        if (!img.hasClickHandler) {
          img.addEventListener('click', () => openLightbox(idx));
          img.hasClickHandler = true;
        }
      });
    }

    function openLightbox(index) {
      currentLightboxIndex = index;
      const img = visibleImages[index];
      if (img && lightbox && lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.setAttribute('aria-hidden', 'false');
        updateCounter();
        document.documentElement.style.overflow = 'hidden';
      }
    }

    function closeLightbox() {
      if (lightbox) {
        lightbox.setAttribute('aria-hidden', 'true');
        document.documentElement.style.overflow = '';
      }
    }

    function updateCounter() {
      if (lightboxCounter) {
        lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${visibleImages.length}`;
      }
    }

    function showImage(index) {
      if (index < 0 || index >= visibleImages.length) return;
      currentLightboxIndex = index;
      const img = visibleImages[index];
      if (lightboxImg) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
      }
      updateCounter();
    }

    updateGalleryVisibility();
    attachImageClickHandlers();

    if (galleryLoadMore) {
      galleryLoadMore.addEventListener('click', () => {
        visibleCount += 8;
        updateGalleryVisibility();
        attachImageClickHandlers();
      });
    }

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxOverlay) {
      lightboxOverlay.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', () => {
        const newIndex = currentLightboxIndex - 1;
        if (newIndex >= 0) showImage(newIndex);
      });
    }

    if (lightboxNext) {
      lightboxNext.addEventListener('click', () => {
        const newIndex = currentLightboxIndex + 1;
        if (newIndex < visibleImages.length) showImage(newIndex);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (lightbox && lightbox.getAttribute('aria-hidden') === 'false') {
        if (e.key === 'ArrowLeft') lightboxPrev?.click();
        if (e.key === 'ArrowRight') lightboxNext?.click();
        if (e.key === 'Escape') closeLightbox();
      }
    });
  }
})();
