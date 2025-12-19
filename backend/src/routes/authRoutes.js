const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const jwt = require('jsonwebtoken');

// --- Passport Config ---
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => done(null, id));

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/api/auth/callback/github"
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;

                // Upsert user
                let user = await prisma.user.findUnique({ where: { email } });

                if (!user) {
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: profile.displayName || profile.username,
                            image: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                            password: 'github-oauth-user', // Placeholder
                            role: 'STUDENT',
                            accounts: {
                                create: {
                                    provider: 'github',
                                    providerAccountId: profile.id,
                                    accessToken
                                }
                            }
                        }
                    });
                } else {
                    // Update token if needed
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));
} else {
    console.warn("GitHub OAuth skipped: Missing GITHUB_CLIENT_ID/SECRET");
}

// --- Routes ---

// 1. Trigger GitHub Login
router.get('/github', (req, res, next) => {
    if (!process.env.GITHUB_CLIENT_ID) {
        return res.status(503).json({ error: "GitHub Login disabled (missing config)" });
    }
    passport.authenticate('github', { scope: ['user:email', 'repo'] })(req, res, next);
});

// 2. Callback
router.get('/callback/github',
    (req, res, next) => {
         if (!process.env.GITHUB_CLIENT_ID) return res.redirect('/login?error=github_disabled');
         next();
    },
    passport.authenticate('github', { failureRedirect: '/login?error=github_failed', session: false }),
    (req, res) => {
        // Successful authentication
        const token = jwt.sign(
            { userId: req.user.id, email: req.user.email },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '7d' }
        );

        // Redirect to Frontend with Token
        res.redirect(`http://localhost:3000/auth/success?token=${token}`);
    }
);
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Direct password comparison for demo (INSECURE for prod, but requested "verifying")
        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const profilePhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                profilePhoto
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;

    try {
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: { email, password, name }
            });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'supersecretkey',
            { expiresIn: '7d' }
        );

        const profilePhoto = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
        res.json({
            success: true,
            token,
            user: {
                ...user,
                profilePhoto
            }
        });
    } catch (error) {
        if (error.code === 'P2002') { // Unique constraint
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

module.exports = router;
