const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Fallback memory database if MongoDB is not yet configured in Azure Key Vault
let memoryReviews = [];

// Try to connect to database if environment variable exists
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to Database'))
        .catch(err => console.error('Database connection error:', err));
}

// --- Fake Review & Spam Detection Logic ---
function analyzeReview(text) {
    const spamKeywords = ['buy followers', 'click here', 'free money', 'scam', 'crypto', 'guaranteed'];
    const textLower = text.toLowerCase();
    
    let spamScore = 0;
    spamKeywords.forEach(keyword => {
        if (textLower.includes(keyword)) spamScore += 35;
    });
    
    // Check for excessive capitalization (shouting)
    const upperCaseCount = (text.match(/[A-Z]/g) || []).length;
    if (text.length > 0 && (upperCaseCount / text.length) > 0.4) spamScore += 25;

    // Cap at 100%
    spamScore = Math.min(spamScore, 100);
    
    return {
        score: spamScore,
        isSpam: spamScore > 50,
        status: spamScore > 50 ? 'Flagged as Spam' : 'Verified Authentic'
    };
}

// --- API Routes ---
app.post('/api/reviews', (req, res) => {
    const { productName, reviewText } = req.body;
    
    if (!productName || !reviewText) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    const analysis = analyzeReview(reviewText);
    const newReview = {
        id: Date.now(),
        productName,
        reviewText,
        ...analysis,
        timestamp: new Date().toISOString()
    };

    memoryReviews.unshift(newReview); // Add to top of list
    res.status(201).json(newReview);
});

app.get('/api/reviews', (req, res) => {
    res.json(memoryReviews.slice(0, 50)); // Return last 50 reviews
});

app.listen(PORT, () => {
    console.log(`Spam Detection Engine running on port ${PORT}`);
});
