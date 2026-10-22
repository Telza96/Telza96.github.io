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
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const fields = [
      ['First name', data.get('firstName')],
      ['Last name', data.get('lastName')],
      ['Phone number', data.get('phone')],
      ['Email address', data.get('email')],
      ['City', data.get('city') || 'Not provided'],
      ['State', data.get('state') || 'Not provided'],
      ['Valid Class A CDL', data.get('cdl')],
      ['Years of CDL Class A experience', data.get('experience') || 'Not specified'],
      ['Preferred driving type', data.get('drivingType') || 'Not specified'],
      ['SMS consent', data.get('smsConsent') ? 'Yes' : 'No'],
      ['Optional message', data.get('message') || 'None']
    ];
    const body = fields.map(([label, value]) => `${label}: ${value}`).join('\n');
    const subject = `NFC Driver Application - ${data.get('firstName')} ${data.get('lastName')}`;
    const mailto = `mailto:recruiting@drivenfc.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Opening your email app with the application details. Please review and press Send to submit it.';
    window.location.href = mailto;
  });
})();