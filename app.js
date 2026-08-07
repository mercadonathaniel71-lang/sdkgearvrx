// ============================================
// ANONANG NATIONAL HIGH SCHOOL
// DIGITAL LOGBOOK - LOCALSTORAGE VERSION
// NO FIREBASE NEEDED - ALL DATA SAVED IN BROWSER
// ============================================

// ===== DATABASE KEYS =====
const DB_KEYS = {
    USERS: 'anhs_users',
    BOOKS: 'anhs_books',
    TRANSACTIONS: 'anhs_transactions',
    CURRENT_USER: 'anhs_current_user'
};

// ===== GLOBAL STATE =====
let currentUser = null;
let userRole = null;
let userData = null;
let html5QrCode = null;
let bookFilter = 'all';
let actionBookId = null;
let actionType = null;

// ===== UUID GENERATOR =====
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ===== DATABASE FUNCTIONS =====
function getDB(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function saveDB(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getCurrentUser() {
    const data = localStorage.getItem(DB_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
        localStorage.removeItem(DB_KEYS.CURRENT_USER);
    }
}

// ===== SCREEN MANAGEMENT =====
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function showLoading(show) {
    document.getElementById('loading').classList.toggle('active', show);
}

// ===== TOAST =====
function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${icons[type]}"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('hide'); setTimeout(() => toast.remove(), 300); }, 3500);
}

// ===== LOGIN TABS =====
function switchLoginTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.login-panel').forEach(p => p.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(`${tab}-login-panel`).classList.add('active');
}

function showStudentRegister() {
    document.getElementById('student-login-form').style.display = 'none';
    document.getElementById('student-register-form').style.display = 'block';
}

function showStudentLogin() {
    document.getElementById('student-register-form').style.display = 'none';
    document.getElementById('student-login-form').style.display = 'block';
}

// ===== STUDENT REGISTRATION =====
function studentRegister() {
    const lrn = document.getElementById('stu-reg-lrn').value.trim();
    const fullname = document.getElementById('stu-reg-fullname').value.trim();
    const username = document.getElementById('stu-reg-user').value.trim().toLowerCase();
    const pass = document.getElementById('stu-reg-pass').value;
    const pass2 = document.getElementById('stu-reg-pass2').value;
    const grade = document.getElementById('stu-reg-grade').value;
    const section = document.getElementById('stu-reg-section').value.trim().toUpperCase();

    if (!lrn || !fullname || !username || !pass || !grade || !section) {
        showToast('Please fill in all fields.', 'warning'); return;
    }
    if (lrn.length !== 12 || !/^\d+$/.test(lrn)) {
        showToast('LRN must be exactly 12 digits.', 'warning'); return;
    }
    if (pass.length < 6) {
        showToast('Password must be at least 6 characters.', 'warning'); return;
    }
    if (pass !== pass2) {
        showToast('Passwords do not match.', 'warning'); return;
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
        showToast('Username: letters, numbers, and underscores only.', 'warning'); return;
    }

    const users = getDB(DB_KEYS.USERS);
    if (users.find(u => u.username === username)) {
        showToast('Username already taken.', 'warning'); return;
    }
    if (users.find(u => u.lrn === lrn)) {
        showToast('This LRN is already registered.', 'warning'); return;
    }

    const newUser = {
        id: generateUUID(),
        username: username,
        password: pass,
        fullName: fullname,
        lrn: lrn,
        grade: grade,
        section: section,
        role: 'student',
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveDB(DB_KEYS.USERS, users);

    showToast('Account created successfully! Welcome, ' + fullname + '!', 'success');
    showStudentLogin();
    document.getElementById('stu-login-user').value = username;
}

// ===== STUDENT LOGIN =====
function studentLogin() {
    const username = document.getElementById('stu-login-user').value.trim().toLowerCase();
    const pass = document.getElementById('stu-login-pass').value;

    if (!username || !pass) {
        showToast('Please enter username and password.', 'warning'); return;
    }

    const users = getDB(DB_KEYS.USERS);
    const user = users.find(u => u.username === username && u.password === pass);

    if (!user) {
        showToast('Invalid username or password.', 'error'); return;
    }

    if (user.role !== 'student') {
        showToast('This is not a student account.', 'error'); return;
    }

    currentUser = user;
    userRole = 'student';
    userData = user;
    setCurrentUser(user);

    setupStudent();
    showScreen('student-screen');
    showToast('Welcome, ' + user.fullName + '!', 'success');
}

// ===== ADMIN LOGIN =====
function adminLogin() {
    const username = document.getElementById('admin-login-user').value.trim();
    const pass = document.getElementById('admin-login-pass').value;

    if (!username || !pass) {
        showToast('Please enter username and password.', 'warning'); return;
    }

    if (username !== 'staff' || pass !== 'anonangnationalhighschool') {
        showToast('Invalid staff credentials.', 'error'); return;
    }

    // Check if admin exists in DB, if not create it
    const users = getDB(DB_KEYS.USERS);
    let admin = users.find(u => u.username === 'staff');

    if (!admin) {
        admin = {
            id: generateUUID(),
            username: 'staff',
            password: 'anonangnationalhighschool',
            fullName: 'School Staff',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        users.push(admin);
        saveDB(DB_KEYS.USERS, users);
    }

    currentUser = admin;
    userRole = 'admin';
    userData = admin;
    setCurrentUser(admin);

    setupAdmin();
    showScreen('admin-screen');
    showToast('Welcome, Staff!', 'success');
}

// ===== LOGOUT =====
function logout() {
    currentUser = null;
    userRole = null;
    userData = null;
    setCurrentUser(null);
    showScreen('login-screen');
    showToast('Logged out successfully.', 'info');
    document.querySelectorAll('input[type="password"]').forEach(i => i.value = '');
}

// ===== CHECK SESSION ON LOAD =====
function checkSession() {
    const saved = getCurrentUser();
    if (saved) {
        const users = getDB(DB_KEYS.USERS);
        const user = users.find(u => u.id === saved.id);
        if (user) {
            currentUser = user;
            userRole = user.role;
            userData = user;
            if (userRole === 'admin') {
                setupAdmin();
                showScreen('admin-screen');
            } else {
                setupStudent();
                showScreen('student-screen');
            }
        }
    }
}

// ===== STUDENT DASHBOARD =====
function setupStudent() {
    const name = userData.fullName || userData.username;
    const grade = userData.grade || '';
    const section = userData.section || '';

    document.getElementById('stu-dash-name').textContent = name;
    document.getElementById('stu-dash-grade').textContent = grade + (section ? ' - ' + section : '');
    document.getElementById('welcome-stu-name').textContent = name.split(' ')[0];

    loadStudentHistory();
}

function loadStudentHistory() {
    const transactions = getDB(DB_KEYS.TRANSACTIONS);
    const myTrans = transactions.filter(t => t.studentId === currentUser.id).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const list = document.getElementById('student-history');

    if (myTrans.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><p>No records yet. Scan a QR code to get started!</p></div>`;
        return;
    }

    let html = '';
    myTrans.forEach((t) => {
        const time = new Date(t.timestamp).toLocaleString();
        const icon = t.type === 'borrow' ? 'fa-book' : 'fa-undo';
        const cls = t.type === 'borrow' ? 'borrow' : 'return';
        const label = t.type === 'borrow' ? 'Borrowed' : 'Returned';
        html += `
            <div class="transaction-item">
                <div class="transaction-icon ${cls}"><i class="fas ${icon}"></i></div>
                <div class="transaction-details">
                    <div class="transaction-book">${esc(t.bookTitle)}</div>
                    <div class="transaction-meta">${label}${t.notes ? ' · ' + esc(t.notes) : ''}</div>
                </div>
                <div class="transaction-time">${time}</div>
            </div>`;
    });
    list.innerHTML = html;
}

// ===== ADMIN DASHBOARD =====
function setupAdmin() {
    document.getElementById('admin-name').innerHTML = `<i class="fas fa-user-shield"></i> Staff`;
    refreshAdminStats();
    loadBooks();
    loadTransactions();
    loadStudents();
}

function refreshAdminStats() {
    const books = getDB(DB_KEYS.BOOKS);
    const transactions = getDB(DB_KEYS.TRANSACTIONS);
    const users = getDB(DB_KEYS.USERS);
    const students = users.filter(u => u.role === 'student');

    const borrowed = books.filter(b => b.status === 'borrowed').length;
    const available = books.filter(b => b.status === 'available').length;

    document.getElementById('stat-total').textContent = books.length;
    document.getElementById('stat-borrowed').textContent = borrowed;
    document.getElementById('stat-available').textContent = available;
    document.getElementById('stat-trans').textContent = transactions.length;
    document.getElementById('stat-students').textContent = students.length;
}

// ===== BOOKS =====
function loadBooks() {
    const books = getDB(DB_KEYS.BOOKS).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const list = document.getElementById('books-list');

    const filtered = bookFilter === 'all' ? books : books.filter(b => b.status === bookFilter);

    if (filtered.length === 0) {
        const msg = bookFilter === 'all' ? 'No books added yet. Add your first book above!' : 'No books match the current filter.';
        list.innerHTML = `<div class="empty-state"><i class="fas fa-${bookFilter === 'all' ? 'books' : 'filter'}"></i><p>${msg}</p></div>`;
        return;
    }

    let html = '';
    filtered.forEach((b) => {
        const stClass = b.status === 'borrowed' ? 'borrowed' : 'available';
        const stLabel = b.status === 'borrowed' ? 'Borrowed' : 'Available';
        const stBadge = b.status === 'borrowed' ? 'status-borrowed' : 'status-available';

        let borrowedHtml = '';
        if (b.status === 'borrowed' && b.borrowedByName) {
            const time = b.borrowedAt ? new Date(b.borrowedAt).toLocaleString() : '';
            borrowedHtml = `<div class="borrowed-info"><i class="fas fa-user-clock"></i> Borrowed by ${esc(b.borrowedByName)}${time ? ' · ' + time : ''}</div>`;
        }

        html += `
            <div class="book-card ${stClass}">
                <div class="book-header">
                    <div>
                        <div class="book-title">${esc(b.title)}</div>
                        <div class="book-author">by ${esc(b.author)}</div>
                    </div>
                    <span class="book-status ${stBadge}">${stLabel}</span>
                </div>
                <div class="book-actions">
                    <button class="btn-small btn-view" onclick="showQRCode('${b.id}', '${esc(b.title)}')">
                        <i class="fas fa-qrcode"></i> QR Code
                    </button>
                    <button class="btn-small btn-delete" onclick="deleteBook('${b.id}', '${esc(b.title)}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
                ${borrowedHtml}
            </div>`;
    });
    list.innerHTML = html;
}

function filterBooks(filter) {
    bookFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    loadBooks();
}

function addBook() {
    const title = document.getElementById('book-title').value.trim();
    const author = document.getElementById('book-author').value.trim();

    if (!title || !author) {
        showToast('Please enter both title and author.', 'warning'); return;
    }

    const books = getDB(DB_KEYS.BOOKS);
    const newBook = {
        id: generateUUID(),
        title: title,
        author: author,
        status: 'available',
        borrowedBy: null,
        borrowedByName: null,
        borrowedAt: null,
        createdAt: new Date().toISOString()
    };

    books.push(newBook);
    saveDB(DB_KEYS.BOOKS, books);

    showToast(`"${title}" added successfully!`, 'success');
    document.getElementById('book-title').value = '';
    document.getElementById('book-author').value = '';

    refreshAdminStats();
    loadBooks();
    setTimeout(() => showQRCode(newBook.id, title), 400);
}

function deleteBook(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    let books = getDB(DB_KEYS.BOOKS);
    books = books.filter(b => b.id !== id);
    saveDB(DB_KEYS.BOOKS, books);

    showToast(`"${title}" deleted successfully.`, 'success');
    refreshAdminStats();
    loadBooks();
}

// ===== QR CODE =====
function showQRCode(bookId, title) {
    const modal = document.getElementById('qr-modal');
    const display = document.getElementById('qr-display');
    document.getElementById('qr-book-title').textContent = title;
    display.innerHTML = '';
    new QRCode(display, { text: bookId, width: 200, height: 200, colorDark: '#1a3a5c', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H });
    modal.classList.add('active');
}

function closeQRModal() { document.getElementById('qr-modal').classList.remove('active'); }

function downloadQR() {
    const canvas = document.querySelector('#qr-display canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.download = 'anonang-nhs-book-qr.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('QR code downloaded!', 'success');
    }
}

// ===== QR SCANNER =====
function openScanner() {
    const modal = document.getElementById('scanner-modal');
    modal.classList.add('active');
    const reader = document.getElementById('reader');
    reader.innerHTML = '';
    html5QrCode = new Html5Qrcode('reader');
    html5QrCode.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, onScanFailure)
        .catch((err) => { showToast('Camera error: ' + err.message, 'error'); closeScanner(); });
}

function closeScanner() {
    document.getElementById('scanner-modal').classList.remove('active');
    if (html5QrCode) {
        html5QrCode.stop().then(() => { html5QrCode.clear(); html5QrCode = null; }).catch(() => {});
    }
}

function onScanSuccess(text) {
    closeScanner();
    const books = getDB(DB_KEYS.BOOKS);
    const book = books.find(b => b.id === text);

    if (!book) {
        showToast('Invalid QR code. Book not found.', 'error'); return;
    }
    showBookAction(book.id, book);
}

function onScanFailure(err) { /* ignore */ }

// ===== BOOK ACTION (Borrow/Return) =====
function showBookAction(bookId, book) {
    actionBookId = bookId;
    const modal = document.getElementById('book-action-modal');
    const info = document.getElementById('action-book-info');
    const btn = document.getElementById('action-btn');

    const isBorrowed = book.status === 'borrowed';
    const isMine = book.borrowedBy === currentUser.id;

    let statusHtml = '';
    if (isBorrowed) {
        if (isMine) statusHtml = `<span class="book-status-large status-borrowed">Borrowed by You</span>`;
        else statusHtml = `<span class="book-status-large status-borrowed">Borrowed by ${esc(book.borrowedByName || 'Someone')}</span>`;
    } else {
        statusHtml = `<span class="book-status-large status-available">Available</span>`;
    }

    info.innerHTML = `
        <div class="book-title-large">${esc(book.title)}</div>
        <div class="book-author-large">by ${esc(book.author)}</div>
        <div style="margin-top:12px;">${statusHtml}</div>
    `;

    if (isBorrowed) {
        if (isMine) {
            actionType = 'return';
            btn.innerHTML = '<i class="fas fa-undo"></i> Return Book';
            btn.style.background = 'var(--success)';
            btn.onclick = () => doAction('return');
        } else {
            actionType = 'unavailable';
            btn.innerHTML = '<i class="fas fa-lock"></i> Currently Borrowed';
            btn.style.background = 'var(--gray)';
            btn.style.cursor = 'not-allowed';
            btn.onclick = null;
        }
    } else {
        actionType = 'borrow';
        btn.innerHTML = '<i class="fas fa-book"></i> Borrow Book';
        btn.style.background = 'var(--school-blue)';
        btn.style.cursor = 'pointer';
        btn.onclick = () => doAction('borrow');
    }

    modal.classList.add('active');
}

function closeBookAction() {
    document.getElementById('book-action-modal').classList.remove('active');
    actionBookId = null; actionType = null;
    document.getElementById('action-notes').value = '';
}

function doAction(type) {
    if (!actionBookId || !currentUser) return;
    const notes = document.getElementById('action-notes').value.trim();

    const books = getDB(DB_KEYS.BOOKS);
    const bookIndex = books.findIndex(b => b.id === actionBookId);
    if (bookIndex === -1) { showToast('Book not found.', 'error'); return; }

    const book = books[bookIndex];

    if (type === 'borrow') {
        book.status = 'borrowed';
        book.borrowedBy = currentUser.id;
        book.borrowedByName = currentUser.fullName || currentUser.username;
        book.borrowedAt = new Date().toISOString();
    } else {
        book.status = 'available';
        book.borrowedBy = null;
        book.borrowedByName = null;
        book.borrowedAt = null;
    }

    books[bookIndex] = book;
    saveDB(DB_KEYS.BOOKS, books);

    // Create transaction
    const transactions = getDB(DB_KEYS.TRANSACTIONS);
    transactions.push({
        id: generateUUID(),
        bookId: actionBookId,
        bookTitle: book.title,
        studentId: currentUser.id,
        studentName: currentUser.fullName || currentUser.username,
        studentGrade: currentUser.grade || '',
        studentSection: currentUser.section || '',
        type: type,
        notes: notes || null,
        timestamp: new Date().toISOString()
    });
    saveDB(DB_KEYS.TRANSACTIONS, transactions);

    closeBookAction();
    const msg = type === 'borrow' ? 'Book borrowed successfully!' : 'Book returned successfully!';
    showToast(msg, 'success');

    if (userRole === 'admin') {
        refreshAdminStats();
        loadBooks();
        loadTransactions();
    } else {
        loadStudentHistory();
    }
}

// ===== TRANSACTIONS =====
function loadTransactions() {
    const transactions = getDB(DB_KEYS.TRANSACTIONS).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const list = document.getElementById('transactions-list');

    if (transactions.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><p>No transactions recorded yet.</p></div>`;
        return;
    }

    let html = '';
    transactions.forEach((t) => {
        const time = new Date(t.timestamp).toLocaleString();
        const icon = t.type === 'borrow' ? 'fa-book' : 'fa-undo';
        const cls = t.type === 'borrow' ? 'borrow' : 'return';
        const label = t.type === 'borrow' ? 'Borrowed' : 'Returned';
        const stuInfo = t.studentGrade && t.studentSection ? `(${t.studentGrade} - ${t.studentSection})` : '';
        html += `
            <div class="transaction-item">
                <div class="transaction-icon ${cls}"><i class="fas ${icon}"></i></div>
                <div class="transaction-details">
                    <div class="transaction-book">${esc(t.bookTitle)}</div>
                    <div class="transaction-meta">${label} by ${esc(t.studentName)} <span class="stu-tag">${esc(stuInfo)}</span>${t.notes ? ' · ' + esc(t.notes) : ''}</div>
                </div>
                <div class="transaction-time">${time}</div>
            </div>`;
    });
    list.innerHTML = html;
}

// ===== STUDENTS LIST (Admin) =====
function loadStudents() {
    const users = getDB(DB_KEYS.USERS);
    const students = users.filter(u => u.role === 'student').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const list = document.getElementById('students-list');

    if (students.length === 0) {
        list.innerHTML = `<div class="empty-state"><i class="fas fa-users"></i><p>No registered students yet.</p></div>`;
        return;
    }

    let html = `
        <table class="students-table">
            <thead>
                <tr>
                    <th>LRN</th>
                    <th>Name</th>
                    <th>Grade & Section</th>
                    <th>Username</th>
                </tr>
            </thead>
            <tbody>`;
    students.forEach((s) => {
        html += `
            <tr>
                <td>${esc(s.lrn || '-')}</td>
                <td><span class="stu-name">${esc(s.fullName || s.username)}</span></td>
                <td><span class="stu-grade">${esc(s.grade || '-')} ${esc(s.section || '')}</span></td>
                <td>${esc(s.username)}</td>
            </tr>`;
    });
    html += `</tbody></table>`;
    list.innerHTML = html;
}

// ===== DATABASE BACKUP / EXPORT / IMPORT =====
function exportDatabase() {
    const data = {
        exportedAt: new Date().toISOString(),
        users: getDB(DB_KEYS.USERS),
        books: getDB(DB_KEYS.BOOKS),
        transactions: getDB(DB_KEYS.TRANSACTIONS)
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'anonang-nhs-logbook-backup-' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Database exported successfully!', 'success');
}

function importDatabase(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.users || !data.books || !data.transactions) {
                showToast('Invalid backup file.', 'error'); return;
            }
            if (!confirm('This will replace all current data. Continue?')) return;

            saveDB(DB_KEYS.USERS, data.users);
            saveDB(DB_KEYS.BOOKS, data.books);
            saveDB(DB_KEYS.TRANSACTIONS, data.transactions);

            showToast('Database imported successfully!', 'success');
            refreshAdminStats();
            loadBooks();
            loadTransactions();
            loadStudents();
        } catch (err) {
            showToast('Error reading file: ' + err.message, 'error');
        }
    };
    reader.readAsText(file);
    input.value = '';
}

// ===== UTILITIES =====
function esc(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeScanner(); closeBookAction(); closeQRModal(); }
});

// ===== INIT =====
checkSession();
console.log('Anonang NHS Digital Logbook loaded. All data saved in browser localStorage.');
