        /* ═══════════════════════════════════════════
           SIMULATED USER SESSION
           In production: read from PHP session → echo json_encode($_SESSION['user'])
        ═══════════════════════════════════════════ */
        const currentUser = {
            name: 'Alex Johnson',
            email: 'alex@college.edu',
            phone: '+91 9876543210'
        };

        /* ═══════════════════════════════════════════
           EVENT DATA
           In production:
             fetch('get_events.php').then(r=>r.json()).then(data=>{ events=data; updateStats(); renderCards(); });
        ═══════════════════════════════════════════ */
        let events = [
            { id: 1, title: 'AI & Machine Learning Workshop', cat: 'workshop', description: 'Hands-on session covering neural networks, model training, and real-world applications using Python and TensorFlow. Suitable for beginners and intermediate learners.', event_date: '2026-03-15', max_participants: 50, registered: 18 },
            { id: 2, title: 'Full-Stack Dev Hackathon', cat: 'hackathon', description: '48-hour coding marathon. Build a complete web application from scratch. Cash prizes for top 3 teams. Participate solo or as a team of up to 4 members.', event_date: '2026-03-16', max_participants: 40, registered: 32 },
            { id: 3, title: 'Cybersecurity CTF Challenge', cat: 'competition', description: 'Capture-the-Flag cybersecurity competition. Solve progressively harder real-world security puzzles across web exploitation, cryptography, and reverse engineering.', event_date: '2026-03-18', max_participants: 60, registered: 18 },
            { id: 4, title: 'Cloud Computing Seminar', cat: 'seminar', description: 'Industry experts from AWS and Google Cloud walk through modern cloud architecture, DevOps pipelines, container orchestration, and serverless deployment strategies.', event_date: '2026-03-15', max_participants: 80, registered: 45 },
            { id: 5, title: 'UI/UX Design Sprint', cat: 'workshop', description: '2-day intensive workshop covering wireframing fundamentals, Figma prototyping, design systems, and user testing techniques with real participants.', event_date: '2026-03-16', max_participants: 30, registered: 30 },
            { id: 6, title: 'Blockchain & Web3 Talk', cat: 'seminar', description: 'Deep dive into decentralised applications, smart contract development with Solidity, NFT standards, and the evolving landscape of Web3 with seasoned developers.', event_date: '2026-03-18', max_participants: 100, registered: 55 },
        ];

        let activeFilter = 'all';
        let activeSearch = '';
        let activeSort = 'date';
        let currentDetailEvent = null;
        let myRegistrations = 0;

        /* ═══════════════════════════════════════════
           INIT
        ═══════════════════════════════════════════ */
        document.addEventListener('DOMContentLoaded', () => {
            const initials = currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            document.getElementById('avatarInitials').textContent = initials;
            document.getElementById('topbarUserName').textContent = currentUser.name;
            document.getElementById('dropdownUserName').textContent = currentUser.name;
            document.getElementById('dropdownUserEmail').textContent = currentUser.email;
            document.getElementById('heroUserName').textContent = currentUser.name.split(' ')[0];
            document.getElementById('confirmAvatar').textContent = initials;
            document.getElementById('confirmUserName').textContent = currentUser.name;
            document.getElementById('confirmUserEmail').textContent = currentUser.email;

            updateStats();
            renderCards();
            initSlider();

            document.addEventListener('click', e => {
                if (!document.getElementById('userDropdown').contains(e.target))
                    document.getElementById('userDropdown').classList.remove('open');
            });
        });

        /* ═══════════════════════════════════════════
           RENDER CARDS
        ═══════════════════════════════════════════ */
        function renderCards() {
            const grid = document.getElementById('eventsGrid');
            let list = [...events];
            if (activeFilter !== 'all') list = list.filter(e => e.cat === activeFilter);
            if (activeSearch.trim()) {
                const q = activeSearch.toLowerCase();
                list = list.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
            }
            if (activeSort === 'date') list.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
            if (activeSort === 'seats') list.sort((a, b) => (a.max_participants - a.registered) - (b.max_participants - b.registered));
            if (activeSort === 'title') list.sort((a, b) => a.title.localeCompare(b.title));

            document.getElementById('visibleCount').textContent = list.length + ' event' + (list.length !== 1 ? 's' : '');

            if (!list.length) {
                grid.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><p>No events match your search.</p></div>`;
                return;
            }
            grid.innerHTML = list.map(buildCard).join('');
        }

        function buildCard(e) {
            const left = e.max_participants - e.registered;
            const pct = Math.round((e.registered / e.max_participants) * 100);
            const full = left <= 0;
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
        <div class="event-card" onclick="openDetail(${e.id})">
          <div class="ec-header">
            <div class="ec-icon"><svg viewBox="0 0 24 24" stroke-width="1.8">${icon}</svg></div>
            <div class="ec-badges">${badgeHtml}</div>
          </div>
          <div class="ec-title">${e.title}</div>
          <div class="ec-desc">${e.description}</div>
          <div class="ec-meta">
            <div class="ec-meta-row">
              <svg viewBox="0 0 24 24" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ${formatDate(e.event_date)}
            </div>
            <div class="ec-meta-row">
              <svg viewBox="0 0 24 24" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Max ${e.max_participants} participants
            </div>
          </div>
          <div class="ec-seats">
            <div class="ec-seats-label">
              <span>Seats filled</span>
              <span style="color:${leftC};font-weight:700">${full ? 'FULL' : left + ' left'}</span>
            </div>
            <div class="seats-track"><div class="seats-fill ${fillCl}" style="width:${pct}%"></div></div>
          </div>
          <button class="btn-view-details ${full ? 'full' : ''}" onclick="openDetail(${e.id});event.stopPropagation()">
            ${full
                    ? '<svg viewBox="0 0 24 24" stroke-width="2" width="15" height="15" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Fully Booked'
                    : '<svg viewBox="0 0 24 24" stroke-width="2" width="15" height="15" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> View Details'
                }
          </button>
        </div>`;
        }

        /* ═══════════════════════════════════════════
           DETAIL MODAL
        ═══════════════════════════════════════════ */
        function openDetail(id) {
            const e = events.find(ev => ev.id === id);
            if (!e) return;
            currentDetailEvent = e;

            const left = e.max_participants - e.registered;
            const pct = Math.round((e.registered / e.max_participants) * 100);
            const full = left <= 0;
            const warn = pct >= 70 && !full;

            document.getElementById('detailTitle').textContent = e.title;
            document.getElementById('detailDesc').textContent = e.description;
            document.getElementById('detailDate').textContent = formatDate(e.event_date);
            document.getElementById('detailMax').textContent = e.max_participants + ' participants';
            document.getElementById('detailRegistered').textContent = e.registered + ' registered';
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
            regBtn.textContent = full ? 'Fully Booked' : 'Register for this Event';

            document.getElementById('detailOverlay').classList.add('open');
            document.body.style.overflow = 'hidden';
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

            const left = e.max_participants - e.registered;

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
                return trackW - thumbW - 4; // 4px = right padding
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

                // Fill progress
                const pct = ((newX - 4) / (maxTravel - 4)) * 100;
                fill.style.width = Math.min(pct + 5, 100) + '%';

                // Dim arrows as user drags
                document.getElementById('sliderArrows').style.opacity = Math.max(0.3 - pct / 100, 0);
                document.getElementById('sliderText').style.opacity = Math.max(1 - pct / 60, 0);

                // Trigger if past 90%
                if (pct >= 90 && !confirmed) triggerConfirm(newX);
            }

            function onPointerUp() {
                if (!dragging) return;
                dragging = false;
                thumb.classList.remove('dragging');
                if (!confirmed) {
                    // Snap back
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

                // Change icon to checkmark
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
           SUBMIT REGISTRATION
        ═══════════════════════════════════════════ */
        function submitRegistration() {
            const e = currentDetailEvent;
            const fd = new FormData();
            fd.append('event_id', e.id);
            fd.append('user_id', 1); // from session in production

            /* ─── REPLACE WITH ────────────────────────────────────────────────────
               fetch('register.php', { method:'POST', body: fd })
                 .then(r => r.json())
                 .then(data => {
                   if (data.success) {
                     e.registered++;
                     myRegistrations++;
                     closeConfirm();
                     updateStats();
                     renderCards();
                     showToast('Registered for ' + e.title + '!');
                   } else {
                     resetSlider();
                     showToast('⚠️ ' + data.message);
                   }
                 });
            ─────────────────────────────────────────────────────────────────── */
            setTimeout(() => {
                e.registered++;
                myRegistrations++;
                closeConfirm();
                updateStats();
                renderCards();
                showToast('Registered for ' + e.title + '!');
            }, 1400);
        }

        /* ═══════════════════════════════════════════
           FILTER / SEARCH / SORT
        ═══════════════════════════════════════════ */
        function filterTab(cat, btn) {
            activeFilter = cat;
            document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderCards();
        }
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
            const openCount = events.filter(e => e.max_participants - e.registered > 0).length;
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
            /* fetch('logout.php').then(() => { window.location.href = 'index.html'; }); */
            window.location.href = 'index.html';
        }

        /* ═══════════════════════════════════════════
           HELPERS
        ═══════════════════════════════════════════ */
        function showToast(msg) {
            const t = document.getElementById('toast');
            document.getElementById('toastMsg').textContent = msg;
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 4000);
        }
        function formatDate(dateStr) {
            if (!dateStr) return '—';
            const d = new Date(dateStr + 'T00:00:00');
            return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
        }
