const fs = require('fs');
let html = fs.readFileSync('www/index.html', 'utf8');

const linkHtml = `
                <!-- Quick Link to Video -->
                <div class="safety-card" style="background: linear-gradient(135deg, rgba(255, 69, 58, 0.1), rgba(255, 159, 10, 0.1)); border-color: rgba(255, 69, 58, 0.3); border-width: 2px;">
                    <h3 class="card-title">
                        <i data-lucide="play-circle"></i>
                        <span>🎬 Body Safety Video Demo</span>
                    </h3>
                    <p class="card-desc" style="margin-bottom:15px;">Check how the video works! Only the audio files will need to be replaced later.</p>
                    <a href="safety_video.html" target="_blank" class="safety-btn" style="background: linear-gradient(135deg, #FF453A, #FF9F0A); color:white; display:flex; align-items:center; justify-content:center; gap:8px; padding:14px; border-radius:14px; text-decoration:none; font-weight:700;">
                        ▶️ PLAY VIDEO FULLSCREEN
                    </a>
                </div>
`;

if (!html.includes('🎬 Body Safety Video Demo')) {
    html = html.replace('<!-- Quick Action Safety Tools -->', linkHtml + '\n                <!-- Quick Action Safety Tools -->');
    fs.writeFileSync('www/index.html', html);
    console.log('Added Video Bookmark to Home!');
} else {
    console.log('Already added.');
}
