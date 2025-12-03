# How to Use the Admin Panel

The admin panel requires a local web server to work properly. Here are the easiest ways to run one:

## Option 1: Using Python (Easiest)

If you have Python installed:

```bash
# Navigate to your Mediterra folder
cd /path/to/Mediterra

# For Python 3
python3 -m http.server 8000

# For Python 2
python -m SimpleHTTPServer 8000
```

Then open: **http://localhost:8000**

## Option 2: Using Node.js

If you have Node.js installed:

```bash
# Install http-server globally (one time only)
npm install -g http-server

# Navigate to your Mediterra folder
cd /path/to/Mediterra

# Start server
http-server

```

Then open: **http://localhost:8080**

## Option 3: Using VS Code

If you use VS Code:

1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## How to Use the Admin Panel

1. Start your local web server (using one of the options above)
2. Open `http://localhost:8000/admin.html` in your browser
3. Make your changes
4. Click "Save Changes"
5. Open `http://localhost:8000/index.html` to see your changes
6. Your changes will persist across refreshes!

## Why is this needed?

The admin panel uses `localStorage` which browsers restrict when opening files directly (file:// protocol). A local web server solves this security restriction.
