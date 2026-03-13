/* ============================================
   AGENCY PRESENTATION — Navigation Engine
   Right arrow advances, Left arrow goes back
   F key toggles fullscreen
   ============================================ */

(function () {
  'use strict';

  let currentSlide = 0;
  let currentStep = 0;
  let slides = [];
  let totalSlides = 0;

  // --- Initialize ---
  function init() {
    slides = Array.from(document.querySelectorAll('.slide'));
    totalSlides = slides.length;
    if (totalSlides === 0) return;

    // Check URL hash for initial slide/step (e.g., #slide=2&step=1)
    let initSlide = 0, initStep = 0;
    const hash = window.location.hash.substring(1);
    if (hash) {
      const params = new URLSearchParams(hash);
      if (params.has('slide')) initSlide = Math.max(0, Math.min(parseInt(params.get('slide')) || 0, totalSlides - 1));
      if (params.has('step')) initStep = parseInt(params.get('step')) || 0;
    }

    // Show initial slide
    showSlide(initSlide, initStep);
    updateUI();

    // Hide nav hint after 4 seconds
    const hint = document.querySelector('.nav-hint');
    if (hint) {
      setTimeout(() => hint.classList.add('hidden'), 4000);
    }
  }

  // --- Get unique animation steps for a slide ---
  function getUniqueSteps(slideEl) {
    const allSteps = slideEl.querySelectorAll('.anim-step');
    // Filter out steps that are children of other anim-steps (avoid nested duplicates)
    return Array.from(allSteps).filter(step => {
      let parent = step.parentElement;
      while (parent && parent !== slideEl) {
        if (parent.classList && parent.classList.contains('anim-step')) {
          return false; // This step is nested inside another anim-step
        }
        parent = parent.parentElement;
      }
      return true;
    });
  }

  // --- Show a specific slide at a specific step ---
  function showSlide(index, step) {
    if (index < 0 || index >= totalSlides) return;

    // Hide all slides
    slides.forEach(s => s.classList.remove('active'));

    // Show target slide
    slides[index].classList.add('active');
    currentSlide = index;

    // Handle animation steps
    const steps = getUniqueSteps(slides[index]);
    steps.forEach((s, i) => {
      if (i < step) {
        s.classList.add('visible');
      } else {
        s.classList.remove('visible');
      }
    });
    currentStep = step;

    // Update URL hash
    window.location.hash = `slide=${index}&step=${step}`;

    updateUI();
  }

  // --- Advance (right arrow) ---
  function advance() {
    const steps = getUniqueSteps(slides[currentSlide]);

    if (currentStep < steps.length) {
      // Reveal next animation step
      steps[currentStep].classList.add('visible');
      currentStep++;
      window.location.hash = `slide=${currentSlide}&step=${currentStep}`;
      updateUI();
    } else if (currentSlide < totalSlides - 1) {
      // Move to next slide
      showSlide(currentSlide + 1, 0);
    }
  }

  // --- Go back (left arrow) ---
  function goBack() {
    if (currentStep > 0) {
      // Hide current animation step
      currentStep--;
      const steps = getUniqueSteps(slides[currentSlide]);
      steps[currentStep].classList.remove('visible');
      window.location.hash = `slide=${currentSlide}&step=${currentStep}`;
      updateUI();
    } else if (currentSlide > 0) {
      // Go to previous slide, show all steps
      const prevSteps = getUniqueSteps(slides[currentSlide - 1]);
      showSlide(currentSlide - 1, prevSteps.length);
    }
  }

  // --- Update progress bar, counter, step indicator ---
  function updateUI() {
    // Progress bar
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
      const steps = getUniqueSteps(slides[currentSlide]);
      const totalStepsAllSlides = slides.reduce((sum, s) => sum + getUniqueSteps(s).length + 1, 0);
      let completedSteps = 0;
      for (let i = 0; i < currentSlide; i++) {
        completedSteps += getUniqueSteps(slides[i]).length + 1;
      }
      completedSteps += currentStep;
      const progress = (completedSteps / totalStepsAllSlides) * 100;
      progressBar.style.width = progress + '%';
    }

    // Slide counter
    const counter = document.querySelector('.slide-counter');
    if (counter) {
      counter.textContent = (currentSlide + 1) + ' / ' + totalSlides;
    }

    // Step indicator dots
    const stepIndicator = document.querySelector('.step-indicator');
    if (stepIndicator) {
      const steps = getUniqueSteps(slides[currentSlide]);
      if (steps.length > 0) {
        stepIndicator.innerHTML = '';
        for (let i = 0; i < steps.length; i++) {
          const dot = document.createElement('div');
          dot.className = 'dot' + (i < currentStep ? ' active' : '');
          stepIndicator.appendChild(dot);
        }
        stepIndicator.style.display = 'flex';
      } else {
        stepIndicator.style.display = 'none';
      }
    }
  }

  // --- Toggle fullscreen ---
  function toggleFullscreen() {
    const elem = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement) {
      // Enter fullscreen
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
    }
  }

  // --- Keyboard navigation ---
  document.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowRight':
      case ' ':
        e.preventDefault();
        advance();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        goBack();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'Home':
        e.preventDefault();
        showSlide(0, 0);
        break;
      case 'End':
        e.preventDefault();
        const lastSteps = getUniqueSteps(slides[totalSlides - 1]);
        showSlide(totalSlides - 1, lastSteps.length);
        break;
    }
  });

  // --- Touch/swipe support ---
  let touchStartX = 0;
  let touchEndX = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });

  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });

  function handleSwipe() {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe left -> advance
      advance();
    } else if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe right -> go back
      goBack();
    }
  }

  // --- Initialize on DOM ready ---
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
