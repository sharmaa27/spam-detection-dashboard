document.getElementById('reviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productName = document.getElementById('productName').value;
    const reviewText = document.getElementById('reviewText').value;
    const button = e.target.querySelector('button');
    
    button.textContent = 'Analyzing...';
    
    try {
        await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productName, reviewText })
        });
        
        document.getElementById('reviewForm').reset();
        fetchReviews(); // Refresh the feed
    } catch (error) {
        console.error('Error:', error);
    } finally {
        button.textContent = 'Analyze Review';
    }
});

async function fetchReviews() {
    const res = await fetch('/api/reviews');
    const reviews = await res.json();
    
    const feed = document.getElementById('reviewFeed');
    feed.innerHTML = '';
    
    reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = `card ${review.isSpam ? 'spam' : ''}`;
        
        const badgeClass = review.isSpam ? 'spam' : 'safe';
        
        card.innerHTML = `
            <span class="badge ${badgeClass}">${review.status}</span>
            <span class="score">Spam Confidence: ${review.score}%</span>
            <strong>${review.productName}</strong>
            <p>${review.reviewText}</p>
        `;
        feed.appendChild(card);
    });
}

// Initial load
fetchReviews();
