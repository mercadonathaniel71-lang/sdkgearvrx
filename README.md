# Galaxy Logbook - QR Library System

A beautiful galaxy-themed digital logbook for managing library books with QR codes. All data is stored in the browser's localStorage — no Firebase, no API keys, no backend server needed.

## Features

- **Student Registration**: Create account with LRN, full name, username, password, grade & section
- **Student Login**: Username + password authentication
- **Staff Portal**: Complete management dashboard with:
  - Dashboard statistics (total books, borrowed, available, transactions, students)
  - Add new books with auto-generated QR codes
  - View all books with filter (All / Available / Borrowed)
  - **Currently Borrowed Books** section
  - **Recently Returned Books** section
  - Registered students list
  - Complete transaction logbook
  - Export/Import database as JSON
- **QR Code Scanner**: Camera scanner with **front/back camera selection** — works on phones and laptops
- **QR Code Generation**: Auto-generated when adding books (title + author only)
- **Borrow/Return System**: Students scan QR to borrow or return books
- **Galaxy Theme**: Dark purple/blue gradient design with star effects
- **Responsive**: Works on mobile phones, tablets, and computers

## Demo Accounts

### Staff (Admin)
- **Username**: `staff`
- **Password**: `anonangnationalhighschool`

### Student
- Students create their own accounts via the "Create Account" button

## File Structure

```
galaxy-logbook/
├── index.html      # Main application
├── style.css       # Galaxy theme styles
├── app.js          # Application logic (localStorage)
└── README.md       # This file
```

## Setup

1. Upload all 3 files (`index.html`, `style.css`, `app.js`) to GitHub
2. Enable GitHub Pages in Settings
3. Done! No Firebase or database setup needed

## How to Use

### Staff:
1. Login with username `staff` and password `anonangnationalhighschool`
2. Add books — QR codes auto-generate
3. Download and print QR codes, paste on books
4. Monitor borrowed books, returned books, students, and transactions
5. **Export database regularly** as JSON backup

### Students:
1. Create account with LRN, name, username, password, grade, section
2. Login and click "Scan QR Code"
3. Select front or back camera
4. Scan book QR code
5. Click "Borrow Book" or "Return Book"

## Backup Your Data

Since data is stored in the browser:
1. Go to Staff Portal → Database Backup
2. Click "Export JSON" to save a backup file
3. If data is lost, click "Import JSON" and select your backup

## Custom Domain

1. Buy a domain (e.g., from Namecheap)
2. In GitHub repo: Settings → Pages → Custom domain
3. Add DNS A records pointing to GitHub Pages IPs
4. Done!

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript
- Browser localStorage (database)
- QRCode.js (CDN)
- html5-qrcode (CDN)
- Font Awesome 6 (CDN)

## License

Free for educational use.
