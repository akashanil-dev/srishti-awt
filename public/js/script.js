/* ── STATE ── */
let currentUser = null;
let pendingEvent = null;
let events = [];

/* ── INIT: load events + restore session ── */
$(document).ready(function() {
    // Check if already logged in — redirect to home
    $.ajax({
        url: 'api/auth/check_session.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
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
        success: function(response) {
            if (response.success) {
                events = response.data;
                renderEvents('all');
            }
        },
        error: function() {
            showToast('❌ Failed to load events.');
        }
    });
}

/* ── RENDER EVENTS ── */
function renderEvents(filter) {
  const grid = document.getElementById('eventsGrid');
  const list = (filter === 'all') ? events : events.filter(e => e.cat === filter);
  
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
      <div class="event-card">
        <div class="event-title">${e.title || 'Untitled Event'}</div>
        
        <div class="event-desc">${e.description || 'No description available.'}</div>
        
        <div class="event-meta">
          <div class="event-meta-item"><svg viewBox="0 0 24 24" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${dateStr}</div>
          <div class="event-meta-item"><svg viewBox="0 0 24 24" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>${seats} seats</div>
        </div>
        
        <div class="event-seats">
          <div class="seats-label"><span>Seats filled</span><span style="color:${leftC}">${full ? 'FULL' : left + ' left'}</span></div>
          <div class="seats-track"><div class="seats-fill ${fillC}" style="width:${pct}%"></div></div>
        </div>
        
        <button class="btn-register ${btnClass}" ${full ? 'disabled' : ''} onclick="handleRegister(${e.id})">${btnLabel}</button>
      </div>`;
  }).join('');
}

function filterEvents(cat, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderEvents(cat);
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
document.getElementById('loginForm').addEventListener('submit', function (e) {
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
document.getElementById('signupForm').addEventListener('submit', function (e) {
  e.preventDefault();
  let ok = true;
  ok &= vf('signupName', 'signupNameErr', v => v.length >= 2, 'Please enter your full name.');
  ok &= vf('signupEmail', 'signupEmailErr', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Please enter a valid email address.');
  ok &= vf('signupPhone', 'signupPhoneErr', v => /^[\d\s\+\-]{7,15}$/.test(v), 'Please enter a valid phone number.');
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
      renderEvents('all');
      showToast('You have been logged out.');
    },
    error: function() {
      updateNav();
      renderEvents('all');
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

document.getElementById('registrationForm').addEventListener('submit', function (e) {
  e.preventDefault();
  let ok = true;
  ok &= vf('studentName', 'nameErr', v => v.length >= 2, 'Please enter your full name.');
  ok &= vf('studentEmail', 'emailErr', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Please enter a valid email.');
  ok &= vf('studentPhone', 'phoneErr', v => /^[\d\s\+\-]{7,15}$/.test(v), 'Please enter a valid phone number.');
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
    success: function(response) {
      closeReg();
      btn.disabled = false;
      btn.textContent = 'Complete Registration →';
      showToast(response.success ? '✅ ' + response.message : '⚠️ ' + response.message);
      if (response.success) loadEvents(); // Refresh seat counts
    },
    error: function() {
      btn.disabled = false;
      btn.textContent = 'Complete Registration →';
      showToast('❌ Network error. Please try again.');
    }
  });
});

function loadParticipants() {
  const list = document.getElementById('participantsList');
  if (!list) return;
  list.innerHTML = `<div class="table-row"><span style="grid-column:1/-1;text-align:center;color:var(--gray)">Loading…</span></div>`;

  $.ajax({
      url: 'api/events/get_event_participants.php',
      type: 'GET',
      data: { event_id: selectedEventId },
      dataType: 'json',
      success: function(response) {
          if (response.success) {
               list.innerHTML = response.data.map(p => `
                  <div class="table-row">
                    <span class="participant-name">${p.name}</span>
                    <span style="color:var(--gray);font-size:0.85rem">${p.email}</span>
                  </div>`).join('');
          }
      }
  });
}

/* ── HELPERS ── */
function vf(id, errId, check, msg) {
  const val = document.getElementById(id).value.trim();
  const el = document.getElementById(id);
  const err = document.getElementById(errId);
  if (!check(val)) {
    el.classList.add('error');
    err.textContent = msg;
    err.classList.add('show');
    err.classList.remove('d-none');
    return false;
  }
  el.classList.remove('error');
  err.classList.remove('show');
  err.classList.add('d-none');
  return true;
}

function showFieldError(errId, msg) {
  const err = document.getElementById(errId);
  if (err) {
    err.textContent = msg;
    err.classList.add('show');
    err.classList.remove('d-none');
  }
}

function clearFormErrors(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id); if (el) el.classList.remove('error');
  });
  document.querySelectorAll('.form-error, .form-text').forEach(e => {
    e.classList.remove('show');
  });
}
function togglePass(inputId, btn) {
  const inp = document.getElementById(inputId);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.style.opacity = inp.type === 'text' ? '0.45' : '1';
}
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4000);
}

/* ── SCROLL ANIMATION ── */
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
