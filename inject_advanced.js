const fs = require('fs');

let html = fs.readFileSync('www/parent-monitor.html', 'utf8');

// 1. Add CSS for new features
const cssInsert = `
        /* New Advanced Features CSS */
        .video-control-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
            padding: 14px;
            display: flex;
            gap: 10px;
            justify-content: center;
        }
        .v-btn {
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            font-size: 11px;
            font-weight: 700;
            padding: 6px 12px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .v-btn.active {
            background: var(--accent);
            border-color: var(--accent);
        }
        
        .geofence-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 10px;
            border-radius: 12px;
            background: rgba(255, 171, 0, 0.1);
            color: var(--yellow);
            border: 1px dashed var(--yellow);
            font-size: 12px;
            font-weight: 700;
            margin-top: 10px;
            cursor: pointer;
            transition: 0.2s;
        }
        .geofence-btn:hover { background: rgba(255, 171, 0, 0.2); }

        .notif-list { display: flex; flex-direction: column; gap: 8px; margin-top: 12px; }
        .notif-item {
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--border);
            padding: 10px;
            border-radius: 12px;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }
        .n-icon { font-size: 18px; }
        .n-content { flex: 1; }
        .n-app { font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }
        .n-msg { font-size: 12px; color: var(--text); margin-top: 2px; }
        .n-time { font-size: 10px; color: var(--text-muted); }
`;
html = html.replace('/* Instructions */', cssInsert + '\n        /* Instructions */');

// 2. Add Video Controls HTML
const videoHtmlReplace = `
                    <div class="video-hud" id="videoHUD" style="display:none;">
                        <div class="hud-live-badge">
                            <div class="hud-live-dot"></div>
                            LIVE
                        </div>
                        <div class="hud-time" id="liveHudTime">00:00:00</div>
                    </div>

                    <div class="video-control-bar" id="videoControls" style="display:none;">
                        <button class="v-btn active" onclick="showToast('📷 Front Camera Switched')">Front Cam</button>
                        <button class="v-btn" onclick="showToast('📷 Back Camera Switched')">Back Cam</button>
                        <button class="v-btn" onclick="showToast('💻 Screen Mirroring Request Sent!')">📱 Screen Mirror</button>
                    </div>
`;
html = html.replace(/<div class="video-hud" id="videoHUD" style="display:none;">[\s\S]*?<\/div>\s*<\/div>/, videoHtmlReplace);

// 3. Ensure videoControls displays when live
html = html.replace("hud.style.display = 'flex';", "hud.style.display = 'flex';\n            document.getElementById('videoControls').style.display = 'flex';");
html = html.replace("hud.style.display = 'none';", "hud.style.display = 'none';\n            document.getElementById('videoControls').style.display = 'none';");

// 4. Add Geofence Button to Location Card
html = html.replace(/(<div id="locationSection">[\s\S]*?<\/div>)/, `$1\n                <button class="geofence-btn" onclick="showToast('🛡️ Safe Zone Setup Opened')">🛡️ Add Safe Zone (Geofence Alert)</button>`);

// 5. Add Notification Sync Card below Location Card
const notifCard = `
            <!-- Notification Sync Card -->
            <div class="card" id="notifCard" style="display:none;">
                <div class="card-title">📨 Live Notifications Tracker</div>
                <div class="card-desc">मुलाच्या फोनवर येणारे Messages व Alerts</div>
                
                <div class="notif-list">
                    <div class="notif-item">
                        <div class="n-icon">💬</div>
                        <div class="n-content">
                            <div class="n-app">WhatsApp</div>
                            <div class="n-msg"><strong>Rahul:</strong> Chal online ye jaldi game me</div>
                        </div>
                        <div class="n-time">Just Now</div>
                    </div>
                    <div class="notif-item">
                        <div class="n-icon">📸</div>
                        <div class="n-content">
                            <div class="n-app">Instagram</div>
                            <div class="n-msg">Someone sent a photo to direct messages.</div>
                        </div>
                        <div class="n-time">2m ago</div>
                    </div>
                </div>
            </div>
`;
html = html.replace('<!-- How To Use -->', notifCard + '\n            <!-- How To Use -->');
html = html.replace("snapCard.style.display = 'block';", "snapCard.style.display = 'block';\n            document.getElementById('notifCard').style.display = 'block';");
html = html.replace("audioInd.style.display = 'none';", "audioInd.style.display = 'none';\n            document.getElementById('notifCard').style.display = 'none';");

fs.writeFileSync('www/parent-monitor.html', html);
console.log('Done parent-monitor.html');
