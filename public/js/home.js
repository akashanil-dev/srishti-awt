/* ═══════════════════════════════════════════
           USER SESSION — loaded from backend
        ═══════════════════════════════════════════ */
let currentUser = null;
let events = [];
let activeSearch = '';
let activeSort = 'date';
let currentDetailEvent = null;
let myRegistrations = 0;
let registeredEventIds = new Set();

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    $.ajax({
        url: 'api/auth/check_session.php',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                currentUser = response.data;
                // Redirect admin to admin dashboard
                if (currentUser.role === 'admin') {
                    window.location.href = 'admin-dashboard.html';
                    return;
                }
                setupUserUI();
                loadEvents();
                loadMyRegistrations();
            } else {
                // Not logged in — redirect to login page
                window.location.href = 'index.html';
            }
        },
        error: function () {
            window.location.href = 'index.html';
        }
    });

    document.addEventListener('click', e => {
        if (!document.getElementById('userDropdown').contains(e.target))
            document.getElementById('userDropdown').classList.remove('open');
    });
});

function setupUserUI() {
    const initials = currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('avatarInitials').textContent = initials;
    document.getElementById('topbarUserName').textContent = currentUser.name;
    document.getElementById('dropdownUserName').textContent = currentUser.name;
    document.getElementById('dropdownUserEmail').textContent = currentUser.email;
    document.getElementById('heroUserName').textContent = currentUser.name.split(' ')[0];
    document.getElementById('confirmAvatar').textContent = initials;
    document.getElementById('confirmUserName').textContent = currentUser.name;
    document.getElementById('confirmUserEmail').textContent = currentUser.email;
}

/* ═══════════════════════════════════════════
   LOAD EVENTS FROM API
═══════════════════════════════════════════ */
function loadEvents() {
    $.ajax({
        url: 'api/events/get_events.php',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                events = response.data;
                updateStats();
                renderCards();
                initSlider();
            } else {
                showToast('⚠️ Failed to load events.');
            }
        },
        error: function () {
            showToast('❌ Network error loading events.');
        }
    });
}

/* ═══════════════════════════════════════════
   LOAD MY REGISTRATIONS COUNT
═══════════════════════════════════════════ */
function loadMyRegistrations() {
    $.ajax({
        url: 'api/user/get_user_events.php',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                const myEvents = response.data;
                myRegistrations = myEvents.length;
                registeredEventIds = new Set(myEvents.map(e => parseInt(e.event_id)));
                document.getElementById('statRegistered').textContent = myRegistrations;
                document.getElementById('myRegCount').textContent = myRegistrations;
                renderMyRegistrations(myEvents);
                renderCards(); // re-render to hide registered events
            }
        }
    });
}

function renderMyRegistrations(myEvents) {
    const list = document.getElementById('myRegsList');
    if (!myEvents.length) {
        list.innerHTML = `<div class="col-12 text-center" style="color:var(--gray); padding:48px 0;">
                    <svg viewBox="0 0 24 24" stroke-width="1.5" width="44" height="44" fill="none" stroke="currentColor" style="margin-bottom:14px;opacity:0.3">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <p style="font-size:0.92rem;">You haven't registered for any events yet.</p>
                    <p style="font-size:0.78rem;color:var(--gray);opacity:0.7;">Browse events above and register or join a team!</p>
                </div>`;
        return;
    }
    list.innerHTML = myEvents.map(e => {
        const isTeam = e.reg_type === 'team';
        const isLeader = e.team_role === 'leader';
        const typeIcon = isTeam
            ? '<svg viewBox="0 0 24 24" stroke-width="2" width="18" height="18" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
            : '<svg viewBox="0 0 24 24" stroke-width="2" width="18" height="18" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

        const roleBadge = isTeam
            ? `<span class="myreg-role-badge ${isLeader ? 'leader' : 'member'}">${isLeader ? '★ Leader' : 'Member'}</span>`
            : '<span class="myreg-role-badge solo">Solo</span>';

        const teamPill = isTeam && e.team_name
            ? `<div class="myreg-team-pill"><svg viewBox="0 0 24 24" stroke-width="2" width="12" height="12" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>${e.team_name}</div>`
            : '';

        const deregData = isTeam
            ? `data-type="team" data-event="${e.event_id}" data-team="${e.team_id}" data-role="${e.team_role}" data-title="${(e.title || '').replace(/"/g, '&quot;')}" data-teamname="${(e.team_name || '').replace(/"/g, '&quot;')}"`
            : `data-type="registration" data-event="${e.event_id}" data-role="solo" data-title="${(e.title || '').replace(/"/g, '&quot;')}"`;

        return `
            <div class="col">
                <div class="myreg-card">
                    <div class="myreg-card-top">
                        <div class="myreg-icon-wrap ${isTeam ? 'team' : 'solo'}">${typeIcon}</div>
                        <div class="myreg-card-info">
                            <div class="myreg-event-title">${e.title || 'Event'}</div>
                            <div class="myreg-event-desc">${e.description || ''}</div>
                        </div>
                        ${roleBadge}
                    </div>
                    ${teamPill}
                    <div class="myreg-card-bottom">
                        <div class="myreg-date">
                            <svg viewBox="0 0 24 24" stroke-width="2" width="13" height="13" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            ${formatDate(e.event_date)}
                        </div>
                        <button class="myreg-dereg-btn" onclick="openDeregConfirm(this)" ${deregData}>
                            <svg viewBox="0 0 24 24" stroke-width="2" width="13" height="13" fill="none" stroke="currentColor"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            De-register
                        </button>
                    </div>
                </div>
            </div>`;
    }).join('');
}

/* De-registration confirmation */
let pendingDereg = null;

function openDeregConfirm(btn) {
    const type = btn.dataset.type;
    const eventId = btn.dataset.event;
    const teamId = btn.dataset.team || null;
    const role = btn.dataset.role;
    const title = btn.dataset.title;
    const teamName = btn.dataset.teamname || '';

    pendingDereg = { type, eventId, teamId, role };

    let msg = '';
    if (type === 'team' && role === 'leader') {
        msg = `As the leader, de-registering will <strong style="color:var(--red)">disband the entire team "${teamName}"</strong> and remove all members from <strong>${title}</strong>. This cannot be undone.`;
    } else if (type === 'team') {
        msg = `You will leave team <strong>"${teamName}"</strong> for the event <strong>${title}</strong>. You can ask the leader to re-add you later.`;
    } else {
        msg = `You will be de-registered from <strong>${title}</strong>. You can register again later if seats are available.`;
    }

    document.getElementById('deregConfirmMsg').innerHTML = msg;
    document.getElementById('deregOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeDeregConfirm() {
    document.getElementById('deregOverlay').classList.remove('open');
    document.body.style.overflow = '';
    pendingDereg = null;
}
function closeDeregOutside(e) {
    if (e.target === document.getElementById('deregOverlay')) closeDeregConfirm();
}

function confirmDereg() {
    if (!pendingDereg) return;
    const btn = document.getElementById('deregConfirmBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="dereg-spinner"></span> Processing…';

    $.ajax({
        url: 'api/user/deregister.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            type: pendingDereg.type,
            event_id: pendingDereg.eventId,
            team_id: pendingDereg.teamId
        }),
        dataType: 'json',
        success: function (response) {
            btn.disabled = false;
            btn.innerHTML = 'Yes, De-register';
            closeDeregConfirm();
            if (response.success) {
                showToast('✅ ' + response.message);
                loadMyRegistrations();
                loadEvents();
            } else {
                showToast('❌ ' + response.message);
            }
        },
        error: function () {
            btn.disabled = false;
            btn.innerHTML = 'Yes, De-register';
            closeDeregConfirm();
            showToast('❌ Network error. Please try again.');
        }
    });
}

let myRegsVisible = false;
function toggleMyRegs() {
    myRegsVisible = !myRegsVisible;
    document.getElementById('myRegsContainer').style.display = myRegsVisible ? 'block' : 'none';
    const btn = document.querySelector('[onclick="toggleMyRegs()"]');
    if (btn) btn.innerHTML = myRegsVisible
        ? '<svg viewBox="0 0 24 24" stroke-width="2" width="14" height="14" fill="none" stroke="currentColor"><polyline points="18 15 12 9 6 15"/></svg> Hide My Events'
        : '<svg viewBox="0 0 24 24" stroke-width="2" width="14" height="14" fill="none" stroke="currentColor"><polyline points="6 9 12 15 18 9"/></svg> Show My Events';
}

/* ═══════════════════════════════════════════
   RENDER CARDS
═══════════════════════════════════════════ */
function renderCards() {
    const grid = document.getElementById('eventsGrid');
    let list = events.filter(e => !registeredEventIds.has(parseInt(e.id)));
    if (activeSearch.trim()) {
        const q = activeSearch.toLowerCase();
        list = list.filter(e => (e.title || '').toLowerCase().includes(q) || (e.description || '').toLowerCase().includes(q));
    }
    if (activeSort === 'date') list.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    if (activeSort === 'seats') list.sort((a, b) => (parseInt(a.available_seats) || 0) - (parseInt(b.available_seats) || 0));
    if (activeSort === 'title') list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

    document.getElementById('visibleCount').textContent = list.length + ' event' + (list.length !== 1 ? 's' : '');

    if (!list.length) {
        grid.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><p>No events match your search.</p></div>`;
        return;
    }
    grid.innerHTML = list.map(buildCard).join('');
}

function buildCard(e) {
    const maxP = parseInt(e.max_participants) || 0;
    const reg = parseInt(e.registered) || 0;
    const left = Math.max(0, maxP - reg);
    const pct = maxP > 0 ? Math.round((reg / maxP) * 100) : 0;
    const full = left <= 0 && maxP > 0;
    const warn = pct >= 70 && !full;
    const fillCl = full ? 'fill-red' : warn ? 'fill-amber' : 'fill-green';
    const leftC = full ? 'var(--red)' : warn ? 'var(--amber)' : 'var(--green)';
    const badgeHtml = full
        ? '<span class="ec-badge badge-full">Full</span>'
        : warn ? '<span class="ec-badge badge-filling">Filling fast</span>'
            : '<span class="ec-badge badge-open">Open</span>';
    const catIcons = {
        workshop: `<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>`,
        hackathon: `<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>`,
        seminar: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
        competition: `<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>`,
    };
    const icon = catIcons[e.cat] || catIcons.seminar;
    return `
        <div class="col">
          <div class="card h-100 mb-4 shadow-sm event-card border-0" onclick="openDetail(${e.id})" style="cursor: pointer; transition: transform 0.2s;">
            <div class="card-body d-flex flex-column">
              <div class="d-flex justify-content-between align-items-start mb-2 ec-header">
                <div class="text-primary ec-icon"><svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.8">${icon}</svg></div>
                <div>${badgeHtml}</div>
              </div>
              <h5 class="card-title fw-bold ec-title text-white">${e.title || 'Untitled Event'}</h5>
              <p class="card-text ec-desc mb-3" style="flex-grow: 1;">${e.description || 'No description available.'}</p>
              
              <div class="ec-meta mb-3">
                <div class="ec-meta-row">
                  <svg viewBox="0 0 24 24" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  ${formatDate(e.event_date)}
                </div>
                <div class="ec-meta-row">
                  <svg viewBox="0 0 24 24" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  Max ${maxP} participants
                </div>
              </div>

              <div class="ec-seats mb-3">
                <div class="ec-seats-label">
                  <span>Seats filled</span>
                  <span style="color:${leftC};font-weight:700">${full ? 'FULL' : left + ' left'}</span>
                </div>
                <div class="seats-track"><div class="seats-fill ${fillCl}" style="width:${pct}%"></div></div>
              </div>

              <button class="btn ${full ? 'btn-secondary' : 'btn-outline-primary'} w-100 mt-auto btn-view-details" onclick="openDetail(${e.id});event.stopPropagation()">
                ${full
            ? '<svg viewBox="0 0 24 24" stroke-width="2" width="15" height="15" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Fully Booked'
            : '<svg viewBox="0 0 24 24" stroke-width="2" width="15" height="15" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> View Details'
        }
              </button>
            </div>
          </div>
        </div>`;
}

/* ═══════════════════════════════════════════
   DETAIL MODAL
═══════════════════════════════════════════ */
function openDetail(id) {
    const e = events.find(ev => parseInt(ev.id) === parseInt(id));
    if (!e) return;
    currentDetailEvent = e;

    const maxP = parseInt(e.max_participants) || 0;
    const reg = parseInt(e.registered) || 0;
    const left = Math.max(0, maxP - reg);
    const pct = maxP > 0 ? Math.round((reg / maxP) * 100) : 0;
    const full = left <= 0 && maxP > 0;
    const warn = pct >= 70 && !full;

    document.getElementById('detailTitle').textContent = e.title;
    document.getElementById('detailDesc').textContent = e.description;
    document.getElementById('detailDate').textContent = formatDate(e.event_date);
    document.getElementById('detailMax').textContent = maxP + ' participants';
    document.getElementById('detailRegistered').textContent = reg + ' registered';
    document.getElementById('detailLeft').textContent = full ? 'Fully Booked' : left + ' seats left';
    document.getElementById('detailLeft').style.color = full ? 'var(--red)' : warn ? 'var(--amber)' : 'var(--green)';

    document.getElementById('detailBadge').innerHTML = full
        ? '<span class="ec-badge badge-full">Fully Booked</span>'
        : warn ? '<span class="ec-badge badge-filling">Filling Fast</span>'
            : '<span class="ec-badge badge-open">Open for Registration</span>';

    const pill = document.getElementById('detailSeatsPill');
    pill.textContent = full ? 'Full' : left + ' left';
    pill.style.background = full ? 'rgba(239,68,68,0.12)' : warn ? 'rgba(245,158,11,0.12)' : 'var(--green-dim)';
    pill.style.color = full ? 'var(--red)' : warn ? 'var(--amber)' : 'var(--green)';

    const bar = document.getElementById('detailSeatsBar');
    bar.style.width = pct + '%';
    bar.style.background = full ? 'var(--red)' : warn ? 'var(--amber)' : 'var(--green)';

    const regBtn = document.getElementById('detailRegBtn');
    regBtn.disabled = full;
    regBtn.innerHTML = full
        ? '<svg viewBox="0 0 24 24" stroke-width="2" width="16" height="16" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Fully Booked'
        : '<svg viewBox="0 0 24 24" stroke-width="2.5" width="16" height="16" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Register for this Event';

    // Load participants immediately
    loadParticipants(e.id);

    // Only show "Create Team" button for team events
    document.getElementById('detailTeamBtn').style.display = e.event_type === 'team' ? '' : 'none';

    document.getElementById('detailOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

/* ═══════════════════════════════════════════
   EVENT PARTICIPANTS
═══════════════════════════════════════════ */
function loadParticipants(eventId) {
    const list = document.getElementById('participantsList');
    const countBadge = document.getElementById('participantsCount');

    countBadge.textContent = '';
    list.innerHTML = `
                <div class="participants-loading">
                    <span class="spinner"></span> Loading participants…
                </div>`;

    $.ajax({
        url: 'api/events/get_event_participants.php',
        type: 'GET',
        data: { event_id: eventId },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                const participants = response.data;
                countBadge.textContent = participants.length + ' registered';

                if (!participants.length) {
                    list.innerHTML = `
                                <div class="participants-empty">
                                    <svg viewBox="0 0 24 24" stroke-width="1.5" fill="none" stroke="currentColor">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                    No one has registered yet.
                                </div>`;
                    return;
                }

                list.innerHTML = `
                            <div class="participants-scroll">
                                ${participants.map((p, i) => `
                                    <div class="participant-row">
                                        <div class="participant-avatar">
                                            ${p.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
                                        <div class="participant-info">
                                            <div class="participant-name">${p.name}</div>
                                            <div class="participant-email">${p.email}</div>
                                        </div>
                                        <div class="participant-index">#${i + 1}</div>
                                    </div>
                                `).join('')}
                            </div>`;
            } else {
                countBadge.textContent = '';
                list.innerHTML = `<div class="participants-error">⚠️ Failed to load participants.</div>`;
            }
        },
        error: function () {
            countBadge.textContent = '';
            list.innerHTML = `<div class="participants-error">❌ Network error loading participants.</div>`;
        }
    });
}

function closeDetail() {
    document.getElementById('detailOverlay').classList.remove('open');
    document.body.style.overflow = '';
}
function closeDetailOutside(e) {
    if (e.target === document.getElementById('detailOverlay')) closeDetail();
}

/* ═══════════════════════════════════════════
   CONFIRM MODAL  (open from detail)
═══════════════════════════════════════════ */
function openConfirm() {
    const e = currentDetailEvent;
    if (!e) return;
    closeDetail();

    const maxP = parseInt(e.max_participants) || 0;
    const reg = parseInt(e.registered) || 0;
    const left = Math.max(0, maxP - reg);

    document.getElementById('confirmEventTitle').textContent = e.title;
    document.getElementById('confirmEventDate').textContent = formatDate(e.event_date);
    document.getElementById('confirmSeatsLeft').textContent = left + ' seat' + (left !== 1 ? 's' : '') + ' left';

    resetSlider();

    setTimeout(() => {
        document.getElementById('confirmOverlay').classList.add('open');
        document.body.style.overflow = 'hidden';
    }, 180);
}

function closeConfirm() {
    document.getElementById('confirmOverlay').classList.remove('open');
    document.body.style.overflow = '';
    resetSlider();
}
function closeConfirmOutside(e) {
    if (e.target === document.getElementById('confirmOverlay')) closeConfirm();
}

/* ═══════════════════════════════════════════
   SLIDER LOGIC
═══════════════════════════════════════════ */
function initSlider() {
    const track = document.getElementById('sliderTrack');
    const thumb = document.getElementById('sliderThumb');
    const fill = document.getElementById('sliderFill');

    let dragging = false;
    let startX = 0;
    let currentX = 0;
    let maxTravel = 0;
    let confirmed = false;

    function getThumbX() {
        const trackW = track.getBoundingClientRect().width;
        const thumbW = thumb.getBoundingClientRect().width;
        return trackW - thumbW - 4;
    }

    function onPointerDown(e) {
        if (confirmed) return;
        dragging = true;
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        currentX = parseFloat(thumb.style.left) || 4;
        maxTravel = getThumbX();
        thumb.classList.add('dragging');
        e.preventDefault();
    }

    function onPointerMove(e) {
        if (!dragging) return;
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const delta = clientX - startX;
        let newX = Math.min(Math.max(currentX + delta, 4), maxTravel);
        thumb.style.left = newX + 'px';

        const pct = ((newX - 4) / (maxTravel - 4)) * 100;
        fill.style.width = Math.min(pct + 5, 100) + '%';

        document.getElementById('sliderArrows').style.opacity = Math.max(0.3 - pct / 100, 0);
        document.getElementById('sliderText').style.opacity = Math.max(1 - pct / 60, 0);

        if (pct >= 90 && !confirmed) triggerConfirm(newX);
    }

    function onPointerUp() {
        if (!dragging) return;
        dragging = false;
        thumb.classList.remove('dragging');
        if (!confirmed) {
            thumb.style.transition = 'left 0.4s cubic-bezier(0.34,1.56,0.64,1)';
            thumb.style.left = '4px';
            fill.style.transition = 'width 0.4s ease';
            fill.style.width = '0%';
            document.getElementById('sliderArrows').style.opacity = '0.3';
            document.getElementById('sliderText').style.opacity = '1';
            setTimeout(() => {
                thumb.style.transition = '';
                fill.style.transition = '';
            }, 420);
        }
    }

    function triggerConfirm(finalX) {
        confirmed = true;
        thumb.style.left = getThumbX() + 'px';
        fill.style.width = '100%';
        track.classList.add('success');

        thumb.querySelector('svg').innerHTML = '<polyline points="20 6 9 17 4 12" stroke-width="2.5"/>';

        document.getElementById('sliderLabel').textContent = 'Confirmed! Processing your registration…';
        document.getElementById('sliderLabel').style.color = 'var(--green)';
        document.getElementById('confirmCancelBtn').style.display = 'none';
        document.getElementById('confirmSubmitting').classList.add('show');

        submitRegistration();
    }

    // Mouse events
    thumb.addEventListener('mousedown', onPointerDown);
    document.addEventListener('mousemove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);

    // Touch events
    thumb.addEventListener('touchstart', onPointerDown, { passive: false });
    document.addEventListener('touchmove', onPointerMove, { passive: false });
    document.addEventListener('touchend', onPointerUp);
}

function resetSlider() {
    const track = document.getElementById('sliderTrack');
    const thumb = document.getElementById('sliderThumb');
    const fill = document.getElementById('sliderFill');

    track.classList.remove('success');
    thumb.style.left = '4px';
    fill.style.width = '0%';
    thumb.querySelector('svg').innerHTML = '<polyline points="9 18 15 12 9 6" stroke-width="2.5"/>';

    document.getElementById('sliderLabel').textContent = 'Slide to confirm your registration →';
    document.getElementById('sliderLabel').style.color = '';
    document.getElementById('sliderArrows').style.opacity = '0.3';
    document.getElementById('sliderText').style.opacity = '1';
    document.getElementById('confirmCancelBtn').style.display = '';
    document.getElementById('confirmSubmitting').classList.remove('show');
}

/* ═══════════════════════════════════════════
   SUBMIT REGISTRATION — REAL API CALL
═══════════════════════════════════════════ */
function submitRegistration() {
    const e = currentDetailEvent;

    $.ajax({
        url: 'api/events/register_event.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            event_id: e.id
        }),
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                myRegistrations++;
                closeConfirm();
                loadEvents(); // Refresh seat counts from server
                loadMyRegistrations(); // Refresh My Registrations list
                document.getElementById('statRegistered').textContent = myRegistrations;
                showToast('✅ Registered for ' + e.title + '!');
            } else {
                resetSlider();
                showToast('⚠️ ' + response.message);
            }
        },
        error: function () {
            resetSlider();
            showToast('❌ Network error. Please try again.');
        }
    });
}

/* ═══════════════════════════════════════════
   SEARCH / SORT
═══════════════════════════════════════════ */
function handleSearch() {
    activeSearch = document.getElementById('searchInput').value;
    renderCards();
}
function applySort() {
    activeSort = document.getElementById('sortSelect').value;
    renderCards();
}

/* ═══════════════════════════════════════════
   STATS
═══════════════════════════════════════════ */
function updateStats() {
    const openCount = events.filter(e => {
        const maxP = parseInt(e.max_participants) || 0;
        const reg = parseInt(e.registered) || 0;
        return maxP - reg > 0;
    }).length;
    document.getElementById('statTotal').textContent = events.length;
    document.getElementById('statOpen').textContent = openCount;
    document.getElementById('statRegistered').textContent = myRegistrations;
}

/* ═══════════════════════════════════════════
   DROPDOWN
═══════════════════════════════════════════ */
function toggleDropdown() { document.getElementById('userDropdown').classList.toggle('open'); }
function goToAccount() { window.location.href = 'account.php'; }
function logout() {
    $.ajax({
        url: 'api/auth/logout.php',
        type: 'GET',
        dataType: 'json',
        success: function () {
            window.location.href = 'index.html';
        },
        error: function () {
            window.location.href = 'index.html';
        }
    });
}

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function showToast(msg) {
    const t = document.getElementById('toast');
    const icon = document.getElementById('toastIcon');
    const msgEl = document.getElementById('toastMsg');

    // Detect type from emoji prefix
    const successIcon = '<svg viewBox="0 0 24 24" stroke-width="2.5" width="17" height="17" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>';
    const errorIcon = '<svg viewBox="0 0 24 24" stroke-width="2.5" width="17" height="17" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    const warnIcon = '<svg viewBox="0 0 24 24" stroke-width="2.5" width="17" height="17" fill="none" stroke="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    const infoIcon = '<svg viewBox="0 0 24 24" stroke-width="2.5" width="17" height="17" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

    // Strip emoji prefix and set style
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
    } else {
        icon.innerHTML = infoIcon;
        t.style.background = 'var(--green)';
        t.style.color = 'var(--black)';
    }

    msgEl.textContent = cleanMsg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 4000);
}
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

/* ═══════════════════════════════════════════
   TEAM MANAGEMENT
═══════════════════════════════════════════ */
let currentTeamId = null;
let teamMembers = [];
let currentTeamName = '';

function openTeamModal() {
    // Populate event select — only team events
    const sel = document.getElementById('teamEventSelect');
    sel.innerHTML = '<option value="">— Select event —</option>' +
        events.filter(e => e.event_type === 'team').map(e => `<option value="${e.id}">${e.title}</option>`).join('');

    // If opened from a detail view, pre-select event
    if (currentDetailEvent) {
        sel.value = currentDetailEvent.id;
    }

    // Reset state
    currentTeamId = null;
    teamMembers = [];
    currentTeamName = '';
    document.getElementById('teamCreateSection').style.display = 'block';
    document.getElementById('teamMemberSection').style.display = 'none';
    document.getElementById('teamName').value = '';
    document.getElementById('teamMemberMsg').innerHTML = '';
    document.getElementById('teamMembersList').innerHTML = '';

    document.getElementById('teamOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeTeam() {
    document.getElementById('teamOverlay').classList.remove('open');
    document.body.style.overflow = '';
}
function closeTeamOutside(e) {
    if (e.target === document.getElementById('teamOverlay')) closeTeam();
}

function renderTeamMembers() {
    const container = document.getElementById('teamMembersList');
    if (!teamMembers.length) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = teamMembers.map(m => {
        const initials = m.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        const isLeader = m.role === 'leader';
        const badgeColor = isLeader ? 'rgba(61,218,110,0.15)' : 'rgba(255,255,255,0.06)';
        const badgeText = isLeader ? 'rgba(61,218,110,1)' : 'var(--gray)';
        const roleLabel = isLeader ? '★ Leader' : 'Member';
        return `
            <div class="team-member-card">
                <div class="team-member-avatar">${initials}</div>
                <div class="team-member-info">
                    <div class="team-member-name">${m.name}</div>
                    <div class="team-member-email">${m.email}</div>
                </div>
                <div class="team-member-badge" style="background:${badgeColor};color:${badgeText};">
                    ${roleLabel}
                </div>
            </div>`;
    }).join('');
}

// Create Team
document.getElementById('teamCreateForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const btn = document.getElementById('teamCreateBtn');
    btn.disabled = true;
    btn.textContent = 'Creating…';

    $.ajax({
        url: 'api/teams/create_team.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            team_name: document.getElementById('teamName').value.trim(),
            event_id: document.getElementById('teamEventSelect').value
        }),
        dataType: 'json',
        success: function (response) {
            btn.disabled = false;
            btn.textContent = 'Create Team';
            if (response.success) {
                currentTeamId = response.data.team_id;
                currentTeamName = document.getElementById('teamName').value.trim();

                // Add creator as first member (leader)
                teamMembers = [];
                if (response.data.leader) {
                    teamMembers.push(response.data.leader);
                }
                renderTeamMembers();

                document.getElementById('teamCreateSection').style.display = 'none';
                document.getElementById('teamMemberSection').style.display = 'block';
                showToast('✅ ' + response.message);
            } else {
                showToast('⚠️ ' + response.message);
            }
        },
        error: function () {
            btn.disabled = false;
            btn.textContent = 'Create Team';
            showToast('❌ Network error creating team.');
        }
    });
});

// Add Team Member
document.getElementById('teamMemberForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const emailInput = document.getElementById('memberUserEmail');
    const email = emailInput.value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('teamMemberMsg').innerHTML = `<span style="color:var(--red)">⚠️ Please enter a valid email address.</span>`;
        return;
    }

    const btn = document.getElementById('addMemberBtn');
    btn.disabled = true;
    btn.textContent = 'Adding…';

    $.ajax({
        url: 'api/teams/add_team_member.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            team_id: currentTeamId,
            email: email
        }),
        dataType: 'json',
        success: function (response) {
            btn.disabled = false;
            btn.textContent = 'Add Member';
            const msg = document.getElementById('teamMemberMsg');
            if (response.success) {
                // Add to local list and render card
                teamMembers.push({
                    name: response.data.name,
                    email: response.data.email,
                    role: response.data.role || 'member'
                });
                renderTeamMembers();
                msg.innerHTML = `<span style="color:var(--green)">✅ ${response.message}</span>`;
                emailInput.value = '';
            } else {
                msg.innerHTML = `<span style="color:var(--red)">⚠️ ${response.message}</span>`;
            }
        },
        error: function () {
            btn.disabled = false;
            btn.textContent = 'Add Member';
            document.getElementById('teamMemberMsg').innerHTML = `<span style="color:var(--red)">❌ Network error.</span>`;
        }
    });
});

// Finalize Team
function finalizeTeam() {
    closeTeam();
    showToast(`✅ Team "${currentTeamName}" finalized with ${teamMembers.length} member${teamMembers.length !== 1 ? 's' : ''}!`);
    loadEvents(); // Refresh event data
}