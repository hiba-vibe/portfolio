/**
 * main.js — Hiba Khan Portfolio
 * Works for both index.html and projects.html
 * ─────────────────────────────────────────────
 * 1. Sticky header scroll class
 * 2. Mobile hamburger toggle
 * 3. Active nav link highlight (IntersectionObserver)
 * 4. Auto-sliding project slider with dots
 * 5. Scroll reveal animations
 * 6. Project card click-to-navigate
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ═══════════════════════════════════════════════════════════
     1. HEADER — add shadow when scrolled
  ═══════════════════════════════════════════════════════════ */
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 10) {
        header.style.borderBottomColor = 'rgba(229,192,123,0.2)';
      } else {
        header.style.borderBottomColor = '';
      }
    }, { passive: true });
  }


  /* ═══════════════════════════════════════════════════════════
     2. MOBILE HAMBURGER
  ═══════════════════════════════════════════════════════════ */
  const hamburger = document.getElementById('hamburger');
  const navList   = document.getElementById('navList');

  if (hamburger && navList) {
    hamburger.addEventListener('click', () => {
      const open = navList.classList.toggle('open');
      hamburger.classList.toggle('open', open);
    });

    /* Close when a link is clicked */
    navList.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        navList.classList.remove('open');
        hamburger.classList.remove('open');
      });
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        navList.classList.remove('open');
        hamburger.classList.remove('open');
      }
    });
  }


  /* ═══════════════════════════════════════════════════════════
     3. ACTIVE NAV LINK (only on index.html)
  ═══════════════════════════════════════════════════════════ */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  if (sections.length && navLinks.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove('active'));
          const match = document.querySelector(
            `.nav__link[href="#${entry.target.id}"]`
          );
          if (match) match.classList.add('active');
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px' });

    sections.forEach(s => io.observe(s));
  }


  /* ═══════════════════════════════════════════════════════════
     4. AUTO-SLIDING PROJECT SLIDER
     ─────────────────────────────────────────────────────────
     HOW IT WORKS:
     • All project cards sit in a flex row (.slider)
     • We translate that row left/right by one card-width
     • Auto-advances every 3.5 seconds
     • Clicking a dot jumps to that position
     • Loops back to the start at the end
  ═══════════════════════════════════════════════════════════ */
  const slider     = document.getElementById('mainSlider');
  const dotsWrap   = document.getElementById('sliderDots');

  if (slider && dotsWrap) {
    const cards      = slider.querySelectorAll('.proj-card');
    const total      = cards.length;

    /* How many cards visible at once depends on viewport */
    function getVisible() {
      if (window.innerWidth <= 620)  return 1;
      if (window.innerWidth <= 900)  return 2;
      return 3;
    }

    let current  = 0;
    let autoTimer;

    /* Number of "pages" = total cards - visible + 1  */
    function pageCount() {
      return Math.max(1, total - getVisible() + 1);
    }

    /* Build dot buttons */
    function buildDots() {
      dotsWrap.innerHTML = '';
      for (let i = 0; i < pageCount(); i++) {
        const btn = document.createElement('button');
        btn.className = 'slider-dot' + (i === current ? ' active' : '');
        btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
        btn.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(btn);
      }
    }

    /* Move slider to position `index` */
    function goTo(index) {
      current = Math.max(0, Math.min(index, pageCount() - 1));

      /* Calculate pixel offset — one card width + gap (16px) */
      const cardW = cards[0].getBoundingClientRect().width;
      const offset = current * (cardW + 16);
      slider.style.transform = `translateX(-${offset}px)`;

      /* Update dots */
      dotsWrap.querySelectorAll('.slider-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    /* Auto-advance */
    function startAuto() {
      stopAuto();
      autoTimer = setInterval(() => {
        goTo(current + 1 < pageCount() ? current + 1 : 0);
      }, 3500);
    }

    function stopAuto() {
      clearInterval(autoTimer);
    }

    /* Pause on hover */
    slider.addEventListener('mouseenter', stopAuto);
    slider.addEventListener('mouseleave', startAuto);

    /* Rebuild on resize */
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        current = 0;
        buildDots();
        goTo(0);
      }, 200);
    });

    /* Init */
    buildDots();
    goTo(0);
    startAuto();
  }


  /* ═══════════════════════════════════════════════════════════
     5. SCROLL REVEAL
  ═══════════════════════════════════════════════════════════ */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    const revealIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealIO.observe(el));
  }


  /* ═══════════════════════════════════════════════════════════
     6. PROJECT CARD CLICK-TO-NAVIGATE
     ─────────────────────────────────────────────────────────
     HOW TO CHANGE A PROJECT LINK:
     Open index.html or projects.html → find the <article> tag
     for the project → change  data-href="YOUR_URL"  to your
     actual deployed URL. Also update the <a href="..."> links
     inside the card for Live and GitHub buttons.
  ═══════════════════════════════════════════════════════════ */
  document.querySelectorAll('.proj-card[data-href]').forEach(card => {
    const href = card.getAttribute('data-href');
    if (!href || href.includes('YOUR_')) return;

    card.addEventListener('click', e => {
      if (e.target.closest('.proj-card__link, .proj-link')) return;
      window.open(href, '_blank', 'noopener,noreferrer');
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter') window.open(href, '_blank', 'noopener,noreferrer');
    });
  });

});
