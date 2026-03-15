        /* ═══════════════════════════════════════════
           ADMIN SESSION
           In production: read from PHP session
        ═══════════════════════════════════════════ */
        const adminUser = { name: 'Super Admin', email: 'admin@techfest.edu' };

        /* ═══════════════════════════════════════════
           EVENT DATA
           In production:
             fetch('admin_get_events.php').then(r=>r.json()).then(data=>{ events=data; init(); });
        ═══════════════════════════════════════════ */
        let events = [
            { id: 1, title: 'AI & Machine Learning Workshop', description: 'Hands-on session covering neural networks, model training, and real-world applications using Python and TensorFlow.', event_date: '2026-03-15', max_participants: 50, registered: 18, event_type: 'solo', team_min: null, team_max: null },
            { id: 2, title: 'Full-Stack Dev Hackathon', description: '48-hour coding marathon. Build a complete web app from scratch. Cash prizes for top 3 teams. Participate solo or as a team of up to 4 members.', event_date: '2026-03-16', max_participants: 40, registered: 32, event_type: 'team', team_min: 2, team_max: 4 },
            { id: 3, title: 'Cybersecurity CTF Challenge', description: 'Capture-the-Flag competition. Solve progressively harder real-world security puzzles across web exploitation, cryptography, and reverse engineering.', event_date: '2026-03-18', max_participants: 60, registered: 18, event_type: 'solo', team_min: null, team_max: null },
            { id: 4, title: 'Cloud Computing Seminar', description: 'Industry experts from AWS and Google Cloud walk through modern cloud architecture, DevOps pipelines, container orchestration, and serverless deployment.', event_date: '2026-03-15', max_participants: 80, registered: 45, event_type: 'solo', team_min: null, team_max: null },
            { id: 5, title: 'UI/UX Design Sprint', description: '2-day workshop covering wireframing, Figma prototyping, design systems, and user testing with real participants.', event_date: '2026-03-16', max_participants: 30, registered: 30, event_type: 'team', team_min: 2, team_max: 3 },
            { id: 6, title: 'Blockchain & Web3 Talk', description: 'Deep dive into decentralised apps, smart contracts, NFT standards, and the evolving landscape of Web3 with seasoned developers.', event_date: '2026-03-18', max_participants: 100, registered: 55, event_type: 'solo', team_min: null, team_max: null },
        ];

        let nextId = 7;
        let pendingDeleteId = null;
        let isEditMode = false;
        let selectedType = null;   // 'solo' | 'team' | null
        let tableSearch = '';
        let tableType = 'all';
        let tableStatus = 'all';
        function loadEvents(callback) {
            $.ajax({
                url: 'api/events/get_events.php',
                type: 'GET',
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        events = response.data;
                        // Track next available ID
                        if (events.length > 0) {
                            nextId = Math.max(...events.map(e => parseInt(e.id))) + 1;
                        }
                        renderTable();
                        updateStats();
                        if (typeof callback === 'function') callback();
                    } else {
                        showToast('error', 'Failed to load events: ' + (response.message || 'Unknown error'));
                    }
                },
                error: function(xhr, status, error) {
                    showToast('error', 'Network error loading events. Check your server.');
                    console.error('Load events error:', status, error);
                }
            });
        }

        /* ═══════════════════════════════════════════
           INIT
        ═══════════════════════════════════════════ */
        document.addEventListener('DOMContentLoaded', () => {
            const initials = adminUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            document.getElementById('navAvatar').textContent = initials;
            document.getElementById('navUserName').textContent = adminUser.name;
            document.getElementById('dropdownName').textContent = adminUser.name;
            document.getElementById('dropdownEmail').textContent = adminUser.email;

            renderTable();
            updateStats();

            // Set minimum date to today
            document.getElementById('fDate').min = new Date().toISOString().split('T')[0];

            // Close dropdown on outside click
            document.addEventListener('click', e => {
                if (!document.getElementById('userDropdown').contains(e.target))
                    document.getElementById('userDropdown').classList.remove('open');
            });
        });

        /* ═══════════════════════════════════════════
           RENDER TABLE
        ═══════════════════════════════════════════ */
        function renderTable() {
            const tbody = document.getElementById('eventsTableBody');
            let list = [...events];

            if (tableSearch.trim()) {
                const q = tableSearch.toLowerCase();
                list = list.filter(e => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q));
            }
            if (tableType !== 'all') list = list.filter(e => e.event_type === tableType);
            if (tableStatus !== 'all') list = list.filter(e => getStatus(e) === tableStatus);

            document.getElementById('tableCount').textContent = list.length + ' event' + (list.length !== 1 ? 's' : '');

            if (!list.length) {
                tbody.innerHTML = `<tr><td colspan="7"><div class="table-empty"><svg viewBox="0 0 24 24" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><p>No events match your filters.</p></div></td></tr>`;
                return;
            }

            tbody.innerHTML = list.map(e => {
                const left = e.max_participants - e.registered;
                const pct = Math.min(Math.round((e.registered / e.max_participants) * 100), 100);
                const st = getStatus(e);
                const fillC = st === 'full' ? '#ef4444' : st === 'filling' ? '#f59e0b' : '#3DDA6E';
                const leftC = st === 'full' ? 'var(--red)' : st === 'filling' ? 'var(--amber)' : 'var(--green)';

                const statusHtml = {
                    open: '<span class="status-badge status-open"><span class="dot"></span>Open</span>',
                    filling: '<span class="status-badge status-filling"><span class="dot"></span>Filling</span>',
                    full: '<span class="status-badge status-full"><span class="dot"></span>Full</span>',
                }[st];

                const typeHtml = e.event_type === 'team'
                    ? `<span class="type-pill type-team">
             <svg viewBox="0 0 24 24" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
             Team (${e.team_min}–${e.team_max})
           </span>`
                    : `<span class="type-pill type-solo">
             <svg viewBox="0 0 24 24" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
             Solo
           </span>`;

                return `
        <tr>
          <td><span class="td-id">#${e.id}</span></td>
          <td>
            <div class="td-title">${escHtml(e.title)}</div>
            <div class="td-desc">${escHtml(e.description)}</div>
          </td>
          <td>${typeHtml}</td>
          <td style="white-space:nowrap;color:var(--white)">${formatDate(e.event_date)}</td>
          <td>
            <div class="seats-mini">
              <div class="seats-mini-label">
                <span>Seats</span>
                <span style="color:${leftC};font-weight:700">${st === 'full' ? 'FULL' : left + ' left'}</span>
              </div>
              <div class="seats-mini-track">
                <div class="seats-mini-fill" style="width:${pct}%;background:${fillC}"></div>
              </div>
              <span class="seats-mini-sub">${e.registered}/${e.max_participants} registered</span>
            </div>
          </td>
          <td>${statusHtml}</td>
          <td>
            <div class="action-btns">
              <button class="action-btn edit" title="Edit" onclick="openEditModal(${e.id})">
                <svg viewBox="0 0 24 24" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="action-btn delete" title="Delete" onclick="openDeleteModal(${e.id})">
                <svg viewBox="0 0 24 24" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
              </button>
            </div>
          </td>
        </tr>`;
            }).join('');
        }

        function filterTable() {
            tableSearch = document.getElementById('tableSearch').value;
            tableType = document.getElementById('typeFilter').value;
            tableStatus = document.getElementById('statusFilter').value;
            renderTable();
        }

        /* ═══════════════════════════════════════════
           STATS
        ═══════════════════════════════════════════ */
        function updateStats() {
            document.getElementById('scTotal').textContent = events.length;
            document.getElementById('scCapacity').textContent = events.reduce((s, e) => s + e.max_participants, 0);
            document.getElementById('scTeam').textContent = events.filter(e => e.event_type === 'team').length;
            document.getElementById('scFull').textContent = events.filter(e => e.registered >= e.max_participants).length;
        }

        /* ═══════════════════════════════════════════
           EVENT TYPE SELECTION
        ═══════════════════════════════════════════ */
        function selectType(type) {
            selectedType = type;
            document.getElementById('optSolo').className = 'type-option' + (type === 'solo' ? ' selected-solo' : '');
            document.getElementById('optTeam').className = 'type-option' + (type === 'team' ? ' selected-team' : '');
            document.getElementById('teamFields').classList.toggle('show', type === 'team');
            document.getElementById('fTypeErr').classList.remove('show');
            // Clear team fields if switching to solo
            if (type === 'solo') {
                document.getElementById('fTeamMin').value = '';
                document.getElementById('fTeamMax').value = '';
                document.getElementById('fTeamMinErr').classList.remove('show');
                document.getElementById('fTeamMaxErr').classList.remove('show');
                document.getElementById('fTeamMin').classList.remove('error');
                document.getElementById('fTeamMax').classList.remove('error');
            }
        }

        /* ═══════════════════════════════════════════
           CREATE MODAL
        ═══════════════════════════════════════════ */
        function openCreateModal() {
            isEditMode = false;
            document.getElementById('formTitle').textContent = 'Create New Event';
            document.getElementById('formSub').textContent = 'Fill in the details to add an event to TechFest 2026.';
            document.getElementById('formSubmitBtn').innerHTML = '<svg viewBox="0 0 24 24" stroke-width="2.5" width="14" height="14" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Create Event';
            document.getElementById('formStripe').className = 'modal-stripe blue';
            document.getElementById('editEventId').value = '';
            document.getElementById('eventForm').reset();
            document.getElementById('descCount').textContent = '0 / 600';
            selectedType = null;
            document.getElementById('optSolo').className = 'type-option';
            document.getElementById('optTeam').className = 'type-option';
            document.getElementById('teamFields').classList.remove('show');
            clearFormErrors();
            openModal('eventFormOverlay');
            setTimeout(() => document.getElementById('fTitle').focus(), 300);
        }

        /* ═══════════════════════════════════════════
           EDIT MODAL
        ═══════════════════════════════════════════ */
        function openEditModal(id) {
            const e = events.find(ev => ev.id === id);
            if (!e) return;
            isEditMode = true;

            document.getElementById('formTitle').textContent = 'Edit Event';
            document.getElementById('formSub').textContent = 'Update the event details below.';
            document.getElementById('formSubmitBtn').innerHTML = '<svg viewBox="0 0 24 24" stroke-width="2.5" width="14" height="14" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Save Changes';
            document.getElementById('formStripe').className = 'modal-stripe';
            document.getElementById('editEventId').value = id;

            document.getElementById('fTitle').value = e.title;
            document.getElementById('fDesc').value = e.description;
            document.getElementById('fDate').value = e.event_date;
            document.getElementById('fMax').value = e.max_participants;
            document.getElementById('descCount').textContent = e.description.length + ' / 600';

            // Restore type selection
            selectedType = e.event_type;
            document.getElementById('optSolo').className = 'type-option' + (e.event_type === 'solo' ? ' selected-solo' : '');
            document.getElementById('optTeam').className = 'type-option' + (e.event_type === 'team' ? ' selected-team' : '');
            document.getElementById('teamFields').classList.toggle('show', e.event_type === 'team');
            if (e.event_type === 'team') {
                document.getElementById('fTeamMin').value = e.team_min ?? '';
                document.getElementById('fTeamMax').value = e.team_max ?? '';
            }

            clearFormErrors();
            openModal('eventFormOverlay');
            setTimeout(() => document.getElementById('fTitle').focus(), 300);
        }

        function closeForm() {
            closeModal('eventFormOverlay');
            setTimeout(() => { document.getElementById('eventForm').reset(); clearFormErrors(); }, 300);
        }
        function closeFormOutside(e) { if (e.target === document.getElementById('eventFormOverlay')) closeForm(); }

        /* ═══════════════════════════════════════════
           FORM SUBMIT
        ═══════════════════════════════════════════ */
        document.getElementById('eventForm').addEventListener('submit', function (e) {
            e.preventDefault();
            let ok = true;
            ok &= vf('fTitle', 'fTitleErr', v => v.length >= 3, 'Please enter a title (min 3 characters).');
            ok &= vf('fDesc', 'fDescErr', v => v.length >= 10, 'Please enter a description (min 10 characters).');
            ok &= vf('fDate', 'fDateErr', v => v !== '', 'Please select an event date.');
            ok &= vf('fMax', 'fMaxErr', v => { const n = parseInt(v); return !isNaN(n) && n >= 1 && n <= 1000; }, 'Enter a valid number (1–1000).');

            // Event type
            if (!selectedType) {
                document.getElementById('fTypeErr').textContent = 'Please select an event type.';
                document.getElementById('fTypeErr').classList.add('show');
                ok = false;
            } else {
                document.getElementById('fTypeErr').classList.remove('show');
            }

            // Team fields
            if (selectedType === 'team') {
                const minV = parseInt(document.getElementById('fTeamMin').value);
                const maxV = parseInt(document.getElementById('fTeamMax').value);
                ok &= vf('fTeamMin', 'fTeamMinErr', v => { const n = parseInt(v); return !isNaN(n) && n >= 2 && n <= 20; }, 'Enter min team size (2–20).');
                if (document.getElementById('fTeamMin').value && !isNaN(minV)) {
                    ok &= vf('fTeamMax', 'fTeamMaxErr', v => { const n = parseInt(v); return !isNaN(n) && n >= minV && n <= 20; }, `Enter max team size (≥ ${minV}).`);
                } else {
                    ok &= vf('fTeamMax', 'fTeamMaxErr', v => { const n = parseInt(v); return !isNaN(n) && n >= 2 && n <= 20; }, 'Enter max team size (2–20).');
                }
            }

            if (!ok) return;

            const btn = document.getElementById('formSubmitBtn');
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> Saving…';

            const payload = {
                title: document.getElementById('fTitle').value.trim(),
                description: document.getElementById('fDesc').value.trim(),
                event_date: document.getElementById('fDate').value,
                max_participants: parseInt(document.getElementById('fMax').value),
                event_type: selectedType,
                team_min: selectedType === 'team' ? parseInt(document.getElementById('fTeamMin').value) : null,
                team_max: selectedType === 'team' ? parseInt(document.getElementById('fTeamMax').value) : null,
            };
            if (isEditMode) payload.id = parseInt(document.getElementById('editEventId').value);

            const url = isEditMode ? 'api/admin/update_event.php' : 'api/admin/create_event.php';

            $.ajax({
                url: url,
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(payload),
                dataType: 'json',
                success: function(response) {
                   btn.disabled = false;
                    const label = isEditMode ? 'Save Changes' : 'Create Event';
                    btn.innerHTML = `<svg viewBox="0 0 24 24" stroke-width="2.5" width="14" height="14" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> ${label}`;

                    if (response.success) {
                        closeForm();
                        // Reload events from server to get fresh data
                        loadEvents();
                        showToast('success', isEditMode ? '✅ Event updated successfully!' : '✅ Event created successfully!');
                     } else {
                       events.push({ ...payload, id: data.id, registered: 0 });
                     }
                     closeForm(); renderTable(); updateStats();
                     showToast('success', isEditMode ? '✅ Event updated!' : '✅ Event created!');
                   } else {
                     showToast('error', data.message || 'Something went wrong.');
                   }
                 });
            ─────────────────────────────────────────────────────────────────── */
            setTimeout(() => {
                btn.disabled = false;
                const label = isEditMode ? 'Save Changes' : 'Create Event';
                btn.innerHTML = `<svg viewBox="0 0 24 24" stroke-width="2.5" width="14" height="14" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> ${label}`;
                if (isEditMode) {
                    const idx = events.findIndex(ev => ev.id === payload.id);
                    if (idx > -1) Object.assign(events[idx], payload);
                    showToast('success', '✅ Event updated successfully!');
                } else {
                    events.push({ ...payload, id: nextId++, registered: 0 });
                    showToast('success', '✅ Event created successfully!');
                }
                closeForm(); renderTable(); updateStats();
            }, 900);
        });

        /* ═══════════════════════════════════════════
           DELETE MODAL
        ═══════════════════════════════════════════ */
        function openDeleteModal(id) {
            const e = events.find(ev => ev.id === id);
            if (!e) return;
            pendingDeleteId = id;
            document.getElementById('deleteEventName').textContent = e.title;
            openModal('deleteOverlay');
        }
        function closeDelete() { closeModal('deleteOverlay'); pendingDeleteId = null; }
        function closeDeleteOutside(e) { if (e.target === document.getElementById('deleteOverlay')) closeDelete(); }

        function confirmDelete() {
            if (!pendingDeleteId) return;
            const btn = document.getElementById('deleteConfirmBtn');
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner white"></span> Deleting…';

            /* ─── REPLACE WITH ────────────────────────────────────────────────────
               fetch('admin_delete_event.php', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: pendingDeleteId }) })
                 .then(r => r.json())
                 .then(data => {
                   btn.disabled = false;
                   btn.innerHTML = 'Delete Event';
                   if (data.success) {
                     events = events.filter(e => e.id !== pendingDeleteId);
                     closeDelete(); renderTable(); updateStats();
                     showToast('success', '🗑️ Event deleted.');
                   } else {
                     showToast('error', data.message || 'Could not delete.');
                   }
                 });
            ─────────────────────────────────────────────────────────────────── */
            setTimeout(() => {
                events = events.filter(ev => ev.id !== pendingDeleteId);
                btn.disabled = false;
                btn.innerHTML = '<svg viewBox="0 0 24 24" stroke-width="2" width="14" height="14" stroke="#fff" fill="none"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4h6v2"/></svg> Delete Event';
                closeDelete(); renderTable(); updateStats();
                showToast('success', '🗑️ Event deleted successfully.');
            }, 800);
        }

        /* ═══════════════════════════════════════════
           DROPDOWN
        ═══════════════════════════════════════════ */
        function toggleDropdown() { document.getElementById('userDropdown').classList.toggle('open'); }
        function goAccount() { window.location.href = 'admin_account.php'; }
        function logout() {
            /* fetch('logout.php').then(() => window.location.href = 'index.html'); */
            window.location.href = 'index.html';
        }

        /* ═══════════════════════════════════════════
           HELPERS
        ═══════════════════════════════════════════ */
        function getStatus(e) {
            if (e.registered >= e.max_participants) return 'full';
            if ((e.registered / e.max_participants) >= 0.7) return 'filling';
            return 'open';
        }
        function openModal(id) { document.getElementById(id).classList.add('open'); document.body.style.overflow = 'hidden'; }
        function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow = ''; }

        function vf(id, errId, check, msg) {
            const val = document.getElementById(id).value.trim();
            const el = document.getElementById(id);
            const err = document.getElementById(errId);
            if (!check(val)) {
                el.classList.add('error'); err.textContent = msg; err.classList.add('show'); return false;
            }
            el.classList.remove('error'); err.classList.remove('show'); return true;
        }
        function clearFormErrors() {
            document.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
            document.querySelectorAll('.form-error').forEach(el => el.classList.remove('show'));
        }
        function updateCharCount() {
            const len = document.getElementById('fDesc').value.length;
            const el = document.getElementById('descCount');
            el.textContent = len + ' / 600';
            el.style.color = len > 540 ? 'var(--amber)' : 'var(--gray)';
        }
        function formatDate(s) {
            if (!s) return '—';
            return new Date(s + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        }
        function escHtml(str) {
            const d = document.createElement('div');
            d.appendChild(document.createTextNode(str));
            return d.innerHTML;
        }
        function showToast(type, msg) {
            const t = document.getElementById(type === 'error' ? 'toastError' : 'toastSuccess');
            const msg_el = document.getElementById(type === 'error' ? 'toastErrorMsg' : 'toastSuccessMsg');
            msg_el.textContent = msg;
            t.classList.add('show');
            setTimeout(() => t.classList.remove('show'), 3500);
        }
