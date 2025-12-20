const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware'); // Import Middleware

// Configuration
const REQUIRED_SCOPES = ['openid', 'profile', 'w_member_social', 'email'];

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Redirect to LinkedIn OAuth
router.get('/auth', (req, res) => {
    const authorizationUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.LINKEDIN_REDIRECT_URI)}&scope=${encodeURIComponent(REQUIRED_SCOPES.join(' '))}`;
    res.redirect(authorizationUrl);
});

// 1.5 Check Connection Status
router.get('/status', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId; // Provided by authMiddleware
        const user = await prisma.user.findUnique({ where: { id: userId } });
        
        if (user && user.linkedinAccessToken) {
             return res.json({ connected: true });
        }
        return res.json({ connected: false });
    } catch (e) {
        return res.json({ connected: false, error: e.message });
    }
});

// 6. Generate AI Post (Protected?) - Let's keep it open or protect it. The frontend sends token.
router.post('/generate', authMiddleware, async (req, res) => {
    try {
        const { topic } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Write a professional LinkedIn post about: "${topic || 'General professional update'}". 
        The tone should be engaging, professional, and suitable for a software developer or student.
        Include emojis and hashtags.
        Return ONLY valid JSON format: { "content": "The post text here" }`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);
        
        res.json({ success: true, content: data.content });
    } catch (error) {
        console.error("AI Generate Error:", error);
        res.status(500).json({ error: "Failed to generate post" });
    }
});

// 2. Callback (Public)
router.get('/callback', (req, res) => {
    const { code, error } = req.query;

    if (error) {
        return res.redirect(`http://localhost:3000/linkedin/callback?error=${error}`);
    }

    if (!code) {
        return res.redirect(`http://localhost:3000/linkedin/callback?error=no_code`);
    }

    res.redirect(`http://localhost:3000/linkedin/callback?code=${code}`);
});

// 3. Connect (Authorized endpoint)
router.post('/connect', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId; // From Middleware
        const { code } = req.body;

        console.log(`[DEBUG] Exchanging code for token. User: ${userId}`);

        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', process.env.LINKEDIN_REDIRECT_URI);
        params.append('client_id', process.env.LINKEDIN_CLIENT_ID);
        params.append('client_secret', process.env.LINKEDIN_CLIENT_SECRET);

        const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, expires_in, refresh_token } = tokenResponse.data;
        const expiryDate = Date.now() + (expires_in * 1000);

        await prisma.user.update({
            where: { id: userId },
            data: {
                linkedinAccessToken: access_token,
                linkedinRefreshToken: refresh_token,
                linkedinTokenExpiry: BigInt(expiryDate)
            }
        });

        res.json({ success: true, message: 'LinkedIn connected successfully' });

    } catch (err) {
        console.error('Connect Error:', err.response?.data || err.message);
        const detailedError = err.response?.data?.error_description || err.message;
        res.status(500).json({ error: `LinkedIn Error: ${detailedError}` });
    }
});

// Configure Multer
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// 4. Publish Post
router.post('/publish', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const userId = req.user.userId;
        const { content } = req.body;
        const imageFile = req.file; 


        if (!content && !imageFile) return res.status(400).json({ error: 'Content or image is required' });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.linkedinAccessToken) {
            return res.status(403).json({ error: 'LinkedIn not connected' });
        }

        // 1. Get User URN
        const profileRes = await axios.get('https://api.linkedin.com/v2/userinfo', {
            headers: { 'Authorization': `Bearer ${user.linkedinAccessToken}` }
        });
        const personUrn = `urn:li:person:${profileRes.data.sub}`;

        let assetUrn = null;

        // 2. Handle Image Upload (If exists)
        if (imageFile) {
            // A. Register Upload
            const registerBody = {
                "registerUploadRequest": {
                    "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                    "owner": personUrn,
                    "serviceRelationships": [{
                        "relationshipType": "OWNER",
                        "identifier": "urn:li:userGeneratedContent"
                    }]
                }
            };
            
            const registerRes = await axios.post('https://api.linkedin.com/v2/assets?action=registerUpload', registerBody, {
                headers: { 'Authorization': `Bearer ${user.linkedinAccessToken}` }
            });

            const uploadUrl = registerRes.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
            assetUrn = registerRes.data.value.asset;

            // B. Upload Binary
            await axios.put(uploadUrl, imageFile.buffer, {
                headers: { 
                    'Authorization': `Bearer ${user.linkedinAccessToken}`,
                    'Content-Type': imageFile.mimetype || 'application/octet-stream'
                }
            });
        }

        // 3. Create Share Content
        const shareContent = {};
        if (assetUrn) {
            shareContent["com.linkedin.ugc.ShareContent"] = {
                shareCommentary: { text: content || "" },
                shareMediaCategory: "IMAGE",
                media: [{
                    status: "READY",
                    description: { text: "Image from SyllabusAI user" },
                    media: assetUrn,
                    title: { text: "Shared Image" }
                }]
            };
        } else {
            shareContent["com.linkedin.ugc.ShareContent"] = {
                shareCommentary: { text: content },
                shareMediaCategory: "NONE"
            };
        }

        const postBody = {
            author: personUrn,
            lifecycleState: "PUBLISHED",
            specificContent: shareContent,
            visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
        };

        const postRes = await axios.post('https://api.linkedin.com/v2/ugcPosts', postBody, {
            headers: { 'Authorization': `Bearer ${user.linkedinAccessToken}` }
        });

        const linkedinPostId = postRes.data.id;

        // Save to DB
        await prisma.linkedinPost.create({
            data: {
                userId,
                content: content || "[Image Post]",
                linkedinPostId
            }
        });

        res.json({ success: true, postId: linkedinPostId });

    } catch (err) {
        console.error('Publish Error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to publish', details: err.response?.data });
    }
});

// 5. Get History
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const posts = await prisma.linkedinPost.findMany({
            where: { userId },
            orderBy: { publishedAt: 'desc' }
        });
        res.json({ success: true, posts });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

module.exports = router;
