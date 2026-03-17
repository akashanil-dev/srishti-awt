/* ── STATE ── */
let currentUser = null;
let pendingEvent = null;
let events = [];

/* ── INIT: load events + restore session ── */
$(document).ready(function () {
  // Check if already logged in — redirect to home
  $.ajax({
    url: 'api/auth/check_session.php',
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      if (response.success) {
        // Already logged in — route by role
        window.location.href = response.data.role === 'admin' ? 'admin-dashboard.html' : 'home.html';
        return;
      }
    }
  });
  loadEvents();
});

function loadEvents() {
  $.ajax({
    url: 'api/events/get_events.php',
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      if (response.success) {
        events = response.data;
        renderEvents();
      }
    },
    error: function () {
      showToast('❌ Failed to load events.');
    }
  });
}

/* ── RENDER EVENTS ── */
function renderEvents() {
  const grid = document.getElementById('eventsGrid');
  const list = events;

  if (!list.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--gray);">No events found.</div>';
    return;
  }

  grid.innerHTML = list.map(e => {
    const seats = parseInt(e.max_participants) || 0;
    const registered = parseInt(e.registered) || 0;
    const pct = seats > 0 ? Math.round((registered / seats) * 100) : 0;
    const left = Math.max(0, seats - registered);
    const full = left <= 0 && seats > 0;

    const fillC = pct >= 90 ? 'danger' : pct >= 70 ? 'warn' : '';
    const leftC = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : 'var(--green)';

    const btnLabel = full ? 'Fully Booked' : currentUser ? 'Register →' : '🔒 Login to Register';
    const btnClass = full ? '' : currentUser ? '' : 'guest';

    // Format the date nicely
    let dateStr = 'TBA';
    if (e.event_date) {
      const d = new Date(e.event_date + 'T00:00:00');
      dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    return `
      <div class="col">
        <div class="card h-100 mb-4 shadow-sm event-card border-0">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title fw-bold event-title text-white">${e.title || 'Untitled Event'}</h5>
            <p class="card-text mb-3 event-desc" style="flex-grow: 1;">${e.description || 'No description available.'}</p>
            <div class="d-flex justify-content-between align-items-center mb-3 event-meta">
              <div class="event-meta-item">
                <svg viewBox="0 0 24 24" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${dateStr}
              </div>
              <div class="event-meta-item">
                <svg viewBox="0 0 24 24" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                ${seats} seats
              </div>
            </div>
            <div class="event-seats mb-3">
              <div class="seats-label">
                <span>Seats filled</span>
                <span style="color:${leftC}; font-weight: 600;">${full ? 'FULL' : left + ' left'}</span>
              </div>
              <div class="seats-track"><div class="seats-fill ${fillC}" style="width:${pct}%"></div></div>
            </div>
            <button class="btn btn-primary w-100 mt-auto ${btnClass}" ${full ? 'disabled' : ''} onclick="handleRegister(${e.id})">${btnLabel}</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

/* ── REGISTER BUTTON ── */
function handleRegister(eventId) {
  if (!currentUser) {
    pendingEvent = eventId;
    openAuthModal('login', true);
  } else {
    openReg(eventId);
  }
}


/* ── AUTH MODAL OPEN / CLOSE ── */
function openAuthModal(mode, fromRegister) {
  document.getElementById('loginView').style.display = mode === 'login' ? 'block' : 'none';
  document.getElementById('signupView').style.display = mode === 'signup' ? 'block' : 'none';
  document.getElementById('authHint').classList.toggle('show', !!fromRegister);
  document.getElementById('authOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeAuth() {
  document.getElementById('authOverlay').classList.remove('open');
  document.body.style.overflow = '';
  clearFormErrors('loginEmail', 'loginPass', 'signupName', 'signupEmail', 'signupPhone', 'signupBranch', 'signupYear', 'signupPass');
}
function closeAuthOutside(e) { if (e.target === document.getElementById('authOverlay')) closeAuth(); }
function switchToSignup() {
  const hint = document.getElementById('authHint').classList.contains('show');
  openAuthModal('signup', hint);
}
function switchToLogin() {
  const hint = document.getElementById('authHint').classList.contains('show');
  openAuthModal('login', hint);
}

/* ── LOGIN SUBMIT ── */
$('#loginForm').on('submit', function (e) {
  e.preventDefault();
  let ok = true;
  ok &= vf('loginEmail', 'loginEmailErr', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Please enter a valid email address.');
  ok &= vf('loginPass', 'loginPassErr', v => v.length > 0, 'Password is required.');
  if (!ok) return;

  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.textContent = 'Logging in…';

  $.ajax({
    url: 'api/auth/login.php',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      email: $('#loginEmail').val().trim(),
      password: $('#loginPass').val()
    }),
    dataType: 'json',
    success: function (response) {
      btn.disabled = false;
      btn.textContent = 'Log In →';
      if (response.success) {
        loginSuccess(response.data);
      } else {
        showFieldError('loginPassErr', response.message);
      }
    },
    error: function () {
      btn.disabled = false;
      btn.textContent = 'Log In →';
      showToast('Network error. Please try again.');
    }
  });
});

/* ── SIGNUP SUBMIT ── */
$('#signupForm').on('submit', function (e) {
  e.preventDefault();
  let ok = true;
  ok &= vf('signupName', 'signupNameErr', v => v.length >= 2, 'Please enter your full name.');
  ok &= vf('signupEmail', 'signupEmailErr', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Please enter a valid email address.');
  ok &= vf('signupPhone', 'signupPhoneErr', v => /^\d{10}$/.test(v), 'Please enter a valid 10-digit phone number.');
  ok &= vf('signupBranch', 'signupBranchErr', v => v !== '', 'Please select your branch.');
  ok &= vf('signupYear', 'signupYearErr', v => v !== '', 'Please select your year of passing.');
  ok &= vf('signupPass', 'signupPassErr', v => v.length >= 8, 'Password must be at least 8 characters.');
  if (!ok) return;

  const btn = document.getElementById('signupBtn');
  btn.disabled = true; btn.textContent = 'Creating account…';

  $.ajax({
    url: 'api/auth/signup.php',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      name: $('#signupName').val().trim(),
      email: $('#signupEmail').val().trim(),
      password: $('#signupPass').val(),
      phone: $('#signupPhone').val().trim(),
      branch: $('#signupBranch').val(),
      year_of_passing: $('#signupYear').val()
    }),
    dataType: 'json',
    success: function (response) {
      btn.disabled = false;
      btn.textContent = 'Create Account →';
      if (response.success) {
        // Auto-login after signup
        $.ajax({
          url: 'api/auth/login.php',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            email: $('#signupEmail').val().trim(),
            password: $('#signupPass').val()
          }),
          dataType: 'json',
          success: function (loginRes) {
            if (loginRes.success) loginSuccess(loginRes.data);
          }
        });
      } else {
        showFieldError('signupEmailErr', response.message);
      }
    },
    error: function () {
      btn.disabled = false;
      btn.textContent = 'Create Account →';
      showToast('Network error. Please try again.');
    }
  });

});

function loginSuccess(user) {
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  closeAuth();
  showToast('👋 Welcome, ' + user.name + '!');
  // Redirect based on role
  const dest = user.role === 'admin' ? 'admin-dashboard.html' : 'home.html';
  setTimeout(() => { window.location.href = dest; }, 500);
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  $.ajax({
    url: 'api/auth/logout.php',
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      updateNav();
      renderEvents();
      showToast('You have been logged out.');
    },
    error: function () {
      updateNav();
      renderEvents();
    }
  });
}

function updateNav() {
  const guest = document.getElementById('navGuest');
  const user = document.getElementById('navUser');
  if (currentUser) {
    guest.style.display = 'none';
    user.classList.add('visible');
    document.getElementById('navUserName').textContent = currentUser.name;
  } else {
    guest.style.display = 'flex';
    user.classList.remove('visible');
  }
}

/* ── REGISTRATION MODAL ── */
function openReg(eventId) {
  populateEventSelect();
  if (eventId) document.getElementById('selectedEvent').value = eventId;
  if (currentUser) {
    document.getElementById('studentName').value = currentUser.name;
    document.getElementById('studentEmail').value = currentUser.email;
  }
  document.getElementById('regOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeReg() {
  document.getElementById('regOverlay').classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('registrationForm').reset();
  clearFormErrors('studentName', 'studentEmail', 'studentPhone', 'selectedEvent');
}
function closeRegOutside(e) { if (e.target === document.getElementById('regOverlay')) closeReg(); }

function populateEventSelect() {
  const sel = document.getElementById('selectedEvent');
  sel.innerHTML = '<option value="">— Choose an event —</option>' +
    events.filter(e => {
      const maxP = parseInt(e.max_participants) || 0;
      const reg = parseInt(e.registered) || 0;
      return maxP - reg > 0;
    }).map(e => `<option value="${e.id}">${e.title}</option>`).join('');
}

$('#registrationForm').on('submit', function (e) {
  e.preventDefault();
  let ok = true;
  ok &= vf('studentName', 'nameErr', v => v.length >= 2, 'Please enter your full name.');
  ok &= vf('studentEmail', 'emailErr', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Please enter a valid email.');
  ok &= vf('studentPhone', 'phoneErr', v => /^\d{10}$/.test(v), 'Please enter a valid 10-digit phone number.');
  ok &= vf('selectedEvent', 'eventErr', v => v !== '', 'Please select an event.');
  if (!ok) return;

  const btn = document.getElementById('submitBtn');
  btn.disabled = true; btn.textContent = 'Submitting…';

  $.ajax({
    url: 'api/events/register_event.php',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({
      event_id: $('#selectedEvent').val()
    }),
    dataType: 'json',
    success: function (response) {
      closeReg();
      btn.disabled = false;
      btn.textContent = 'Complete Registration →';
      showToast(response.success ? '✅ ' + response.message : '⚠️ ' + response.message);
      if (response.success) loadEvents(); // Refresh seat counts
    },
    error: function () {
      btn.disabled = false;
      btn.textContent = 'Complete Registration →';
      showToast('❌ Network error. Please try again.');
    }
  });
});

/* loadParticipants removed — was using undefined selectedEventId */

/* ── HELPERS ── */
function vf(id, errId, check, msg) {
  const $el = $('#' + id);
  const $err = $('#' + errId);
  const val = $el.val() ? $el.val().trim() : '';

  if (!check(val)) {
    $el.addClass('error');
    if (msg) $err.text(msg);
    $err.addClass('show').removeClass('d-none');
    return false;
  }
  $el.removeClass('error');
  $err.removeClass('show').addClass('d-none');
  return true;
}

function showFieldError(errId, msg) {
  const $err = $('#' + errId);
  if ($err.length) {
    if (msg) $err.text(msg);
    $err.addClass('show').removeClass('d-none');
  }
}

function clearFormErrors(...ids) {
  ids.forEach(id => {
    $('#' + id).removeClass('error');
  });
  $('.form-error, .form-text').removeClass('show');
}
function togglePass(inputId, btn) {
  const inp = document.getElementById(inputId);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.style.opacity = inp.type === 'text' ? '0.45' : '1';
}
function showToast(msg) {
  const t = document.getElementById('toast');
  const icon = document.getElementById('toastIcon');
  const msgEl = document.getElementById('toastMsg');

  const successIcon = '<svg viewBox="0 0 24 24" stroke-width="2.5" width="17" height="17" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>';
  const errorIcon = '<svg viewBox="0 0 24 24" stroke-width="2.5" width="17" height="17" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
  const warnIcon = '<svg viewBox="0 0 24 24" stroke-width="2.5" width="17" height="17" fill="none" stroke="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
  const infoIcon = '<svg viewBox="0 0 24 24" stroke-width="2.5" width="17" height="17" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

  let cleanMsg = msg;
  if (msg.startsWith('✅')) {
    cleanMsg = msg.replace(/^✅\s*/, '');
    icon.innerHTML = successIcon;
    t.style.background = 'var(--green)';
    t.style.color = 'var(--black)';
  } else if (msg.startsWith('❌')) {
    cleanMsg = msg.replace(/^❌\s*/, '');
    icon.innerHTML = errorIcon;
    t.style.background = 'var(--red)';
    t.style.color = '#fff';
  } else if (msg.startsWith('⚠️')) {
    cleanMsg = msg.replace(/^⚠️\s*/, '');
    icon.innerHTML = warnIcon;
    t.style.background = 'var(--amber)';
    t.style.color = 'var(--black)';
  } else if (msg.startsWith('👋')) {
    cleanMsg = msg.replace(/^👋\s*/, '');
    icon.innerHTML = infoIcon;
    t.style.background = 'var(--green)';
    t.style.color = 'var(--black)';
  } else {
    icon.innerHTML = infoIcon;
    t.style.background = 'var(--green)';
    t.style.color = 'var(--black)';
  }

  msgEl.textContent = cleanMsg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4000);
}

/* ── SCROLL ANIMATION ── */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
