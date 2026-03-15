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