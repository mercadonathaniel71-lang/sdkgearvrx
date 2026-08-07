# Anonang National High School - Digital Logbook

A complete QR-based library management system that runs entirely in the browser. **No Firebase needed. No API keys. No backend server.** All data is saved in the browser's localStorage and can be exported/imported as JSON.

## Features

- **Student Registration**: Create account with LRN, full name, username, password, grade & section
- **Student Login**: Username + password authentication
- **Staff Login**: Secure admin panel
- **QR Code Generation**: Auto-generated unique QR codes for each book
- **QR Scanner**: Built-in camera scanner for borrow/return
- **Borrow/Return System**: Track who borrowed what and when
- **Transaction Logbook**: Complete history of all borrow/return transactions
- **Student Records**: View all registered students with LRN, grade, and section
- **Database Backup**: Export all data as JSON file, import from JSON file
- **Real-time Updates**: Instant updates across all views
- **Responsive Design**: Works on phones, tablets, and computers

## Demo Accounts

### Staff (Admin)
- **Username**: `staff`
- **Password**: `anonangnationalhighschool`

### Student
- Students create their own accounts via the "Create Account" button

## How It Works

All data is stored in your browser's **localStorage** — no internet connection required after the first load! This means:

- No Firebase account needed
- No API keys to configure
- No database setup
- Works offline
- Data persists between sessions

**Important**: Since data is stored in the browser, make sure to **export your database regularly** as a JSON backup file. If browser data is cleared, all records will be lost unless you have a backup.

## File Structure

```
anonang-logbook/
├── index.html      # Main application
├── style.css       # School theme styles (blue & gold)
├── app.js          # Application logic (localStorage-based)
└── README.md       # This file
```

## Setup Instructions

### 1. Upload to GitHub Pages

1. Create a new repository on GitHub
2. Upload all 3 files (`index.html`, `style.css`, `app.js`) to the repository
3. Go to **Settings** → **Pages**
4. Source: **Deploy from a branch**
5. Branch: **main** / **(root)**
6. Click **Save**
7. Wait 1-2 minutes, then visit your site URL

**That's it!** No Firebase, no database setup, no configuration needed.

### 2. Custom Domain (Optional)

If you want a custom domain like `anonangnhs-lib.com`:

1. Buy a domain from Namecheap, GoDaddy, etc.
2. In your domain's DNS settings, add these A records:
   ```
   Type: A     Host: @     Value: 185.199.108.153
   Type: A     Host: @     Value: 185.199.109.153
   Type: A     Host: @     Value: 185.199.110.153
   Type: A     Host: @     Value: 185.199.111.153
   ```
3. In GitHub repo: **Settings** → **Pages** → Custom domain
4. Type your domain and click **Save**
5. Check **Enforce HTTPS**

## How to Use

### For Students:
1. Open the website on your phone or computer
2. Click **"Create Account"**
3. Fill in: LRN, Full Name, Username, Password, Grade, Section
4. Login with your username and password
5. Click **"Scan QR Code"** to open the camera
6. Point camera at the book's QR code
7. Click **"Borrow Book"** or **"Return Book"**
8. View your borrowing history anytime

### For Staff:
1. Login with:
   - Username: `staff`
   - Password: `anonangnationalhighschool`
2. View dashboard statistics
3. Add new books — the system auto-generates a QR code
4. Download and print QR codes to paste on physical books
5. View all registered students
6. View the complete transaction logbook
7. **Export database** regularly as JSON backup

### QR Code Workflow:
1. Staff adds a book → System generates a unique QR code
2. Staff downloads/prints the QR code → Pastes it on the physical book
3. Student scans the QR code → System identifies the book
4. Student borrows/returns → System updates status and logs the transaction

## Database Backup

### Export (Save your data):
1. Login as Staff
2. Scroll to the **"Database Backup"** section
3. Click **"Export Database (JSON)"**
4. A `.json` file will download — keep this safe!

### Import (Restore your data):
1. Login as Staff
2. Scroll to the **"Database Backup"** section
3. Click **"Import Database (JSON)"**
4. Select your backup `.json` file
5. All data will be restored

**Tip**: Export your database at least once a week or after adding many books!

## Troubleshooting

**Camera not working?**
- Must use HTTPS (GitHub Pages provides this)
- Allow camera permissions when prompted
- Use Chrome or Safari
- On iPhone, use Safari

**Data disappeared?**
- Browser data may have been cleared
- Import your latest JSON backup to restore everything

**Can't create an account?**
- Username must be unique
- LRN must be exactly 12 digits
- Password must be at least 6 characters

**Forgot staff password?**
- The default is: `anonangnationalhighschool`
- To change it, you need to edit the code or clear browser data and re-login

## Customization

### Change School Name:
Edit `index.html` and search for "Anonang National High School" — replace with your school name.

### Change Colors:
Edit `style.css` and modify:
```css
:root {
    --school-blue: #1a3a5c;      /* Main color */
    --school-gold: #c9a227;      /* Accent color */
}
```

### Change Staff Password:
Edit `app.js`, search for `anonangnationalhighschool` and replace with your desired password.

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: Browser localStorage (JSON-based)
- **QR Generation**: QRCode.js (CDN)
- **QR Scanning**: html5-qrcode (CDN)
- **Icons**: Font Awesome 6 (CDN)
- **Hosting**: GitHub Pages (free)

## License

Free to use for educational purposes.

---
**Anonang National High School**
Digital Library Logbook System
