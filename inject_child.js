const fs = require('fs');

let html = fs.readFileSync('www/child-qr.html', 'utf8');

// 1. Add CSS for Setup Wizard
const newCss = `
        /* FlashGet Kids Setup Wizard */
        .setup-list { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
        .setup-item {
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--border);
            padding: 12px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .s-info { display: flex; align-items: center; gap: 10px; }
        .s-icon { font-size: 20px; }
        .s-title { font-size: 13px; font-weight: 700; color: white; }
        .s-desc { font-size: 10px; color: var(--text-muted); }
        .s-btn {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: none;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
        }
        .s-btn.granted { background: var(--green); color: #000; }
        
        /* Stealth Mode Live View */
        .stealth-view {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 60vh;
            text-align: center;
            color: rgba(255,255,255,0.2);
        }
        .stealth-icon { font-size: 60px; margin-bottom: 20px; opacity: 0.1; }
`;
html = html.replace('/* Manual QR input */', newCss + '\n        /* Manual QR input */');

// 2. Add Phase Setup HTML and update initial active phase
const setupHtml = `
        <!-- PHASE 0: Permission Setup Wizard -->
        <div class="phase active" id="phase-setup">
            <div class="card">
                <div class="card-title">🛡️ System Setup Required</div>
                <div class="card-desc">For maximum child safety, advance Android permissions are strictly required before binding.</div>
                
                <div class="setup-list">
                    <div class="setup-item">
                        <div class="s-info">
                            <div class="s-icon">⚙️</div>
                            <div>
                                <div class="s-title">Accessibility</div>
                                <div class="s-desc">To block unsafe apps and prevent uninstall.</div>
                            </div>
                        </div>
                        <button class="s-btn" onclick="this.textContent='Granted'; this.classList.add('granted'); checkSetup()">Grant</button>
                    </div>
                    
                    <div class="setup-item">
                        <div class="s-info">
                            <div class="s-icon">📊</div>
                            <div>
                                <div class="s-title">Usage Data</div>
                                <div class="s-desc">To monitor app screen time effectively.</div>
                            </div>
                        </div>
                        <button class="s-btn" onclick="this.textContent='Granted'; this.classList.add('granted'); checkSetup()">Grant</button>
                    </div>

                    <div class="setup-item">
                        <div class="s-info">
                            <div class="s-icon">📍</div>
                            <div>
                                <div class="s-title">Location Always</div>
                                <div class="s-desc">To provide precise geofencing alerts.</div>
                            </div>
                        </div>
                        <button class="s-btn" onclick="this.textContent='Granted'; this.classList.add('granted'); checkSetup()">Grant</button>
                    </div>
                </div>

                <div style="margin-top: 15px; font-size:11px; color:var(--primary); text-align:center;">
                    *All permissions must be granted to continue to QR Scanner.
                </div>
            </div>
        </div>
`;
// Make phase-scan NOT active initially
html = html.replace('<div class="phase active" id="phase-scan">', setupHtml + '\n        <!-- PHASE 1: Scanner -->\n        <div class="phase" id="phase-scan">');

// 3. Replace Phase Live with Stealth protection view
html = html.replace(/<div class="live-header">[\s\S]*?<\/button>/, `
            <div class="stealth-view">
                <div class="stealth-icon">🛡️</div>
                <h3 style="opacity:0.3; font-size:16px;">System Protected</h3>
                <p style="opacity:0.2; font-size:12px; margin-top:10px;">Rakshak security engine is running in the background.<br>This device is secured.</p>
            </div>
`);

// 4. Add the checkSetup script logic
const jsInsert = `
        let permsGranted = 0;
        function checkSetup() {
            permsGranted++;
            if(permsGranted >= 3) {
                showToast('✅ All System Permissions Granted!');
                setTimeout(() => {
                    showPhase('phase-scan');
                    setStatus('idle', 'QR Scan करण्यासाठी तयार व्हा...');
                }, 800);
            }
        }
`;
html = html.replace('// ─── On load:', jsInsert + '\n        // ─── On load:');

// Replace "🟢 Live Streaming सुरू आहे!" text with 'Stealth monitoring active'
html = html.replace(/setStatus\('live', '.*?Live Streaming.*?'\);/, "setStatus('live', '🛡️ Device secured and hidden from view');");
html = html.replace("showToast('📹 Streaming सुरू झाले! आई-बाबा पाहत आहेत.');", "showToast('🛡️ Protection active. Running stealthily.');");

fs.writeFileSync('www/child-qr.html', html);
console.log('child-qr.html updated correctly!');
