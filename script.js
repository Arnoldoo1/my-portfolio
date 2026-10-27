// script.js - JavaScript for Arnold Nyamongo's portfolio
// Works with the original index.html: you only need to add the script tag (see below).

// 1. FOOTER YEAR: shows the current year automatically
const footerText = document.querySelector('footer p');
if (footerText) {
    const year = new Date().getFullYear();
    footerText.innerHTML = '&copy; ' + year + ' Arnold Nyamongo. All rights reserved.';
}

// 2. SMOOTH SCROLLING: nav links glide to their section
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const navLinks = document.querySelectorAll('nav a');

navLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
        }
    });
});

// 3. ACTIVE LINK: highlights the nav link of the section you are viewing
const sections = document.querySelectorAll('main section');

window.addEventListener('scroll', function () {
    let current = '';
    sections.forEach(function (section) {
        if (window.scrollY >= section.offsetTop - 150) {
            current = section.id;
        }
    });
    navLinks.forEach(function (link) {
        // CSS: nav a.active { font-weight: bold; text-decoration: underline; }
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
});

// 4. CONTACT FORM VALIDATION
const form = document.querySelector('form');

if (form) {
    form.noValidate = true; // we show our own messages instead of the browser's

    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const messageInput = form.querySelector('#message');

    // Message line shown under the button
    const statusLine = document.createElement('p');
    statusLine.setAttribute('role', 'status');
    form.appendChild(statusLine);

    // Shows (or clears) an error under one field. Returns true when the field is valid.
    function setError(input, message) {
        let error = input.nextElementSibling;
        if (!error || !error.classList.contains('error')) {
            error = document.createElement('span');
            error.className = 'error';
            error.style.color = '#d32f2f';
            error.style.display = 'block';
            input.insertAdjacentElement('afterend', error);
        }
        error.textContent = message;
        input.style.borderColor = message ? '#d32f2f' : '';
        input.setAttribute('aria-invalid', message ? 'true' : 'false');
        return message === '';
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // stops the page from reloading

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const nameOk = setError(nameInput, name.length < 2 ? 'Please enter your name.' : '');
        const emailOk = setError(emailInput, emailPattern.test(email) ? '' : 'Please enter a valid email address.');
        const messageOk = setError(messageInput, message.length < 10 ? 'Please write at least 10 characters.' : '');

        if (!(nameOk && emailOk && messageOk)) {
            statusLine.textContent = 'Please fix the errors above.';
            return;
        }

        // Valid: send the message and show the result
        sendToInbox(form, { name: name, email: email, message: message }, statusLine);
    });
}


// ===== Sends the form to your inbox and shows a clear message =====
// Uses FormSubmit (no account). First time only: click the activation link they email you.
function sendToInbox(form, data, statusEl) {
    const button = form.querySelector('button[type="submit"]');
    const GREEN = '#22c55e', RED = '#e5484d';

    function show(text, ok) {
        statusEl.textContent = text;
        statusEl.style.color = ok ? GREEN : RED;
        statusEl.style.fontWeight = '600';
    }

    if (location.protocol === 'file:') {
        show('Please open this page through http://localhost:8000 (run: python3 -m http.server 8000), not by double-clicking the file.', false);
        return;
    }

    button.disabled = true;
    statusEl.style.color = '';
    statusEl.style.fontWeight = '';
    statusEl.textContent = 'Sending your message...';

    fetch('https://formsubmit.co/ajax/arnoldnyams@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
            name: data.name,
            email: data.email,
            message: data.message,
            _subject: 'New portfolio message from ' + data.name
        })
    })
    .then(function (response) { return response.json(); })
    .then(function (result) {
        if (result.success === true || result.success === 'true') {
            form.reset();
            show('Thank you, ' + data.name.split(' ')[0] + '! Your message has been sent successfully. I will get back to you as soon as I can.', true);
        } else if (/activat/i.test(result.message || '')) {
            show('Almost there! This form needs a one-time activation. Check arnoldnyams@gmail.com (and Spam) for an email from FormSubmit, click the link, then send again.', false);
        } else {
            throw new Error(result.message || 'Not accepted');
        }
    })
    .catch(function (error) {
        console.error('Form error:', error);
        show('Sorry, your message could not be sent. Please email arnoldnyams@gmail.com directly.', false);
    })
    .finally(function () { button.disabled = false; });
}