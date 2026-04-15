
document.addEventListener('DOMContentLoaded', function () {

  const menuToggle = document.getElementById('menuToggle');
  const navDrawer = document.getElementById('navDrawer');

  menuToggle.addEventListener('click', function () {
    navDrawer.classList.toggle('open');
    const isOpen = navDrawer.classList.contains('open');

    const spans = menuToggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  document.addEventListener('click', function (e) {
    if (!menuToggle.contains(e.target) && !navDrawer.contains(e.target)) {
      navDrawer.classList.remove('open');
      const spans = menuToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  const slideRail = document.getElementById('slideRail');
  const pagingBubbles = document.getElementById('pagingBubbles');
  const arrowBack = document.getElementById('arrowBack');
  const arrowForward = document.getElementById('arrowForward');

  if (!slideRail) return;

  const originalCards = Array.from(slideRail.children);
  const totalOriginal = originalCards.length;

  const cloneCount = getVisibleCount();

  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  let visibleCount = getVisibleCount();
  let activeSlide = 0;
  let slideLocked = false;

  function buildDots() {
    pagingBubbles.innerHTML = '';
    for (let i = 0; i < totalOriginal; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot' + (i === activeSlide ? ' active' : '');
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', function () {
        if (!slideLocked) goTo(i);
      });
      pagingBubbles.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = pagingBubbles.querySelectorAll('.carousel__dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === activeSlide));
  }

  function getCardWidth() {
    const card = slideRail.children[0];
    if (!card) return 0;
    const style = getComputedStyle(slideRail);
    const gap = parseFloat(style.gap) || 20;
    return card.offsetWidth + gap;
  }

  function setTrackPosition(index, animate) {
    const cardW = getCardWidth();
    const offset = index * cardW;
    if (!animate) {
      slideRail.style.transition = 'none';
    } else {
      slideRail.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
    slideRail.style.transform = 'translateX(-' + offset + 'px)';
  }

  function cloneCards() {
    const oldClones = slideRail.querySelectorAll('.clone');
    oldClones.forEach(c => c.remove());

    visibleCount = getVisibleCount();
    const cards = Array.from(slideRail.children);

    for (let i = totalOriginal - visibleCount; i < totalOriginal; i++) {
      const clone = cards[i].cloneNode(true);
      clone.classList.add('clone');
      slideRail.insertBefore(clone, slideRail.firstChild);
    }

    for (let i = 0; i < visibleCount; i++) {
      const clone = cards[i].cloneNode(true);
      clone.classList.add('clone');
      slideRail.appendChild(clone);
    }

    setTrackPosition(visibleCount + activeSlide, false);
  }

  function goTo(index) {
    if (slideLocked) return;
    activeSlide = index;
    slideLocked = true;
    setTrackPosition(visibleCount + activeSlide, true);
    updateDots();
    setTimeout(() => { slideLocked = false; }, 460);
  }

  function goNext() {
    if (slideLocked) return;
    slideLocked = true;
    const nextLogical = visibleCount + activeSlide + 1;
    slideRail.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    const cardW = getCardWidth();
    slideRail.style.transform = 'translateX(-' + (nextLogical * cardW) + 'px)';

    slideRail.addEventListener('transitionend', function handler() {
      slideRail.removeEventListener('transitionend', handler);
      activeSlide = (activeSlide + 1) % totalOriginal;
      setTrackPosition(visibleCount + activeSlide, false);
      updateDots();
      slideLocked = false;
    });
  }

  function goPrev() {
    if (slideLocked) return;
    slideLocked = true;
    const prevLogical = visibleCount + activeSlide - 1;
    slideRail.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    const cardW = getCardWidth();
    slideRail.style.transform = 'translateX(-' + (prevLogical * cardW) + 'px)';

    slideRail.addEventListener('transitionend', function handler() {
      slideRail.removeEventListener('transitionend', handler);
      activeSlide = (activeSlide - 1 + totalOriginal) % totalOriginal;
      setTrackPosition(visibleCount + activeSlide, false);
      updateDots();
      slideLocked = false;
    });
  }

  arrowBack.addEventListener('click', goPrev);
  arrowForward.addEventListener('click', goNext);

  let autoScroll = setInterval(goNext, 4000);

  const carousel = document.getElementById('carousel');
  carousel.addEventListener('mouseenter', () => clearInterval(autoScroll));
  carousel.addEventListener('mouseleave', () => { autoScroll = setInterval(goNext, 4000); });

  let touchStartX = 0;
  carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext(); else goPrev();
    }
  }, { passive: true });

  buildDots();
  cloneCards();

  let resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      cloneCards();
      buildDots();
      updateDots();
    }, 200);
  });

  const dateMatrix = document.querySelector('.cal-grid');
  if (dateMatrix) {
    dateMatrix.addEventListener('click', function (e) {
      const day = e.target.closest('.cal-day--available');
      if (!day) return;
      const prev = dateMatrix.querySelector('.cal-day--selected');
      if (prev) {
        prev.classList.remove('cal-day--selected');
        prev.classList.add('cal-day--available');
      }
      day.classList.remove('cal-day--available');
      day.classList.add('cal-day--selected');
    });
  }

  const durationBtns = document.querySelectorAll('.duration-btn');
  durationBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      durationBtns.forEach(b => b.classList.remove('duration-btn--active'));
      this.classList.add('duration-btn--active');
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navDrawer.classList.remove('open');
      }
    });
  });

  const revealEls = document.querySelectorAll(
    '.feature-card, .testimonial-card, .open-source__text, .open-source__visual, .os-stat'
  );

  const revealStyle = document.createElement('style');
  revealStyle.textContent = `
    .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.5s ease, transform 0.5s ease; }
    .reveal.visible { opacity: 1; transform: translateY(0); }
  `;
  document.head.appendChild(revealStyle);

  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = (i % 3) * 0.08 + 's';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => observer.observe(el));

});
