// app.js

const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const http = require('http');
const route = require('./routes/route');
const socket = require('./routes/socket/socket');
const { conn } = require('./middleware/db'); // MySQL connection

dotenv.config({ path: './config.env' });

const app = express();
const server = http.createServer(app);
const io = socket.init(server); // socket.io instance

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());

app.use(session({
  secret: process.env.SESSION_SECRET || 'nodedemo',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 } // 1 hour
}));

/* ========== COMPREHENSIVE ANTI-CACHE FOR ALL RESPONSES ========== */
app.disable('etag'); // prevent 304 reuse across users/tabs

// Global anti-cache middleware for ALL routes
app.use((req, res, next) => {
  // Aggressive cache prevention
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '-1');
  res.set('Surrogate-Control', 'no-store');
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  
  // Ensure caches treat Cookie/Authorization as part of identity
  res.set('Vary', 'Cookie, Authorization, X-Requested-With');
  
  // Add timestamp to prevent caching
  res.set('Last-Modified', new Date().toUTCString());
  
  next();
});
/* ================================================================================ */

// View engine & layouts
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Static files with anti-cache
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    // Prevent caching of static files
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '-1');
    
    // Add version query parameter to force reload
    if (path.endsWith('.js') || path.endsWith('.css')) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }
  }
}));

// Flash messages as locals
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.errors = req.flash('errors');
  next();
});

// roles and required data as locals
app.use((req, res, next) => {
  let token;
  
  // Try to get token from cookie
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // Or try to get token from Authorization header (Bearer <token>)
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } 

  if (token) {
    try {
      const decoded = jwt.decode(token); // Decode without verifying
      // Assign decoded values to EJS access variables
      res.locals.assignedRoles = decoded.rolesArray || [];
      res.locals.userId = decoded.id;
      res.locals.username = decoded.username;
      res.locals.userFullName = `${decoded.name || ''} ${decoded.last_name || ''}`;
      res.locals.name = decoded.name;
      res.locals.Rolename = decoded.roleName;
      res.locals.userLogoPath = decoded.logo_path;
      res.locals.companyName = decoded.company_name;

    } catch (err) {
      console.error("Failed to decode JWT:", err);
    }
  }

  next();
});

/* ========== ADDED: Bind/rotate session by JWT userId to avoid cross-user leaks ========== */
app.use((req, res, next) => {
  const currentUserId = res.locals.userId; // from JWT decode above

  // If authenticated now but session not yet bound, bind it
  if (currentUserId && !req.session.userId) {
    req.session.userId = currentUserId;
    return next();
  }

  // If session bound to a different user, rotate (new SID) and rebind
  if (currentUserId && req.session.userId && req.session.userId !== currentUserId) {
    return req.session.regenerate(err => {
      if (err) return next(err);
      req.session.userId = currentUserId;

      // Extra safety: ensure no caching on this response
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '-1');
      res.set('Last-Modified', new Date().toUTCString());
      next();
    });
  }

  // If no current token but a stale session exists, clear it to prevent bleed-over
  if (!currentUserId && req.session.userId) {
    return req.session.regenerate(err => {
      if (err) return next(err);
      next();
    });
  }

  next();
});
/* ================================================================================ */

// Script injection from DB
app.use((req, res, next) => {
  conn.query("SELECT data FROM tbl_validate", (err, results) => {
    if (err) {
      console.error('Error fetching script data:', err);
      return next(err);
    }
    res.locals.scriptFile = results?.[0]?.data || '';
    next();
  });
});

// Trust proxy (if using reverse proxy)
app.set('trust proxy', 1);

// Routes
app.use('/', route);

// 404 Handler with anti-cache
app.use((req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '-1');
  res.status(404).send('Page Not Found');
});

// Global Error Handler with anti-cache
app.use((err, req, res, next) => {
  // Set anti-cache headers for all error responses
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '-1');
  
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).redirect('/view/login');
  }

  console.error("App Error:", err);
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'Something went wrong',
  });
});

// Server Start
const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`🚀 Server listening at http://localhost:${PORT}`);
});
