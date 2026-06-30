// Import CSS stylesheet for Vite bundling
import './tokens.css';
import './style.css';
import './polish.css';
import { setSession } from './api/authSession';

document.addEventListener('DOMContentLoaded', () => {
  setupPasswordToggle();
  setupFormSubmission();
});

/**
 * Handles toggling the password input type and updating the eye/eye-slash icons.
 */
function setupPasswordToggle() {
  const passwordInput = document.getElementById('password');
  const toggleBtn = document.getElementById('toggle-password');

  if (!passwordInput || !toggleBtn) return;

  const eyeOpenSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  `;

  const eyeClosedSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
      <line x1="2" y1="2" x2="22" y2="22"/>
    </svg>
  `;

  let isPasswordVisible = false;

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isPasswordVisible = !isPasswordVisible;

    if (isPasswordVisible) {
      passwordInput.type = 'text';
      toggleBtn.innerHTML = eyeClosedSvg;
      toggleBtn.setAttribute('aria-label', 'Hide password');
    } else {
      passwordInput.type = 'password';
      toggleBtn.innerHTML = eyeOpenSvg;
      toggleBtn.setAttribute('aria-label', 'Show password');
    }

    passwordInput.focus();
  });
}

/**
 * Validates and provides dynamic visual feedback on form submission.
 */
function setupFormSubmission() {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const form = signupForm || loginForm;
  const submitBtn = document.getElementById('submit-btn');

  if (!form || !submitBtn) return;

  const isLogin = Boolean(loginForm);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const fullnameEl = document.getElementById('fullname');
    const fullname = fullnameEl?.value;
    const activationToken = new URLSearchParams(window.location.search).get('token');

    if (!activationToken && !email) return;
    if (!isLogin && !activationToken && !fullname) return;

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    submitBtn.style.opacity = '0.85';

    const resetBtn = () => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      submitBtn.style.opacity = '';
    };

    // Activation: signup page opened with ?token= (from an admin's activation link).
    if (activationToken) {
      try {
        const res = await fetch('/api/auth/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: activationToken, password: password ?? '', displayName: fullname || undefined }),
        });
        if (!res.ok) {
          showLoginError((await res.text()) || 'Activation failed.');
          resetBtn();
          return;
        }
        const result = await res.json();
        if (!result || !result.accessToken || !result.user) {
          showLoginError('Unexpected server response. Please try again.');
          resetBtn();
          return;
        }
        setSession(result);
        window.location.assign('/assessments');
      } catch {
        showLoginError('Could not reach the server. Please try again.');
        resetBtn();
      }
      return;
    }

    if (isLogin) {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: password ?? '' }),
        });
        if (!res.ok) {
          const msg = (await res.text()) || 'Invalid email or password.';
          showLoginError(msg);
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          submitBtn.style.opacity = '';
          return;
        }
        const result = await res.json();
        if (!result || !result.accessToken || !result.refreshToken || !result.user) {
          showLoginError('Unexpected server response. Please try again.');
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
          submitBtn.style.opacity = '';
          return;
        }
        setSession(result);
        const isAdmin = result.user?.role === 'Admin' || result.user?.role === 'SuperAdmin';
        window.location.assign(isAdmin ? '/dashboard' : '/assessments');
      } catch {
        showLoginError('Could not reach the server. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        submitBtn.style.opacity = '';
      }
      return;
    }

    // Signup remains a request-access stub for now.
    console.log(`Account successfully requested for ${fullname} (${email})`);
    submitBtn.textContent = 'Submitted';
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      submitBtn.style.opacity = '';
    }, 2000);
  });
}

function showLoginError(message) {
  let el = document.getElementById('login-error');
  if (!el) {
    el = document.createElement('p');
    el.id = 'login-error';
    el.setAttribute('role', 'alert');
    el.className = 'auth-error';
    const form = document.getElementById('login-form') || document.getElementById('signup-form');
    form?.prepend(el);
  }
  el.textContent = message;
}
