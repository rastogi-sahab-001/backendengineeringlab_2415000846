const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session setup
app.use(session({
    secret: 'mySecretKey',
    resave: false,
    saveUninitialized: false
}));

// ------------------ ROUTES ------------------ //

// Home Route
app.get('/', (req, res) => {
    if (!req.session.user && req.cookies.user) {
        return res.send(`Welcome back!! Last time you logged in as ${req.cookies.user}`);
    }
    res.send("Welcome to Online Course Platform");
});

// Login Route
app.post('/login', (req, res) => {
    const { username, role } = req.body;

    if (!username || !role) {
        return res.send("Please provide username and role");
    }

    // Store in session
    req.session.user = {
        username,
        role
    };

    // Set cookie
    res.cookie('user', username, { maxAge: 24 * 60 * 60 * 1000 });

    res.send(`Logged in as ${username} (${role})`);
});

// Courses Route (Protected)
app.get('/courses', (req, res) => {
    if (!req.session.user) {
        return res.send("Please login first");
    }

    res.send("You can view courses");
});

// Create Course (Instructor Only)
app.get('/create-course', (req, res) => {
    if (!req.session.user) {
        return res.send("Please login first");
    }

    if (req.session.user.role !== 'instructor') {
        return res.send("Access Denied: Only instructors allowed");
    }

    res.send("Course creation page");
});

// Profile Route
app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.send("Please login first");
    }

    const { username, role } = req.session.user;
    res.send(`Username: ${username}, Role: ${role}`);
});

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send("Error logging out");
        }

        res.clearCookie('connect.sid'); // session cookie
        res.send("Logged out successfully");
    });
});

// ------------------ SERVER ------------------ //

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});