const fs = require('fs');
const filePaths = ['www/safety_video.html', 'safety_video.html'];

for (const p of filePaths) {
    if (!fs.existsSync(p)) continue;
    let content = fs.readFileSync(p, 'utf8');

    // Replace speak function
    content = content.replace(/function speak\(text, onEnd\) \{[\s\S]*?window\.speechSynthesis\.speak\(u\);\s*\}/,
        `let currentAudio = null;
        function speak(idx, onEnd) {
            if (currentAudio) { currentAudio.pause(); currentAudio = null; }
            currentAudio = new Audio('slide' + (idx + 1) + '.mp3');
            currentAudio.play().catch(e => console.error(e));
            currentAudio.onended = () => { onEnd && setTimeout(onEnd, 500); };
            currentAudio.onerror = () => { onEnd && setTimeout(onEnd, SLIDE_DURATION); };
        }`);

    // Update playSlide
    content = content.replace(/speak\(narration\[idx\], \(\) => \{/, 'speak(idx, () => {');

    // Update start (remove voices check)
    content = content.replace(/\/\/ Load voices first[\s\S]*?playSlide\(0\);\s*\}\s*\}/,
        `playSlide(0);
        }`);

    // Update togglePause
    content = content.replace(/window\.speechSynthesis\.pause\(\);/, 'if (currentAudio) currentAudio.pause();');
    content = content.replace(/window\.speechSynthesis\.resume\(\);/, 'if (currentAudio) currentAudio.play();');
    content = content.replace(/if \(\!window\.speechSynthesis\.speaking && \!window\.speechSynthesis\.pending\) \{[\s\S]*?\}/,
        `if (!currentAudio || currentAudio.ended) {
                    playSlide(current + 1);
                }`);

    // Update finish and scrubber
    content = content.replace(/window\.speechSynthesis\.cancel\(\);/g, 'if (currentAudio) { currentAudio.pause(); currentAudio = null; }');

    fs.writeFileSync(p, content);
    console.log('✅ Updated ' + p);
}
