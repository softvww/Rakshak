const fs = require('fs');

function patchFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. replace buildLocationMessage
    const targetBuildLoc = `function buildLocationMessage(contactName) {
    const lat = currentCoordinates[0];
    const lng = currentCoordinates[1];
    const mapsLink = \`https://maps.google.com/?q=\${lat},\${lng}\`;
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (currentLang === 'mr') {
        return \`🚨 *रक्षक - आणीबाणी अलर्ट!*\\n\\nनमस्कार \${contactName},\\n\\nहे संकटकालीन संदेश आहे! मुलाचे/मुलीचे *सध्याचे लाईव्ह स्थान* खालील लिंकवर पाहा:\\n\\n📍 *Google Maps लिंक:*\\n\${mapsLink}\\n\\n⏰ वेळ: \${time}\\n\\nकृपया ताबडतोब संपर्क करा किंवा पोलिसांना कळवा: *112*\\n\\n_Rakshak Safety App द्वारे पाठवले_\`;
    } else {
        return \`🚨 *RAKSHAK - EMERGENCY ALERT!*\\n\\nHello \${contactName},\\n\\nThis is an emergency message! View the *current live location* below:\\n\\n📍 *Google Maps Link:*\\n\${mapsLink}\\n\\n⏰ Time: \${time}\\n\\nPlease contact immediately or call Police: *112*\\n\\n_Sent via Rakshak Safety App_\`;
    }
}`;

    const replacementBuildLoc = `async function getNearestPoliceText(lat, lng) {
    try {
        const query = \`[out:json][timeout:5];(node["amenity"="police"](around:5000,\${lat},\${lng});way["amenity"="police"](around:5000,\${lat},\${lng}););out center 3;\`;
        const url = \`https://overpass-api.de/api/interpreter?data=\${encodeURIComponent(query)}\`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.elements && data.elements.length > 0) {
            const sorted = data.elements.map(el => {
                const eLat = el.lat || el.center?.lat;
                const eLng = el.lon || el.center?.lon;
                const dist = getDistanceKm(lat, lng, eLat, eLng);
                return { ...el, dist };
            }).sort((a, b) => a.dist - b.dist).slice(0, 2);

            let txt = '';
            sorted.forEach(st => {
                const name = st.tags?.name || st.tags?.['name:en'] || 'Police Station';
                const phone = st.tags?.phone || st.tags?.contact?.phone || 'Not available';
                const distKm = st.dist < 1 ? Math.round(st.dist * 1000) + 'm' : st.dist.toFixed(1) + 'km';
                txt += \`- \${name} (\${distKm})\\n  📞 \${phone}\\n\`;
            });
            return txt;
        }
    } catch(e) { }
    return "";
}

function buildLocationMessage(contactName, policeText = "") {
    const lat = currentCoordinates[0];
    const lng = currentCoordinates[1];
    const mapsLink = \`https://maps.google.com/?q=\${lat},\${lng}\`;
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    let pInfo = policeText ? \`\\n\\n🚨 *Nearest Police Stations:*\\n\${policeText}\` : '';

    if (currentLang === 'mr') {
        return \`🚨 *रक्षक - आणीबाणी अलर्ट!*\\n\\nनमस्कार \${contactName},\\n\\nहे संकटकालीन संदेश आहे! मुलाचे/मुलीचे *सध्याचे लाईव्ह स्थान* खालील लिंकवर पाहा:\\n\\n📍 *Google Maps लिंक:*\\n\${mapsLink}\${pInfo}\\n\\n⏰ वेळ: \${time}\\n\\nकृपया ताबडतोब संपर्क करा किंवा पोलिसांना कळवा: *112*\\n\\n_Rakshak Safety App द्वारे पाठवले_\`;
    } else {
        return \`🚨 *RAKSHAK - EMERGENCY ALERT!*\\n\\nHello \${contactName},\\n\\nThis is an emergency message! View the *current live location* below:\\n\\n📍 *Google Maps Link:*\\n\${mapsLink}\${pInfo}\\n\\n⏰ Time: \${time}\\n\\nPlease contact immediately or call Police: *112*\\n\\n_Sent via Rakshak Safety App_\`;
    }
}`;

    content = content.replace(targetBuildLoc, replacementBuildLoc);

    // 2. replace shareLocationToAll
    const targetShareAll = `function shareLocationToAll() {
    if (guardianContacts.length === 0) {
        showToast(currentLang === 'en' ? "No guardians added! Go to Circle tab." : "रक्षक गटात कोणीही नाही! Circle टॅबमध्ये जा.", "warn");
        return;
    }

    // Get real location first, then open WhatsApp for each contact
    navigator.geolocation.getCurrentPosition(pos => {
        currentCoordinates = [pos.coords.latitude, pos.coords.longitude];
        guardianContacts.forEach((contact, idx) => {
            setTimeout(() => {
                shareLocationToOne(contact);
            }, idx * 1200); // stagger 1.2s each to avoid popup blocking
        });
        showToast(
            currentLang === 'en' ? \`Opening WhatsApp for \${guardianContacts.length} guardian(s)...\` : \`\${guardianContacts.length} रक्षकांना WhatsApp उघडत आहे...\`,
            "success"
        );
    }, () => {
        // fallback with existing coords
        guardianContacts.forEach((contact, idx) => {
            setTimeout(() => shareLocationToOne(contact), idx * 1200);
        });
    }, { enableHighAccuracy: true, timeout: 5000 });
}`;

    const replacementShareAll = `function shareLocationToAll() {
    if (guardianContacts.length === 0) {
        showToast(currentLang === 'en' ? "No guardians added! Go to Circle tab." : "रक्षक गटात कोणीही नाही! Circle टॅबमध्ये जा.", "warn");
        return;
    }

    const processLocationShare = async (lat, lng) => {
        currentCoordinates = [lat, lng];
        const policeText = await getNearestPoliceText(lat, lng);
        guardianContacts.forEach((contact, idx) => {
            setTimeout(() => shareLocationToOne(contact, policeText), idx * 1200);
        });
        showToast(
            currentLang === 'en' ? \`Opening WhatsApp for \${guardianContacts.length} guardian(s)...\` : \`\${guardianContacts.length} रक्षकांना WhatsApp उघडत आहे...\`,
            "success"
        );
    };

    navigator.geolocation.getCurrentPosition(pos => {
        processLocationShare(pos.coords.latitude, pos.coords.longitude);
    }, () => {
        processLocationShare(currentCoordinates[0], currentCoordinates[1]);
    }, { enableHighAccuracy: true, timeout: 5000 });
}`;

    content = content.replace(targetShareAll, replacementShareAll);

    // 3. replace shareLocationToOne and sendSmsAlert
    content = content.replace("function shareLocationToOne(contact) {", "function shareLocationToOne(contact, policeText = \"\") {");
    content = content.replace("const msg = buildLocationMessage(contact.name);", "const msg = buildLocationMessage(contact.name, typeof policeText === 'string' ? policeText : \"\");");

    // sendSmsAlert uses buildLocationMessage too so we let it just pass undefined/empty string

    // 4. replace simulateEmergencyAlertSends
    const targetSimulate = `function simulateEmergencyAlertSends() {
    // Also auto-find police station on SOS
    findNearestPolice();

    if (guardianContacts.length === 0) {
        showToast(currentLang === 'en' ? "⚠️ No guardians! Add contacts in Circle tab." : "⚠️ रक्षक गट रिकामा आहे! Circle मध्ये संपर्क जोडा.", "warn");
        return;
    }

    navigator.geolocation.getCurrentPosition(pos => {
        currentCoordinates = [pos.coords.latitude, pos.coords.longitude];
        // Open WhatsApp for each contact sequentially
        guardianContacts.forEach((contact, idx) => {
            setTimeout(() => shareLocationToOne(contact), 800 + idx * 1500);
        });
        showToast(
            currentLang === 'en' ? \`🚨 Live location sent to \${guardianContacts.length} guardian(s) via WhatsApp!\` : \`🚨 \${guardianContacts.length} रक्षकांना WhatsApp वर Live Location पाठवले!\`,
            "success"
        );
    }, () => {
        guardianContacts.forEach((contact, idx) => {
            setTimeout(() => shareLocationToOne(contact), 800 + idx * 1500);
        });
    }, { enableHighAccuracy: true, timeout: 5000 });
}`;

    const replacementSimulate = `function simulateEmergencyAlertSends() {
    findNearestPolice();

    if (guardianContacts.length === 0) {
        showToast(currentLang === 'en' ? "⚠️ No guardians! Add contacts in Circle tab." : "⚠️ रक्षक गट रिकामा आहे! Circle मध्ये संपर्क जोडा.", "warn");
        return;
    }

    const processSOS = async (lat, lng) => {
        currentCoordinates = [lat, lng];
        const policeText = await getNearestPoliceText(lat, lng);
        
        guardianContacts.forEach((contact, idx) => {
            setTimeout(() => shareLocationToOne(contact, policeText), 800 + idx * 1500);
        });
        showToast(
            currentLang === 'en' ? \`🚨 Live location sent to \${guardianContacts.length} guardian(s) via WhatsApp!\` : \`🚨 \${guardianContacts.length} रक्षकांना WhatsApp वर Live Location पाठवले!\`,
            "success"
        );
    };

    navigator.geolocation.getCurrentPosition(pos => {
        processSOS(pos.coords.latitude, pos.coords.longitude);
    }, () => {
        processSOS(currentCoordinates[0], currentCoordinates[1]);
    }, { enableHighAccuracy: true, timeout: 5000 });
}`;

    content = content.replace(targetSimulate, replacementSimulate);

    // Fix the shareLocationToOne invocation inside renderIndividualShareButtons which has a JSON serialization
    // This is fine since it passes the contact object and policeText will just be undefined.
    // So the function signature change works.

    fs.writeFileSync(filePath, content);
}

patchFile('app.js');
patchFile('www/app.js');
console.log('PATCH APPLIED');
