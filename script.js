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
  document.querySelector('#year').textContent = new Date().getFullYear();

  const form = document.querySelector('#application-form');
  const status = document.querySelector('#form-status');
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const payload = {
      _subject: `NFC Driver Application - ${data.get('firstName')} ${data.get('lastName')}`,
      _template: 'table',
      _url: window.location.href,
      'First name': data.get('firstName'),
      'Last name': data.get('lastName'),
      'Phone number': data.get('phone'),
      'Email address': data.get('email'),
      'City': data.get('city') || 'Not provided',
      'State': data.get('state') || 'Not provided',
      'Valid Class A CDL': data.get('cdl'),
      'Years of CDL Class A experience': data.get('experience') || 'Not specified',
      'Preferred driving type': data.get('drivingType') || 'Not specified',
      'SMS consent': data.get('smsConsent') ? 'Yes' : 'No',
      'Optional message': data.get('message') || 'None'
    };

    submitButton.disabled = true;
    submitButton.dataset.originalText = submitButton.innerHTML;
    submitButton.textContent = 'Sending application...';
    status.className = 'form-status';
    status.textContent = 'Submitting your application. Please wait.';

    try {
      const response = await fetch('https://formsubmit.co/ajax/recruiting@drivenfc.com', {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok || result.success !== 'true') {
        throw new Error(result.message || `Submission failed (HTTP ${response.status}).`);
      }
      status.textContent = 'Thank you! Your application has been submitted to our recruiting team.';
      status.classList.add('success');
      form.reset();
    } catch (error) {
      console.error('NFC application submission failed:', error);
      const detail = error && error.message ? error.message : 'Network or browser connection error.';
      status.textContent = `Application was not sent: ${detail} If you opened this page as a local file, test from your published HTTPS website. Check recruiting@drivenfc.com for a FormSubmit activation email.`;
      status.classList.add('error');
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = submitButton.dataset.originalText || 'Submit application';
    }
  });
})();