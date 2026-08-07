// ============================================
// GALAXY LOGBOOK - QR LIBRARY SYSTEM
// All data stored in browser localStorage
// No Firebase, No API keys needed
// ============================================

const DB = {
    USERS: 'gl_users',
    BOOKS: 'gl_books',
    TRANS: 'gl_transactions',
    SESSION: 'gl_session'
};

let currentUser = null, userRole = null, userData = null;
let html5QrCode = null, currentCamera = null, cameras = [];
let bookFilter = 'all', actionBookId = null;

// ===== UUID =====
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

// ===== LOCALSTORAGE HELPERS =====
function getData(key) { const d = localStorage.getItem(key); return d ? JSON.parse(d) : []; }
function setData(key, data) { localStorage.setItem(key, JSON.stringify(data)); }
function getSession() { const d = localStorage.getItem(DB.SESSION); return d ? JSON.parse(d) : null; }
function setSession(user) { localStorage.setItem(DB.SESSION, JSON.stringify(user)); }
function clearSession() { localStorage.removeItem(DB.SESSION); }

// ===== UI HELPERS =====
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function showLoading(show) { document.getElementById('loading').classList.toggle('active', show); }

function toast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    t.innerHTML = `<i class="fas ${icons[type]}"></i> <span>${msg}</span>`;
    container.appendChild(t);
    setTimeout(() => { t.classList.add('hide'); setTimeout(() => t.remove(), 300); }, 3500);
}

function esc(text) {
    if (!text) return '';
    const d = document.createElement('div'); d.textContent = text; return d.innerHTML;
}

// ===== LOGIN TABS =====
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(`${tab}-panel`).classList.add('active');
}

function showRegister() {
    document.getElementById('stu-login-view').style.display = 'none';
    document.getElementById('stu-register-view').style.display = 'block';
}

function showLogin() {
    document.getElementById('stu-register-view').style.display = 'none';
    document.getElementById('stu-login-view').style.display = 'block';
}

// ===== STUDENT REGISTER =====
function registerStudent() {
    const lrn = document.getElementById('reg-lrn').value.trim();
    const fullname = document.getElementById('reg-name').value.trim();
    const username = document.getElementById('reg-user').value.trim().toLowerCase();
    const pass = document.getElementById('reg-pass').value;
    const pass2 = document.getElementById('reg-pass2').value;
    const grade = document.getElementById('reg-grade').value;
    const section = document.getElementById('reg-section').value.trim().toUpperCase();

    if (!lrn || !fullname || !username || !pass || !grade || !section) {
        toast('Please fill in all fields.', 'warning'); return;
    }
    if (lrn.length !== 12 || !/^\d+$/.test(lrn)) {
        toast('LRN must be exactly 12 digits.', 'warning'); return;
    }
    if (pass.length < 6) { toast('Password must be at least 6 characters.', 'warning'); return; }
    if (pass !== pass2) { toast('Passwords do not match.', 'warning'); return; }
    if (!/^[a-z0-9_]+$/.test(username)) {
        toast('Username: letters, numbers, underscores only.', 'warning'); return;
    }

    const users = getData(DB.USERS);
    if (users.find(u => u.username === username)) { toast('Username already taken.', 'warning'); return; }
    if (users.find(u => u.lrn === lrn)) { toast('This LRN is already registered.', 'warning'); return; }

    const newUser = {
        id: uuid(), username, password: pass, fullName: fullname,
        lrn, grade, section, role: 'student', createdAt: new Date().toISOString()
    };
    users.push(newUser); setData(DB.USERS, users);
    toast('Account created! Welcome, ' + fullname + '!', 'success');
    showLogin(); document.getElementById('stu-user').value = username;
}

// ===== STUDENT LOGIN =====
function loginStudent() {
    const username = document.getElementById('stu-user').value.trim().toLowerCase();
    const pass = document.getElementById('stu-pass').value;
    if (!username || !pass) { toast('Enter username and password.', 'warning'); return; }

    const users = getData(DB.USERS);
    const user = users.find(u => u.username === username && u.password === pass);
    if (!user) { toast('Invalid username or password.', 'error'); return; }
    if (user.role !== 'student') { toast('This is not a student account.', 'error'); return; }

    currentUser = user; userRole = 'student'; userData = user; setSession(user);
    setupStudent(); showScreen('student-screen'); toast('Welcome, ' + user.fullName + '!', 'success');
}

// ===== STAFF LOGIN =====
function loginStaff() {
    const username = document.getElementById('staff-user').value.trim();
    const pass = document.getElementById('staff-pass').value;
    if (!username || !pass) { toast('Enter username and password.', 'warning'); return; }
    if (username !== 'staff' || pass !== 'anonangnationalhighschool') {
        toast('Invalid staff credentials.', 'error'); return;
    }

    let users = getData(DB.USERS);
    let admin = users.find(u => u.username === 'staff');
    if (!admin) {
        admin = { id: uuid(), username: 'staff', password: 'anonangnationalhighschool',
            fullName: 'School Staff', role: 'admin', createdAt: new Date().toISOString() };
        users.push(admin); setData(DB.USERS, users);
    }
    currentUser = admin; userRole = 'admin'; userData = admin; setSession(admin);
    setupStaff(); showScreen('staff-screen'); toast('Welcome to Staff Portal!', 'success');
}

// ===== LOGOUT =====
function logout() {
    currentUser = null; userRole = null; userData = null; clearSession();
    showScreen('login-screen'); toast('Logged out.', 'info');
    document.querySelectorAll('input[type="password"]').forEach(i => i.value = '');
}

// ===== SESSION CHECK =====
function checkSession() {
    const saved = getSession();
    if (!saved) return;
    const users = getData(DB.USERS);
    const user = users.find(u => u.id === saved.id);
    if (!user) { clearSession(); return; }
    currentUser = user; userRole = user.role; userData = user;
    if (userRole === 'admin') { setupStaff(); showScreen('staff-screen'); }
    else { setupStudent(); showScreen('student-screen'); }
}

// ===== STUDENT DASHBOARD =====
function setupStudent() {
    const name = userData.fullName || userData.username;
    document.getElementById('stu-top-name').textContent = name;
    document.getElementById('stu-top-grade').textContent = (userData.grade || '') + (userData.section ? ' - ' + userData.section : '');
    document.getElementById('hero-name').textContent = name.split(' ')[0];
    loadStudentHistory();
}

function loadStudentHistory() {
    const trans = getData(DB.TRANS).filter(t => t.studentId === currentUser.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const list = document.getElementById('student-history');
    if (trans.length === 0) {
        list.innerHTML = `<div class="empty"><i class="fas fa-inbox"></i><p>No records yet. Scan a QR code to get started!</p></div>`;
        return;
    }
    list.innerHTML = trans.map(t => {
        const time = new Date(t.timestamp).toLocaleString();
        const icon = t.type === 'borrow' ? 'fa-book' : 'fa-undo';
        const cls = t.type === 'borrow' ? 'out' : 'in';
        const label = t.type === 'borrow' ? 'Borrowed' : 'Returned';
        return `<div class="trans-item"><div class="trans-ico ${cls}"><i class="fas ${icon}"></i></div><div class="trans-info"><div class="trans-book">${esc(t.bookTitle)}</div><div class="trans-meta">${label}${t.notes ? ' · ' + esc(t.notes) : ''}</div></div><div class="trans-time">${time}</div></div>`;
    }).join('');
}

// ===== STAFF DASHBOARD =====
function setupStaff() {
    refreshStats(); loadBooks(); loadBorrowed(); loadReturned(); loadStudents(); loadTransactions();
}

function refreshStats() {
    const books = getData(DB.BOOKS);
    const trans = getData(DB.TRANS);
    const users = getData(DB.USERS);
    const students = users.filter(u => u.role === 'student');
    document.getElementById('s-total').textContent = books.length;
    document.getElementById('s-borrowed').textContent = books.filter(b => b.status === 'borrowed').length;
    document.getElementById('s-available').textContent = books.filter(b => b.status === 'available').length;
    document.getElementById('s-trans').textContent = trans.length;
    document.getElementById('s-students').textContent = students.length;
}

// ===== BOOKS =====
function loadBooks() {
    const books = getData(DB.BOOKS).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const filtered = bookFilter === 'all' ? books : books.filter(b => b.status === bookFilter);
    const list = document.getElementById('books-list');
    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty"><i class="fas fa-books"></i><p>${bookFilter === 'all' ? 'No books yet. Add your first book above!' : 'No books match this filter.'}</p></div>`;
        return;
    }
    list.innerHTML = filtered.map(b => renderBookCard(b)).join('');
}

function renderBookCard(b) {
    const st = b.status === 'borrowed' ? 'borrowed' : 'available';
    const badge = b.status === 'borrowed' ? 'badge-out' : 'badge-ok';
    const label = b.status === 'borrowed' ? 'Borrowed' : 'Available';
    let borrower = '';
    if (b.status === 'borrowed' && b.borrowedByName) {
        const time = b.borrowedAt ? new Date(b.borrowedAt).toLocaleString() : '';
        borrower = `<div class="book-borrower"><i class="fas fa-user-clock"></i> Borrowed by ${esc(b.borrowedByName)}${time ? ' · ' + time : ''}</div>`;
    }
    return `
        <div class="book-item ${st}">
            <div class="book-top">
                <div><div class="book-title">${esc(b.title)}</div><div class="book-author">by ${esc(b.author)}</div></div>
                <span class="book-badge ${badge}">${label}</span>
            </div>
            <div class="book-actions">
                <button class="btn-xs btn-qr" onclick="showQR('${b.id}', '${esc(b.title)}')"><i class="fas fa-qrcode"></i> QR Code</button>
                <button class="btn-xs btn-del" onclick="deleteBook('${b.id}', '${esc(b.title)}')"><i class="fas fa-trash"></i> Delete</button>
            </div>
            ${borrower}
        </div>`;
}

function setFilter(f) {
    bookFilter = f;
    document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    loadBooks();
}

function addBook() {
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();
    if (!title || !author) { toast('Enter both title and author.', 'warning'); return; }

    const books = getData(DB.BOOKS);
    const book = { id: uuid(), title, author, status: 'available', borrowedBy: null, borrowedByName: null, borrowedAt: null, createdAt: new Date().toISOString() };
    books.push(book); setData(DB.BOOKS, books);
    toast(`"${title}" added successfully!`, 'success');
    document.getElementById('book-title').value = '';
    document.getElementById('book-author').value = '';
    refreshStats(); loadBooks(); loadBorrowed(); loadReturned();
    setTimeout(() => showQR(book.id, title), 300);
}

function deleteBook(id, title) {
    if (!confirm(`Delete "${title}"?`)) return;
    let books = getData(DB.BOOKS).filter(b => b.id !== id);
    setData(DB.BOOKS, books);
    toast(`"${title}" deleted.`, 'success');
    refreshStats(); loadBooks(); loadBorrowed(); loadReturned();
}

// ===== BORROWED & RETURNED LISTS =====
function loadBorrowed() {
    const books = getData(DB.BOOKS).filter(b => b.status === 'borrowed')
        .sort((a, b) => new Date(b.borrowedAt) - new Date(a.borrowedAt));
    const list = document.getElementById('borrowed-list');
    if (books.length === 0) {
        list.innerHTML = `<div class="empty"><i class="fas fa-check-circle"></i><p>No books are currently borrowed.</p></div>`;
        return;
    }
    list.innerHTML = books.map(b => renderBookCard(b)).join('');
}

function loadReturned() {
    const trans = getData(DB.TRANS).filter(t => t.type === 'return')
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20);
    const list = document.getElementById('returned-list');
    if (trans.length === 0) {
        list.innerHTML = `<div class="empty"><i class="fas fa-inbox"></i><p>No returned books yet.</p></div>`;
        return;
    }
    const books = getData(DB.BOOKS);
    list.innerHTML = trans.map(t => {
        const b = books.find(x => x.id === t.bookId);
        return `
            <div class="book-item available">
                <div class="book-top">
                    <div><div class="book-title">${esc(t.bookTitle)}</div><div class="book-author">${b ? 'by ' + esc(b.author) : ''}</div></div>
                    <span class="book-badge badge-ok">Returned</span>
                </div>
                <div class="book-borrower"><i class="fas fa-undo"></i> Returned by ${esc(t.studentName)} · ${new Date(t.timestamp).toLocaleString()}</div>
            </div>`;
    }).join('');
}

// ===== QR CODE =====
function showQR(bookId, title) {
    document.getElementById('qr-title').textContent = title;
    const display = document.getElementById('qr-display');
    display.innerHTML = '';
    new QRCode(display, { text: bookId, width: 200, height: 200, colorDark: '#8b5cf6', colorLight: '#0a0a1a', correctLevel: QRCode.CorrectLevel.H });
    document.getElementById('qr-modal').classList.add('active');
}

function closeQR() { document.getElementById('qr-modal').classList.remove('active'); }

function downloadQR() {
    const canvas = document.querySelector('#qr-display canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.download = 'book-qr-' + Date.now() + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click(); toast('QR code downloaded!', 'success');
    }
}

// ===== QR SCANNER WITH CAMERA SELECTION =====
async function openScanner() {
    document.getElementById('scanner-modal').classList.add('active');
    const select = document.getElementById('cam-select');
    select.innerHTML = '<option value="">Loading cameras...</option>';

    try {
        cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
            select.innerHTML = cameras.map((cam, i) => `<option value="${cam.id}">${cam.label || 'Camera ' + (i + 1)}</option>`).join('');
            currentCamera = cameras[0].id;
            startScanner(currentCamera);
        } else {
            select.innerHTML = '<option value="">No cameras found</option>';
            toast('No camera detected.', 'error');
        }
    } catch (err) {
        select.innerHTML = '<option value="">Camera error</option>';
        toast('Camera error: ' + err.message, 'error');
    }
}

function startScanner(cameraId) {
    const reader = document.getElementById('reader');
    reader.innerHTML = '';
    if (html5QrCode) {
        html5QrCode.stop().then(() => {
            html5QrCode.clear(); html5QrCode = null;
            doStart(cameraId);
        }).catch(() => doStart(cameraId));
    } else { doStart(cameraId); }
}

function doStart(cameraId) {
    html5QrCode = new Html5Qrcode('reader');
    html5QrCode.start(cameraId, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, onScanFailure)
        .catch(err => { toast('Scanner error: ' + err.message, 'error'); closeScanner(); });
}

function switchCamera() {
    const id = document.getElementById('cam-select').value;
    if (id && id !== currentCamera) { currentCamera = id; startScanner(id); }
}

function closeScanner() {
    document.getElementById('scanner-modal').classList.remove('active');
    if (html5QrCode) {
        html5QrCode.stop().then(() => { html5QrCode.clear(); html5QrCode = null; }).catch(() => {});
    }
}

function onScanSuccess(text) {
    closeScanner();
    const books = getData(DB.BOOKS);
    const book = books.find(b => b.id === text);
    if (!book) { toast('Invalid QR code. Book not found.', 'error'); return; }
    showAction(book.id, book);
}

function onScanFailure(err) {}

// ===== BOOK ACTION =====
function showAction(bookId, book) {
    actionBookId = bookId;
    const info = document.getElementById('action-info');
    const btn = document.getElementById('action-do');
    const isBorrowed = book.status === 'borrowed';
    const isMine = book.borrowedBy === currentUser.id;

    let status = '';
    if (isBorrowed) {
        if (isMine) status = `<span class="status-pill out">Borrowed by You</span>`;
        else status = `<span class="status-pill out">Borrowed by ${esc(book.borrowedByName || 'Someone')}</span>`;
    } else status = `<span class="status-pill ok">Available</span>`;

    info.innerHTML = `<div class="info-title">${esc(book.title)}</div><div class="info-author">by ${esc(book.author)}</div><div style="margin-top:10px;">${status}</div>`;

    if (isBorrowed) {
        if (isMine) {
            btn.innerHTML = '<i class="fas fa-undo"></i> Return Book';
            btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
            btn.onclick = () => doAction('return');
        } else {
            btn.innerHTML = '<i class="fas fa-lock"></i> Currently Borrowed';
            btn.style.background = 'var(--text-dark)'; btn.style.cursor = 'not-allowed'; btn.onclick = null;
        }
    } else {
        btn.innerHTML = '<i class="fas fa-book"></i> Borrow Book';
        btn.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
        btn.style.cursor = 'pointer'; btn.onclick = () => doAction('borrow');
    }
    document.getElementById('action-modal').classList.add('active');
}

function closeAction() {
    document.getElementById('action-modal').classList.remove('active');
    actionBookId = null; document.getElementById('action-note').value = '';
}

function doAction(type) {
    if (!actionBookId || !currentUser) return;
    const note = document.getElementById('action-note').value.trim();
    const books = getData(DB.BOOKS);
    const idx = books.findIndex(b => b.id === actionBookId);
    if (idx === -1) { toast('Book not found.', 'error'); return; }

    const book = books[idx];
    if (type === 'borrow') {
        book.status = 'borrowed';
        book.borrowedBy = currentUser.id;
        book.borrowedByName = currentUser.fullName || currentUser.username;
        book.borrowedAt = new Date().toISOString();
    } else {
        book.status = 'available'; book.borrowedBy = null; book.borrowedByName = null; book.borrowedAt = null;
    }
    books[idx] = book; setData(DB.BOOKS, books);

    const trans = getData(DB.TRANS);
    trans.push({
        id: uuid(), bookId: actionBookId, bookTitle: book.title,
        studentId: currentUser.id, studentName: currentUser.fullName || currentUser.username,
        studentGrade: currentUser.grade || '', studentSection: currentUser.section || '',
        type, notes: note || null, timestamp: new Date().toISOString()
    });
    setData(DB.TRANS, trans);

    closeAction();
    toast(type === 'borrow' ? 'Book borrowed successfully!' : 'Book returned successfully!', 'success');

    if (userRole === 'admin') { refreshStats(); loadBooks(); loadBorrowed(); loadReturned(); loadTransactions(); }
    else { loadStudentHistory(); }
}

// ===== TRANSACTIONS =====
function loadTransactions() {
    const trans = getData(DB.TRANS).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const list = document.getElementById('transactions-list');
    if (trans.length === 0) {
        list.innerHTML = `<div class="empty"><i class="fas fa-inbox"></i><p>No transactions recorded yet.</p></div>`;
        return;
    }
    list.innerHTML = trans.map(t => {
        const time = new Date(t.timestamp).toLocaleString();
        const icon = t.type === 'borrow' ? 'fa-book' : 'fa-undo';
        const cls = t.type === 'borrow' ? 'out' : 'in';
        const label = t.type === 'borrow' ? 'Borrowed' : 'Returned';
        const info = t.studentGrade && t.studentSection ? `(${t.studentGrade} - ${t.studentSection})` : '';
        return `<div class="trans-item"><div class="trans-ico ${cls}"><i class="fas ${icon}"></i></div><div class="trans-info"><div class="trans-book">${esc(t.bookTitle)}</div><div class="trans-meta">${label} by ${esc(t.studentName)} <span class="trans-tag">${esc(info)}</span>${t.notes ? ' · ' + esc(t.notes) : ''}</div></div><div class="trans-time">${time}</div></div>`;
    }).join('');
}

// ===== STUDENTS =====
function loadStudents() {
    const students = getData(DB.USERS).filter(u => u.role === 'student')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const list = document.getElementById('students-list');
    if (students.length === 0) {
        list.innerHTML = `<div class="empty"><i class="fas fa-users"></i><p>No registered students yet.</p></div>`;
        return;
    }
    list.innerHTML = `<table class="data-table"><thead><tr><th>LRN</th><th>Name</th><th>Grade & Section</th><th>Username</th></tr></thead><tbody>` +
        students.map(s => `<tr><td>${esc(s.lrn || '-')}</td><td class="name-cell">${esc(s.fullName || s.username)}</td><td class="meta-cell">${esc(s.grade || '-')} ${esc(s.section || '')}</td><td>${esc(s.username)}</td></tr>`).join('') +
        `</tbody></table>`;
}

// ===== EXPORT / IMPORT =====
function exportDB() {
    const data = { exportedAt: new Date().toISOString(), users: getData(DB.USERS), books: getData(DB.BOOKS), transactions: getData(DB.TRANS) };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'galaxy-logbook-backup-' + new Date().toISOString().split('T')[0] + '.json';
    link.click(); URL.revokeObjectURL(url); toast('Database exported!', 'success');
}

function importDB(input) {
    const file = input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.users || !data.books || !data.transactions) { toast('Invalid backup file.', 'error'); return; }
            if (!confirm('This will replace all current data. Continue?')) return;
            setData(DB.USERS, data.users); setData(DB.BOOKS, data.books); setData(DB.TRANS, data.transactions);
            toast('Database imported!', 'success'); refreshStats(); loadBooks(); loadBorrowed(); loadReturned(); loadTransactions(); loadStudents();
        } catch (err) { toast('Error reading file.', 'error'); }
    };
    reader.readAsText(file); input.value = '';
}

// ===== KEYBOARD =====
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeScanner(); closeAction(); closeQR(); } });

// ===== INIT =====
checkSession();
console.log('Galaxy Logbook loaded. All data in localStorage.');
