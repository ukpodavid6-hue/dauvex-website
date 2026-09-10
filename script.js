const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-nav');

const updateHeader = () => header.classList.toggle('is-fixed', window.scrollY > 48);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  mobileMenu.classList.toggle('open', !open);
});

mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
}));

document.querySelector('[data-year]').textContent = new Date().getFullYear();

const contactForm = document.querySelector('.contact-form');
const formStatus = contactForm.querySelector('[data-form-status]');

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formStatus.textContent = 'Sending your enquiry...';
  formStatus.classList.remove('is-error');

  try {
    const response = await fetch(contactForm.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'We could not send your enquiry.');
    }

    window.location.assign('/thank-you');
  } catch (error) {
    formStatus.textContent = error.message;
    formStatus.classList.add('is-error');
  }
});
