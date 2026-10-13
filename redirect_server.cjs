const http = require('http');

const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Redirecting to CashPredix...</title>
  <style>
    body {
      margin: 0;
      background: #030712;
      color: #f3f4f6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(59, 130, 246, 0.2);
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
  <script>
    var hash = window.location.hash || '';
    var base = 'https://mervegazi.github.io/CashPredix';
    
    // If this is a password recovery link, send directly to Enter New Password page
    if (hash.indexOf('type=recovery') !== -1 || window.location.pathname.indexOf('change-password') !== -1 || window.location.pathname.indexOf('reset-password') !== -1) {
      document.title = 'Redirecting to Enter New Password...';
      window.location.replace(base + '/change-password' + hash);
    } else {
      // Otherwise, send to Dashboard
      window.location.replace(base + '/dashboard' + hash);
    }
  </script>
</head>
<body>
  <div class="spinner"></div>
  <p id="msg">Processing authentication... Redirecting to CashPredix...</p>
</body>
</html>`);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('CashPredix Auth Redirect Server running on http://127.0.0.1:' + PORT);
});
