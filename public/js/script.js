/* ── STATE ── */
let currentUser = null;
let pendingEvent = null;

let events = [];

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

$(document).ready(function() {
    loadEvents();
});


function renderEvents(filter) {
  console.log("Rendering Events:", events);
  const grid = document.getElementById('eventsGrid');
    const list = (filter === 'all') ? events : events.filter(e => e.cat === filter);
  
  grid.innerHTML = list.map(e => {
    const seats = parseInt(e.seats) || 0;
    const registered = parseInt(e.registered) || 0;
    const pct = seats > 0 ? Math.round((registered / seats) * 100) : 0;
    const left = Math.max(0, seats - registered); 
    const full = left <= 0 && seats > 0;

    const fillC = pct >= 90 ? 'danger' : pct >= 70 ? 'warn' : '';
    const leftC = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : 'var(--green)';
    
    const btnLabel = full ? 'Fully Booked' : currentUser ? 'Register →' : '🔒 Login to Register';
    const btnClass = full ? '' : currentUser ? '' : 'guest';
    
    return `
      <div class="event-card">
        <div class="event-title">${e.title || 'Untitled Event'}</div>
        
        <div class="event-desc">${e.description || 'No description available.'}</div>
        
        <div class="event-meta">
          <div class="event-meta-item"><svg viewBox="0 0 24 24" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${e.date || 'TBA'}</div>
          <div class="event-meta-item"><svg viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${e.time || 'TBA'}</div>
          <div class="event-meta-item"><svg viewBox="0 0 24 24" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>${e.venue || 'TBA'}</div>
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
      phone: $('#signupPhone').val().trim()
    }),
    dataType: 'json',
    success: function (response) {
      btn.disabled = false;
      btn.textContent = 'Create Account →';
      if (response.success) {
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
    }
  });

});

function loginSuccess(user) {
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(user));
  closeAuth();
  updateNav();
  renderEvents('all');
  showToast('👋 Welcome, ' + user.name + '!');
  if (pendingEvent) {
    const eid = pendingEvent; pendingEvent = null;
    setTimeout(() => openReg(eid), 380);
  }
}

function logout() {
  currentUser = null;
  $.ajax({
    url: 'api/auth/logout.php',
    type: 'GET',
    contentType: 'application/json',
    success: function (response) {
      if (response.success) {
        updateNav();
        renderEvents('all');
        showToast('You have been logged out.');
      } else {
        showToast('Issue Logging out.');
      }
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
    events.filter(e => e.seats - e.registered > 0)
      .map(e => `<option value="${e.id}">${e.title}</option>`).join('');
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

  const fd = new FormData();
  fd.append('name', document.getElementById('studentName').value.trim());
  fd.append('email', document.getElementById('studentEmail').value.trim());
  fd.append('phone', document.getElementById('studentPhone').value.trim());
  fd.append('event_id', document.getElementById('selectedEvent').value);

  $.ajax({
        url: 'api/events/register_event.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            user_id: currentUser.id,
            event_id: $('#selectedEvent').val()
        }),
        dataType: 'json',
        success: function(response) {
            closeReg();
            btn.disabled = false;
            btn.textContent = 'Complete Registration →';
            showToast(response.success ? '✅ ' + response.message : '⚠️ ' + response.message);
            if (response.success) loadEvents(); // Refresh seat counts
        }
    });
});

function loadParticipants() {
  const list = document.getElementById('participantsList');
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
                    <span><span class="event-badge">${p.event}</span></span>
                    <span><span class="status-badge status-${p.status}">${p.status}</span></span>
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
    el.classList.add('error'); err.textContent = msg; err.classList.add('show'); return false;
  }
  el.classList.remove('error'); err.classList.remove('show'); return true;
}
function clearFormErrors(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id); if (el) el.classList.remove('error');
  });
  document.querySelectorAll('.form-error').forEach(e => e.classList.remove('show'));
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

