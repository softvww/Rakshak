const fs = require('fs');
let content = fs.readFileSync('safety_video.html', 'utf8');

// 1. Add back button and language buttons
const target1 = `<div class="intro-pills">
            <span class="pill">✅ गुड टच</span>
            <span class="pill">🚫 बॅड टच</span>
            <span class="pill">🧍 माझे शरीर माझे आहे</span>
            <span class="pill">🚨 अनोळखी व्यक्ती</span>
            <span class="pill">📢 सांगा!</span>
        </div>
        <button id="startBtn">▶️ &nbsp; Video सुरू करा</button>`;

const replacement1 = `        <button onclick="window.location.href='index.html'" style="position: absolute; top: 24px; left: 24px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 8px 14px; border-radius: 8px; font-size: 16px; cursor: pointer; z-index: 101; font-weight: bold;">🔙 Back</button>
        <div class="intro-pills">
            <span class="pill">✅ गुड टच</span>
            <span class="pill">🚫 बॅड टच</span>
            <span class="pill">🧍 माझे शरीर माझे आहे</span>
            <span class="pill">🚨 अनोळखी व्यक्ती</span>
            <span class="pill">📢 सांगा!</span>
        </div>
        <div style="display: flex; gap: 15px; margin-bottom: 24px;">
            <button id="langMarathi" class="lang-btn active" style="background: rgba(200, 75, 255, 0.4); border: 2px solid #c84bff; color: white; padding: 10px 24px; border-radius: 30px; font-weight: bold; cursor: pointer; transition: 0.2s;">मराठी (Marathi)</button>
            <button id="langEnglish" class="lang-btn" style="background: rgba(255, 255, 255, 0.05); border: 2px solid rgba(255, 255, 255, 0.15); color: white; padding: 10px 24px; border-radius: 30px; font-weight: bold; cursor: pointer; transition: 0.2s;">English</button>
        </div>
        <button id="startBtn">▶️ &nbsp; Video सुरू करा</button>`;
content = content.replace(target1, replacement1);

// 2. JS logic updates 
const targetJS = `let current = 0;
        let playing = false;
        let startTime = 0;
        let elapsed = 0;
        let rafId = null;`;

const replacementJS = `let currentLanguage = 'marathi';
        let current = 0;
        let playing = false;
        let startTime = 0;
        let elapsed = 0;
        let rafId = null;`;
content = content.replace(targetJS, replacementJS);

// 3. Audio engine
const targetAudio = `let currentAudio = null;
        function speak(idx, onEnd) {
            if (currentAudio) { currentAudio.pause(); currentAudio = null; }
            currentAudio = new Audio('slide' + (idx + 1) + '.mp3');
            currentAudio.play().catch(e => console.error(e));
            currentAudio.onended = () => { onEnd && setTimeout(onEnd, 500); };
            currentAudio.onerror = () => { onEnd && setTimeout(onEnd, SLIDE_DURATION); };
        }`;

const replacementAudio = `let currentAudio = null;
        const bgmAudio = new Audio('bgm.mp3');
        bgmAudio.loop = true;
        bgmAudio.volume = 0.25;

        function speak(idx, onEnd) {
            if (currentAudio) { currentAudio.pause(); currentAudio = null; }
            
            let audioFile = '';
            if (idx < 6) {
                const suffix = ['1st', '2nd', '3rd', '4th', '5th', '6th'][idx];
                if (currentLanguage === 'marathi') {
                    audioFile = idx === 0 ? 'Marathi-1st Point.ogg' : \`Marathi-\${suffix} Point.ogg\`;
                } else {
                    audioFile = \`English-\${suffix} Point.ogg\`;
                }
                
                // Fallback since some files have spaces and some have hyphens in the filename based on git status
                if (currentLanguage === 'marathi') {
                     if (idx === 0) audioFile = 'Marathi-1st Point.ogg';
                     if (idx === 1) audioFile = 'Marathi - 2nd Point.ogg';
                     if (idx === 2) audioFile = 'Marathi - 3rd Point.ogg';
                     if (idx === 3) audioFile = 'Marathi - 4th Point.ogg';
                     if (idx === 4) audioFile = 'Marathi - 5th Point.ogg';
                     if (idx === 5) audioFile = 'Marathi - 6th Point.ogg';
                } else {
                     if (idx === 0) audioFile = 'English - 1st Point.ogg';
                     if (idx === 1) audioFile = 'English - 2nd Point.ogg';
                     if (idx === 2) audioFile = 'English - 3rd Point.ogg';
                     if (idx === 3) audioFile = 'English - 4th Point.ogg';
                     if (idx === 4) audioFile = 'English - 5th Point.ogg';
                     if (idx === 5) audioFile = 'English - 6th Point.ogg';
                }
            }

            if (audioFile) {
                currentAudio = new Audio(audioFile);
                currentAudio.play().catch(e => console.error(e));
                currentAudio.onended = () => { onEnd && setTimeout(onEnd, 500); };
                currentAudio.onerror = () => { onEnd && setTimeout(onEnd, SLIDE_DURATION); };
            } else {
                setTimeout(onEnd, SLIDE_DURATION);
            }
        }`;
content = content.replace(targetAudio, replacementAudio);

// 4. Start Button logic + BGM
const targetStart = `        function start() {
            introScreen.style.display = 'none';
            controls.classList.add('visible');
            playing = true;
            startTime = Date.now();
            rafId = requestAnimationFrame(tick);

            playSlide(0);
        }`;
const replacementStart = `        function start() {
            introScreen.style.display = 'none';
            controls.classList.add('visible');
            playing = true;
            startTime = Date.now();
            rafId = requestAnimationFrame(tick);

            bgmAudio.currentTime = 0;
            bgmAudio.play().catch(e => console.warn(e));

            playSlide(0);
        }`;
content = content.replace(targetStart, replacementStart);

// 5. Pause logic
const targetPause = `if (currentAudio) currentAudio.pause();
                cancelAnimationFrame(rafId);
                ppBtn.textContent = '▶';
            } else {
                playing = true;
                if (currentAudio) currentAudio.play();
                startTime = Date.now() - elapsed;
                rafId = requestAnimationFrame(tick);
                ppBtn.textContent = '⏸';`;
const replacementPause = `if (currentAudio) currentAudio.pause();
                bgmAudio.pause();
                cancelAnimationFrame(rafId);
                ppBtn.textContent = '▶';
            } else {
                playing = true;
                if (currentAudio) currentAudio.play();
                bgmAudio.play();
                startTime = Date.now() - elapsed;
                rafId = requestAnimationFrame(tick);
                ppBtn.textContent = '⏸';`;
content = content.replace(targetPause, replacementPause);

// 6. Finish & Replay
content = content.replace("cancelAnimationFrame(rafId);\n            controls.classList.remove('visible');", "bgmAudio.pause();\n            cancelAnimationFrame(rafId);\n            controls.classList.remove('visible');");
content = content.replace("rafId = requestAnimationFrame(tick);\n            playSlide(0);", "rafId = requestAnimationFrame(tick);\n            bgmAudio.play();\n            playSlide(0);");

// 7. Event listeners for language
const targetEvents = `document.getElementById('startBtn').addEventListener('click', start);`;
const replacementEvents = `document.getElementById('startBtn').addEventListener('click', start);
        document.getElementById('langMarathi').addEventListener('click', () => {
            currentLanguage = 'marathi';
            document.getElementById('langMarathi').style.background = 'rgba(200, 75, 255, 0.4)';
            document.getElementById('langMarathi').style.borderColor = '#c84bff';
            document.getElementById('langEnglish').style.background = 'rgba(255, 255, 255, 0.05)';
            document.getElementById('langEnglish').style.borderColor = 'rgba(255, 255, 255, 0.15)';
        });
        document.getElementById('langEnglish').addEventListener('click', () => {
            currentLanguage = 'english';
            document.getElementById('langEnglish').style.background = 'rgba(200, 75, 255, 0.4)';
            document.getElementById('langEnglish').style.borderColor = '#c84bff';
            document.getElementById('langMarathi').style.background = 'rgba(255, 255, 255, 0.05)';
            document.getElementById('langMarathi').style.borderColor = 'rgba(255, 255, 255, 0.15)';
        });`;
content = content.replace(targetEvents, replacementEvents);

fs.writeFileSync('safety_video.html', content);
console.log('SAFETY VIDEO UPDATED PERFECTLY!');
