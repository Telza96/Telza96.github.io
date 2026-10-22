(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  }));
  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Accessible hero photo slideshow. Tone is set per photo so the overlay text
  // stays white on darker photos and switches to black on lighter photos.
  const visual = document.querySelector('.hero-visual');
  const slides = [...(visual?.querySelectorAll('.visual-slide') || [])];
  const dots = [...(visual?.querySelectorAll('.visual-dot') || [])];
  if (visual && slides.length > 1) {
    let activeSlide = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));
    let intervalId;
    const showSlide = index => {
      activeSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === activeSlide));
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === activeSlide);
        dot.setAttribute('aria-pressed', String(i === activeSlide));
      });
      visual.dataset.tone = slides[activeSlide].dataset.tone || 'dark';
    };
    const stopSlideshow = () => { if (intervalId) window.clearInterval(intervalId); };
    const startSlideshow = () => {
      stopSlideshow();
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        intervalId = window.setInterval(() => showSlide(activeSlide + 1), 5000);
      }
    };
    dots.forEach((dot, i) => dot.addEventListener('click', () => { showSlide(i); startSlideshow(); }));
    visual.addEventListener('mouseenter', stopSlideshow);
    visual.addEventListener('mouseleave', startSlideshow);
    visual.addEventListener('focusin', stopSlideshow);
    visual.addEventListener('focusout', startSlideshow);
    showSlide(activeSlide);
    startSlideshow();
  }

  const form = document.querySelector('#application-form');
  const status = document.querySelector('#form-status');
  const submitButton = form?.querySelector('button[type="submit"]');
  const pageLoadedAt = Date.now();

  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const originalButtonText = submitButton?.innerHTML || 'Submit application';
    const formData = new FormData(form);
    formData.set('_ts', String(pageLoadedAt));
    formData.set('_subject', `NFC Driver Application - ${formData.get('firstName') || ''} ${formData.get('lastName') || ''}`.trim());

    if (status) {
      status.textContent = 'Submitting your application…';
      status.classList.remove('success', 'error');
    }
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting…';
    }

    try {
      const response = await fetch('https://formsubmit.app/f/f2rxe3bkrh', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
      });
      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error('The form service returned an unexpected response. Please try again or email recruiting@drivenfc.com.');
      }
      if (!response.ok || !result.ok) {
        const message = result?.error?.message || result?.message || 'The submission was not accepted.';
        throw new Error(message);
      }

      form.reset();
      if (status) {
        status.textContent = 'Thank you! Your application has been submitted to our recruiting team.';
        status.classList.add('success');
      }
    } catch (error) {
      if (status) {
        status.textContent = `We couldn’t submit your application: ${error.message || 'Please try again.'} You can also email recruiting@drivenfc.com directly.`;
        status.classList.add('error');
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }
    }
  });
})();
