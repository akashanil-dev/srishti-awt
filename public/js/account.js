/* ═══════════════════════════════════════════
   ACCOUNT PAGE — JS
   Loads user data from session, handles profile
   update, password change, and account deletion.
═══════════════════════════════════════════ */

let currentUser = null;

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    loadUser();

    document.addEventListener('click', e => {
        if (!document.getElementById('userDropdown').contains(e.target))
            document.getElementById('userDropdown').classList.remove('open');
    });
});

function loadUser() {
    $.ajax({
        url: 'api/auth/check_session.php',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                currentUser = response.data;
                populateUI();
            } else {
                window.location.href = 'index.html';
            }
        },
        error: function () {
            window.location.href = 'index.html';
        }
    });
}

function populateUI() {
    const u = currentUser;
    const initials = u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    // Topbar
    document.getElementById('navAvatar').textContent = initials;
    document.getElementById('navUserName').textContent = u.name;
    document.getElementById('dropdownName').textContent = u.name;
    document.getElementById('dropdownEmail').textContent = u.email;

    // Page header
    document.getElementById('headerAvatar').childNodes[0].textContent = initials;
    document.getElementById('headerName').textContent = u.name;
    document.getElementById('headerEmail').textContent = u.email;
    document.getElementById('headerBranch').textContent = u.branch || '—';
    document.getElementById('headerYear').textContent = u.year_of_passing || '—';

    // Profile form pre-fill
    document.getElementById('pName').value = u.name;
    document.getElementById('pPhone').value = u.phone || '';
    document.getElementById('pEmail').value = u.email;
    document.getElementById('pBranch').value = u.branch || '';
    document.getElementById('pYear').value = u.year_of_passing || '';

    // Delete modal email hint
    document.getElementById('confirmEmailHint').textContent = u.email;
}

/* ═══════════════════════════════════════════
   PROFILE FORM SUBMIT
═══════════════════════════════════════════ */
$('#profileForm').on('submit', function (e) {
    e.preventDefault();
    let ok = true;
    ok &= vf('pName', 'pNameErr', v => v.length >= 2);
    ok &= vf('pPhone', 'pPhoneErr', v => /^\d{10}$/.test(v), 'Please enter a valid 10-digit phone number.');
    ok &= vf('pBranch', 'pBranchErr', v => v !== '');
    ok &= vf('pYear', 'pYearErr', v => v !== '');
    if (!ok) return;

    const btn = document.getElementById('profileSaveBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Saving…';

    const payload = {
        name: document.getElementById('pName').value.trim(),
        phone: document.getElementById('pPhone').value.trim(),
        branch: document.getElementById('pBranch').value,
        year_of_passing: parseInt(document.getElementById('pYear').value),
    };

    $.ajax({
        url: 'api/user/update_profile.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        dataType: 'json',
        success: function (response) {
            btn.disabled = false;
            btn.innerHTML = '<svg viewBox="0 0 24 24" stroke-width="2.5" width="14" height="14" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Save Changes';
            if (response.success) {
                Object.assign(currentUser, payload);
                populateUI();
                showToast('success', 'Profile updated successfully!');
            } else {
                showToast('error', response.message || 'Update failed.');
            }
        },
        error: function () {
            btn.disabled = false;
            btn.innerHTML = '<svg viewBox="0 0 24 24" stroke-width="2.5" width="14" height="14" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Save Changes';
            showToast('error', 'Network error. Please try again.');
        }
    });
});

/* ═══════════════════════════════════════════
   PASSWORD FORM SUBMIT
═══════════════════════════════════════════ */
$('#passwordForm').on('submit', function (e) {
    e.preventDefault();
    let ok = true;
    ok &= vf('pCurPass', 'pCurPassErr', v => v.length > 0);
    ok &= vf('pNewPass', 'pNewPassErr', v => v.length >= 8);
    ok &= vf('pConfPass', 'pConfPassErr', v => v === document.getElementById('pNewPass').value);
    if (!ok) return;

    const btn = document.getElementById('passSaveBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Updating…';

    $.ajax({
        url: 'api/user/update_password.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            current_pass: document.getElementById('pCurPass').value,
            new_pass: document.getElementById('pNewPass').value,
        }),
        dataType: 'json',
        success: function (response) {
            btn.disabled = false;
            btn.innerHTML = '<svg viewBox="0 0 24 24" stroke-width="2.5" width="14" height="14" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Update Password';
            if (response.success) {
                document.getElementById('passwordForm').reset();
                document.getElementById('strengthBar').style.display = 'none';
                showToast('info', 'Password changed. Logging you out…');
                setTimeout(() => { window.location.href = 'index.html'; }, 2400);
            } else {
                if (response.message && response.message.toLowerCase().includes('current password')) {
                    document.getElementById('pCurPassErr').textContent = response.message;
                    document.getElementById('pCurPassErr').classList.add('show');
                    document.getElementById('pCurPass').classList.add('error');
                } else {
                    showToast('error', response.message || 'Password update failed.');
                }
            }
        },
        error: function () {
            btn.disabled = false;
            btn.innerHTML = '<svg viewBox="0 0 24 24" stroke-width="2.5" width="14" height="14" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg> Update Password';
            showToast('error', 'Network error. Please try again.');
        }
    });
});

/* ═══════════════════════════════════════════
   PASSWORD STRENGTH METER
═══════════════════════════════════════════ */
function checkStrength() {
    const val = document.getElementById('pNewPass').value;
    const bar = document.getElementById('strengthBar');
    const fill = document.getElementById('strengthFill');
    const lbl = document.getElementById('strengthLabel');

    if (!val) { bar.style.display = 'none'; return; }
    bar.style.display = 'block';

    let score = 0;
    if (val.length >= 8) score++;
    if (val.length >= 12) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = [
        { pct: '20%', color: '#ef4444', label: 'Very weak' },
        { pct: '40%', color: '#f97316', label: 'Weak' },
        { pct: '60%', color: '#f59e0b', label: 'Fair' },
        { pct: '80%', color: '#3DDA6E', label: 'Strong' },
        { pct: '100%', color: '#22c55e', label: 'Very strong' },
    ];
    const l = levels[Math.max(0, score - 1)];
    fill.style.width = l.pct;
    fill.style.background = l.color;
    lbl.textContent = l.label;
    lbl.style.color = l.color;
}

/* ═══════════════════════════════════════════
   DELETE ACCOUNT MODAL
═══════════════════════════════════════════ */
function openDeleteModal() {
    document.getElementById('deleteConfirmInput').value = '';
    document.getElementById('deleteConfirmErr').classList.remove('show');
    document.getElementById('deleteConfirmInput').style.borderColor = '';
    document.getElementById('deleteOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('deleteConfirmInput').focus(), 300);
}
function closeDelete() {
    document.getElementById('deleteOverlay').classList.remove('open');
    document.body.style.overflow = '';
}
function closeDeleteOutside(e) {
    if (e.target === document.getElementById('deleteOverlay')) closeDelete();
}

function confirmDelete() {
    const typed = document.getElementById('deleteConfirmInput').value.trim();
    const errEl = document.getElementById('deleteConfirmErr');
    const inp = document.getElementById('deleteConfirmInput');

    if (typed !== currentUser.email) {
        errEl.textContent = 'Email does not match. Please type your exact email address.';
        errEl.classList.add('show');
        inp.style.borderColor = 'rgba(239,68,68,0.5)';
        inp.focus();
        return;
    }
    errEl.classList.remove('show');

    const btn = document.getElementById('deleteFinalBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner white"></span> Deleting…';

    $.ajax({
        url: 'api/user/delete_account.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email: currentUser.email }),
        dataType: 'json',
        success: function (response) {
            btn.disabled = false;
            btn.innerHTML = 'Delete My Account';
            if (response.success) {
                closeDelete();
                showToast('error', 'Account deleted. Redirecting…');
                setTimeout(() => { window.location.href = 'index.html'; }, 2400);
            } else {
                showToast('error', response.message || 'Could not delete account.');
            }
        },
        error: function () {
            btn.disabled = false;
            btn.innerHTML = 'Delete My Account';
            showToast('error', 'Network error. Please try again.');
        }
    });
}

/* ═══════════════════════════════════════════
   DROPDOWN & LOGOUT
═══════════════════════════════════════════ */
function toggleDropdown() {
    document.getElementById('userDropdown').classList.toggle('open');
}
function logout() {
    $.ajax({
        url: 'api/auth/logout.php',
        type: 'GET',
        complete: function () {
            window.location.href = 'index.html';
        }
    });
}

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function vf(id, errId, check) {
    const $el = $('#' + id);
    const $err = $('#' + errId);
    const val = $el.val() ? $el.val().trim() : '';
    if (!check(val)) {
        $el.addClass('error');
        $err.addClass('show');
        return false;
    }
    $el.removeClass('error');
    $err.removeClass('show');
    return true;
}

function togglePass(inputId, btn) {
    const inp = document.getElementById(inputId);
    const icon = btn.querySelector('svg');
    if (inp.type === 'password') {
        inp.type = 'text';
        btn.style.opacity = '0.45';
        icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>';
    } else {
        inp.type = 'password';
        btn.style.opacity = '1';
        icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    }
}

function showToast(type, msg) {
    const map = { success: 'toastSuccess', error: 'toastError', info: 'toastInfo' };
    const mmap = { success: 'toastSuccessMsg', error: 'toastErrorMsg', info: 'toastInfoMsg' };
    const t = document.getElementById(map[type]);
    document.getElementById(mmap[type]).textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
}
