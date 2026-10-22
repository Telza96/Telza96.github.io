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
