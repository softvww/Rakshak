/* ============================================================
   RAKSHAK (रक्षक) SAFETY COMPANION — app.js
   ============================================================ */

// ---- Globals & State ----
let currentLang = 'en'; // 'en' or 'mr'
let currentTab = 'home';
let isSosActive = false;
let isSosCountdownRunning = false;
let sosCountdownTimer = null;
let sosCountdownVal = 3;

// Audio Synthesizer States
let audioCtx = null;
let sirenOsc1 = null;
let sirenOsc2 = null;
let sirenGain = null;
let isSirenPlaying = false;

// Scream Detector States
let micStream = null;
let audioSource = null;
let analyser = null;
let screamInterval = null;
let isScreamDetectorActive = false;

// Camera States
let cameraStreamObj = null;
let activeFacingMode = "user"; // "user" or "environment"
let photoLedger = []; // In-memory safety snaps
let autoSnapshotTimer = null;

// Map States
let safetyMap = null;
let userMarker = null;
let reportedIncidents = [];
let mapSafeHubMarkers = [];
let currentCoordinates = [19.0760, 72.8777]; // Mumbai Default

// Guard Circle Contacts
let guardianContacts = [];

// Fake Call States
let fakeCallTimer = null;
let fakeCallActive = false;
let callRingtoneInterval = null;
let activeCallSeconds = 0;
let activeCallTimer = null;
let callerSpeech = null;

// Quiz States
let currentQuestionIndex = 0;
let quizScore = 0;

// ---- Translations Dictionary ----
const translations = {
    'brandLogo': { en: 'RAKSHAK', mr: 'रक्षक' },
    'brandSub': { en: 'Safety Companion', mr: 'सुरक्षा साथीदार' },
    'langBtnText': { en: 'मराठी', mr: 'English' },
    'statusText': { en: 'Safe', mr: 'सुरक्षित' },
    'lblLocalThreat': { en: 'Threat level', mr: 'धोक्याची पातळी' },
    'valThreatLevel': { en: 'LOW', mr: 'कमी' },
    'lblAreaScore': { en: 'Safety Score', mr: 'सुरक्षा स्कोअर' },
    'lblTime': { en: 'Local Time', mr: 'स्थानिक वेळ' },
    'sosTextSub': { en: 'HELP NEEDED', mr: 'मदत हवी आहे' },
    'sosHint': { en: 'Press SOS in case of emergency', mr: 'आणीबाणीच्या प्रसंगी SOS दाबा' },
    'screamTitle': { en: 'Scream Detector', mr: 'किंचाळणे शोधक' },
    'screamDesc': { en: 'Triggers SOS automatically upon loud scream', mr: 'मोठ्या किंचाळण्याने आपोआप SOS सुरू होईल' },
    'quickToolsTitle': { en: 'Quick Help Tools', mr: 'त्वरित मदत साधने' },
    'quickToolsDesc': { en: 'Tap to immediately scare threats or initiate escape scenarios.', mr: 'धमकी घाबरवण्यासाठी किंवा सुटकेचे नियोजन करण्यासाठी दाबा.' },
    'txtToolSiren': { en: 'Siren', mr: 'सायरन' },
    'txtToolStrobe': { en: 'Strobe Light', mr: 'झगमगाट' },
    'txtToolFakeCall': { en: 'Fake Call', mr: 'खोटा कॉल' },
    'camTitle': { en: 'Live Surveillance', mr: 'थेट पाळत ठेवणे' },
    'camDesc': { en: 'Capture surrounding visuals securely. Snapshots are stored in local safety ledger.', mr: 'आजूबाजूचे दृश्य सुरक्षितपणे रेकॉर्ड करा. फोटो सुरक्षितपणे सेव्ह केले जातील.' },
    'txtRecordingHUD': { en: 'SECURE STREAM', mr: 'सुरक्षित रेकॉर्डिंग' },
    'camPlaceholderText': { en: 'Surveillance feed is stopped. Click Start Stream below.', mr: 'कॅमेरा रेकॉर्डिंग बंद आहे. सुरू करण्यासाठी बटण दाबा.' },
    'btnStartCameraTxt': { en: 'Start Stream', mr: 'कॅमेरा सुरू करा' },
    'btnStopCameraTxt': { en: 'Stop Stream', mr: 'कॅमेरा बंद करा' },
    'snapsTitle': { en: 'Safety Ledger Snaps', mr: 'सुरक्षित फोटो गॅलरी' },
    'mapTitle': { en: 'Safety Map Tracker', mr: 'सुरक्षितता नकाशा' },
    'mapDesc': { en: 'Locate nearby safety assistance centers and view active incidents.', mr: 'जवळचे मदत केंद्र शोधा आणि नकाशावर धोके तपासा.' },
    'mapOverlayLocate': { en: 'My Location', mr: 'माझे स्थान' },
    'mapOverlayReport': { en: 'Report Incident', mr: 'धोका नोंदवा' },
    'hubsTitle': { en: 'Nearby Safety Centers', mr: 'जवळचे मदत केंद्र' },
    'academyTabKids': { en: 'Kids Mode', mr: 'लहान मुले' },
    'academyTabAdults': { en: 'Adults Mode', mr: 'प्रौढ नागरिक' },
    'kidsVideoTitle': { en: 'Body Safety Video', mr: 'बाल सुरक्षा चित्रपट (व्हिडिओ)' },
    'kidsVideoDesc': { en: 'Watch this short animation to learn about Safe and Unsafe Touch rules.', mr: 'चांगला आणि वाईट स्पर्श याबद्दल जाणून घेण्यासाठी हा लघुपट नक्की पहा.' },
    'kidsQuizTitle': { en: 'Kids Safety Quiz', mr: 'मुलांची सुरक्षितता क्विझ' },
    'kidsQuizDesc': { en: 'Test safety knowledge. Earn your Safety Badge!', mr: 'सुरक्षितता ज्ञानाची चाचणी घ्या. सेफ्टी बॅज मिळवा!' },
    'certTitle': { en: 'SAFETY CHAMPION', mr: 'सुरक्षा चॅम्पियन' },
    'certSub': { en: 'Congratulations! You answered all questions correctly.', mr: 'अभिनंदन! तुम्ही सर्व प्रश्नांची उत्तरे योग्य दिली आहेत.' },
    'tipKids1Title': { en: 'Good Touch vs Bad Touch', mr: 'चांगला स्पर्श विरुद्ध वाईट स्पर्श' },
    'tipKids1Desc': { en: 'Safe touch feels comfortable, like a handshake. If any touch makes you feel scared, confused, or sad, say NO immediately and tell parents.', mr: 'सुरक्षित स्पर्श बरा वाटतो, जसे की हस्तांदोलन. जर स्पर्शाने भीती वाटत असेल, तर लगेच मोठ्याने "नाही" म्हणा आणि पालकांना सांगा.' },
    'tipKids2Title': { en: 'School Bus Safety', mr: 'शाळेच्या बसची सुरक्षा' },
    'tipKids2Desc': { en: 'Always sit properly in the bus. Do not poke your head or hands out of windows, and only board or alight after the bus stops fully.', mr: 'नेहमी बसमध्ये व्यवस्थित बसा. खिडकीतून डोके किंवा हात बाहेर काढू नका, आणि बस पूर्णपणे थांबल्यावरच उतरा.' },
    'tipKids3Title': { en: 'Stranger Danger', mr: 'अनोळखी व्यक्तींपासून सावधान' },
    'tipKids3Desc': { en: 'Never accept chocolates, gifts, or rides from people you do not know. Keep safe distance and run to a crowd if followed.', mr: 'अनोळखी व्यक्तींकडून चॉकलेट, भेटवस्तू किंवा लिफ्ट घेऊ नका. अंतर ठेवा आणि गर्दीकडे पळा.' },
    'tipAdults1Title': { en: 'Self Defense Actions', mr: 'स्वसंरक्षण पद्धती' },
    'tipAdults1Desc': { en: 'Aim for sensitive points (eyes, throat, groin) if physically assaulted. Use keys or phone as improvised defense tools.', mr: 'शारीरिक हल्ला झाल्यास डोळे, घसा, खाजगी अवयवांवर मारा करा. बचावासाठी चावी किंवा फोनचा वापर करा.' },
    'tipAdults2Title': { en: 'Safe Solo Travel', mr: 'एकटे प्रवास करताना सुरक्षा' },
    'tipAdults2Desc': { en: 'Always share live ride tracking links with family. Avoid dark alleyways and walk with posture that shows high confidence.', mr: 'कुटुंबासोबत प्रवासाचे लाईव्ह लोकेशन शेअर करा. काळोखी गल्ली टाळा आणि आत्मविश्वासाने चाला.' },
    'tipAdults3Title': { en: 'Cyber Safety & Stalking', mr: 'सायबर सुरक्षा आणि स्टॉकिंग' },
    'tipAdults3Desc': { en: 'Enable strict double-factor authentication on social portals. Never share instant locations or travel check-ins publicly.', mr: 'सोशल मीडियावर २-फॅक्टर ऑथेंटिकेशन सुरू ठेवा. कधीही तुमचे लाईव्ह लोकेशन सार्वजनिक शेअर करू नका.' },
    'tipAdults4Title': { en: 'Legal & Police Rights', mr: 'कायदेशीर आणि पोलीस हक्क' },
    'tipAdults4Desc': { en: 'Women cannot be arrested after sunset or before sunrise without a lady constable. Right to file Zero FIR in any nearest police station.', mr: 'महिलांना सूर्यास्तानंतर किंवा सूर्योदयापूर्वी महिला पोलीस अधिकाऱ्याशिवाय अटक करता येत नाही. कोणत्याही पोलीस ठाण्यात "झिरो एफआयआर" दाखल करण्याचा अधिकार.' },
    'contactsTitle': { en: 'Guard Circle', mr: 'रक्षक गट (नातेवाईक)' },
    'contactsDesc': { en: 'These trusted contacts will receive alerts and emergency location link immediately when SOS triggers.', mr: 'SOS चालू झाल्यावर या विश्वसनीय संपर्कांना त्वरित मेसेज आणि तुमचे लाईव्ह लोकेशन पाठवले जाईल.' },
    'btnAddContactTxt': { en: 'Add Guardian Contact', mr: 'रक्षक संपर्क जोडा' },
    'helpTitle': { en: 'Emergency Helplines', mr: 'तातडीचे मदत क्रमांक' },
    'helpDesc': { en: 'Direct tap-to-call links to official helplines (Simulated dialing).', mr: 'थेट कॉल करण्यासाठी नंबर दाबा (सिम्युलेटेड कॉलिंग).' },
    'hlNational': { en: 'All Emergency', mr: 'सर्व आणीबाणी क्रमांक' },
    'hlNationalSub': { en: 'Police, Fire, Disaster', mr: 'पोलीस, अग्निशामक दल' },
    'hlWomen': { en: 'Women Helpline', mr: 'महिला सुरक्षा कक्ष' },
    'hlWomenSub': { en: 'Safety & Abuse Reports', mr: 'मदत आणि गैरवर्तन अहवाल' },
    'hlChild': { en: 'Child Helpline', mr: 'बाल मदत रेषा' },
    'hlChildSub': { en: 'Under-18 Support', mr: '१८ वर्षांखालील मुलांसाठी' },
    'hlMedical': { en: 'Ambulance', mr: 'रुग्णवाहिका सेवा' },
    'hlMedicalSub': { en: 'Medical Emergency', mr: 'वैद्यकीय आणीबाणी' },
    'mAddContactTitle': { en: 'Add Guardian', mr: 'रक्षक जोडा' },
    'lblCName': { en: 'Full Name', mr: 'पूर्ण नाव' },
    'lblCPhone': { en: 'Mobile Number', mr: 'मोबाईल नंबर' },
    'lblCRelation': { en: 'Relationship', mr: 'नाते' },
    'btnSaveContactTxt': { en: 'Save to Circle', mr: 'रक्षक गटामध्ये सेव्ह करा' },
    'mReportTitle': { en: 'Report Danger Zone', mr: 'असुरक्षित भाग नोंदवा' },
    'lblIncType': { en: 'Incident Type', mr: 'घटनेचा प्रकार' },
    'optUnsafeStreet': { en: '🔦 Dark Area / Poor lighting', mr: '🔦 अंधार असलेला रस्ता / विजेचे दिवे नाहीत' },
    'optHarassment': { en: '⚠️ Harassment Reported Here', mr: '⚠️ छेडछाडीचे ठिकाण' },
    'optSuspicious': { en: '👀 Suspicious Crowd gathered', mr: '👀 संशयास्पद लोकांची गर्दी' },
    'optIsolated': { en: '🚶 Empty/Isolated Road', mr: '🚶 ओसाड किंवा निर्मनुष्य रस्ता' },
    'lblIncDesc': { en: 'Additional Details (Optional)', mr: 'अधिक माहिती (पर्यायी)' },
    'btnSubmitIncidentTxt': { en: 'Publish Alert on Map', mr: 'नकाशावर इशारा जारी करा' },
    'mFakeTitle': { en: 'Fake Call Escape Scheduler', mr: 'खोटा कॉल वेळापत्रक' },
    'fakeSchedulerDesc': { en: 'Schedule an incoming call simulation. Useful to get out of uncomfortable, suspicious or unsafe social circles.', mr: 'खोट्या इनकमिंग कॉलचे नियोजन करा. संशयास्पद किंवा असुरक्षित लोकांमधून बाहेर पडण्यासाठी अत्यंत उपयुक्त.' },
    'lblFakeCaller': { en: 'Caller Persona Name', mr: 'कॉल करणाऱ्याचे नाव' },
    'lblFakeTimer': { en: 'Incoming delay', mr: 'कॉल येण्याची वेळ' },
    'optDelay5': { en: 'In 5 Seconds (Quick test)', mr: '५ सेकंदात (त्वरित चाचणी)' },
    'optDelay10': { en: 'In 10 Seconds', mr: '१० सेकंदात' },
    'optDelay30': { en: 'In 30 Seconds', mr: '३० सेकंदात' },
    'optDelay60': { en: 'In 1 Minute', mr: '१ मिनिटात' },
    'optDelay300': { en: 'In 5 Minutes', mr: '५ मिनिटात' },
    'btnScheduleFakeCallTxt': { en: 'Set Alert Call', mr: 'कॉल शेड्यूल करा' },
    'navTxtHome': { en: 'Home', mr: 'मुख्यपृष्ठ' },
    'navTxtCam': { en: 'Safe Cam', mr: 'कॅमेरा' },
    'navTxtMap': { en: 'Safe Map', mr: 'नकाशा' },
    'navTxtAcademy': { en: 'Academy', mr: 'मार्गदर्शक' },
    'navTxtContacts': { en: 'Circle', mr: 'संपर्क' }
};

// ---- Quiz Data ----
const quizQuestions = [
    {
        q: {
            en: "If an unknown person offers you chocolates or a ride home, what should you do?",
            mr: "जर एखाद्या अनोळखी व्यक्तीने तुम्हाला चॉकलेट किंवा घरी सोडण्यासाठी गाडी ऑफर केली, तर तुम्ही काय कराल?"
        },
        options: [
            { en: "Take it and say thank you.", mr: "ते स्वीकारून थँक्यू म्हणेन.", correct: false },
            { en: "Ignore them, run away to parents or teachers immediately.", mr: "त्यांच्याकडे दुर्लक्ष करून ताबडतोब आई-वडील किंवा शिक्षकांकडे पळून जाईन.", correct: true },
            { en: "Share the chocolates with your friends.", mr: "ते चॉकलेट्स माझ्या मित्रांसोबत शेअर करेन.", correct: false }
        ]
    },
    {
        q: {
            en: "What is a 'Bad Touch'?",
            mr: "'वाईट स्पर्श' म्हणजे काय?"
        },
        options: [
            { en: "A high-five from a school classmate.", mr: "शाळेतील मित्राने दिलेले हाय-फाय (टाळी).", correct: false },
            { en: "A touch that makes you feel scared, sad, uncomfortable, or told to keep it a secret.", mr: "असा स्पर्श ज्यामुळे तुम्हाला भीती वाटते, अस्वस्थ वाटते किंवा ते गुप्त ठेवण्यास सांगितले जाते.", correct: true },
            { en: "A reassuring pat on the back by parents or teachers.", mr: "पालकांनी किंवा शिक्षकांनी पाठीवर शाबासकी देणे.", correct: false }
        ]
    },
    {
        q: {
            en: "If someone is following you on your way home, what is the best safety action?",
            mr: "घरी जात असताना जर कोणी तुमचा पाठलाग करत असेल, तर सर्वोत्तम सुरक्षा कृती कोणती?"
        },
        options: [
            { en: "Go into a quiet dark alley to hide.", mr: "लपण्यासाठी शांत काळोख्या गल्लीत जाईन.", correct: false },
            { en: "Stop and shout at them aggressively.", mr: "थांबून त्यांच्यावर रागाने ओरडेन.", correct: false },
            { en: "Run to a crowded shop, public area, or look for a police officer/guard.", mr: "गर्दीच्या दुकानात, सार्वजनिक ठिकाणी पळेन किंवा पोलीस/सुरक्षा रक्षकाला शोधेन.", correct: true }
        ]
    }
];

// ============================================================
// INITIALIZATION
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
    // Render Lucide Icons
    lucide.createIcons();

    // Clock Tick
    setInterval(updateClock, 1000);
    updateClock();

    // Load Local Storage Data
    loadContacts();
    loadReportedIncidents();

    // Initialize Maps
    setTimeout(initMap, 500);

    // Initial Quiz Load
    loadQuizQuestion();

    // Set English language by default
    applyLanguage('en');
});

// Update Digital Clock & HUD Timestamps
function updateClock() {
    const timeEl = document.getElementById("lblClock");
    const hudTimeEl = document.getElementById("hudTimestamp");
    
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // 12hr format
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    if (timeEl) {
        timeEl.textContent = `${hours}:${minutes} ${ampm}`;
    }
    if (hudTimeEl) {
        hudTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

// ============================================================
// DUAL LANGUAGE TOGGLE
// ============================================================
function toggleLanguage() {
    currentLang = currentLang === 'en' ? 'mr' : 'en';
    applyLanguage(currentLang);
}

function applyLanguage(lang) {
    // Loop over translations and set texts
    Object.keys(translations).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // Check if it is input or button
            if (el.tagName === 'INPUT' && el.placeholder) {
                el.placeholder = translations[id][lang];
            } else if (el.tagName === 'OPTION') {
                el.text = translations[id][lang];
            } else {
                el.textContent = translations[id][lang];
            }
        }
    });

    // Handle button text differences manually if needed
    const langBtn = document.getElementById("langToggleBtn");
    if (langBtn) {
        langBtn.innerHTML = `🌐 <span>${lang === 'en' ? 'मराठी' : 'English'}</span>`;
    }

    // Refresh Threat level translation based on state
    const threatValEl = document.getElementById("valThreatLevel");
    if (threatValEl) {
        if (isSosActive) {
            threatValEl.textContent = lang === 'en' ? 'CRITICAL' : 'धोकादायक';
        } else {
            threatValEl.textContent = lang === 'en' ? 'LOW' : 'कमी';
        }
    }

    // Refresh safety status indicator
    const statusText = document.getElementById("statusText");
    if (statusText) {
        if (isSosActive) {
            statusText.textContent = lang === 'en' ? 'SOS Active' : 'मदत सुरू';
        } else {
            statusText.textContent = lang === 'en' ? 'Safe' : 'सुरक्षित';
        }
    }

    // Update dynamically rendered content if required
    renderContacts();
    loadQuizQuestion();
    renderSafeHubs();
    updateSosText();
}

function updateSosText() {
    const sosSub = document.getElementById("sosTextSub");
    const sosHint = document.getElementById("sosHint");
    if (sosSub) {
        sosSub.textContent = currentLang === 'en' ? 'HELP NEEDED' : 'मदत हवी आहे';
    }
    if (sosHint) {
        sosHint.textContent = isSosActive
            ? (currentLang === 'en' ? 'SOS Active! Audio/Video & Location Shared.' : 'SOS सक्रिय आहे! आवाज/व्हिडिओ आणि लोकेशन शेअर केले.')
            : (currentLang === 'en' ? 'Press SOS in case of emergency' : 'आणीबाणीच्या प्रसंगी SOS दाबा');
    }
}

// ============================================================
// TAB NAVIGATION SYSTEM
// ============================================================
function switchTab(tabId) {
    if (tabId === currentTab) return;

    // Remove active class from buttons
    document.querySelectorAll(".nav-tab-item").forEach(btn => btn.classList.remove("active"));
    
    // Add active class to clicked button
    const activeBtn = document.getElementById(`navBtn-${tabId}`);
    if (activeBtn) activeBtn.classList.add("active");

    // Hide active panel and show target
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
    const targetPanel = document.getElementById(`panel-${tabId}`);
    if (targetPanel) {
        targetPanel.classList.add("active");
    }

    // Handle camera stream stopping when leaving camera tab (unless SOS is active)
    if (currentTab === 'camera' && tabId !== 'camera' && !isSosActive) {
        stopCameraStream();
    }

    currentTab = tabId;
    
    // Auto center map on tab change to prevent rendering gray boxes
    if (tabId === 'map' && safetyMap) {
        setTimeout(() => {
            safetyMap.invalidateSize();
        }, 300);
    }
}

// ============================================================
// EMERGENCY SOS ENGINE
// ============================================================
function startSosSequence() {
    if (isSosActive) {
        // Double click/press SOS while active will stop it
        stopSosActiveState();
        return;
    }
    if (isSosCountdownRunning) return;

    // Start 3 Second Countdown
    isSosCountdownRunning = true;
    sosCountdownVal = 3;
    
    const ring = document.getElementById("countdownRing");
    const number = document.getElementById("countdownSec");
    
    ring.classList.add("show");
    number.textContent = sosCountdownVal;

    sosCountdownTimer = setInterval(() => {
        sosCountdownVal--;
        if (sosCountdownVal > 0) {
            number.textContent = sosCountdownVal;
        } else {
            clearInterval(sosCountdownTimer);
            ring.classList.remove("show");
            isSosCountdownRunning = false;
            triggerEmergencySOS();
        }
    }, 1000);
}

function cancelSosSequence() {
    if (sosCountdownTimer) {
        clearInterval(sosCountdownTimer);
    }
    const ring = document.getElementById("countdownRing");
    ring.classList.remove("show");
    isSosCountdownRunning = false;
    showToast(currentLang === 'en' ? "SOS Cancelled" : "SOS रद्द केला", "warn");
}

function triggerEmergencySOS() {
    isSosActive = true;
    
    // 1. Play siren alarm
    playSiren();
    
    // 2. Start Strobe screen flash
    document.getElementById("strobeOverlay").classList.add("active");
    document.getElementById("btnToolStrobe").classList.add("active");
    document.getElementById("btnToolSiren").classList.add("active");
    
    // 3. Switch header tag to Emergency
    const tag = document.getElementById("safetyStatusTag");
    tag.classList.add("emergency");
    const statusText = document.getElementById("statusText");
    statusText.textContent = currentLang === 'en' ? 'SOS Active' : 'मदत सुरू';

    const threatValEl = document.getElementById("valThreatLevel");
    threatValEl.textContent = currentLang === 'en' ? 'CRITICAL' : 'धोकादायक';
    threatValEl.style.color = 'var(--primary)';

    // 4. Force Switch Tab to Camera and start streaming / snapshots
    switchTab('camera');
    startCameraStream();
    
    // Start automated snap interval (every 5 seconds)
    autoSnapshotTimer = setInterval(() => {
        if (cameraStreamObj) {
            takeSnapshotManual();
            showToast(currentLang === 'en' ? "Simulating safe cloud image backup..." : "सेफ्टी क्लाउडवर फोटो सेव्ह होत आहे...", "success");
        }
    }, 5000);

    // 5. Simulate sending SMS alerts to Guard circle
    simulateEmergencyAlertSends();

    updateSosText();
}

function stopSosActiveState() {
    isSosActive = false;
    
    // Stop Siren
    stopSiren();
    
    // Stop Strobe Light
    document.getElementById("strobeOverlay").classList.remove("active");
    document.getElementById("btnToolStrobe").classList.remove("active");
    document.getElementById("btnToolSiren").classList.remove("active");

    // Reset status tag
    const tag = document.getElementById("safetyStatusTag");
    tag.classList.remove("emergency");
    const statusText = document.getElementById("statusText");
    statusText.textContent = currentLang === 'en' ? 'Safe' : 'सुरक्षित';

    const threatValEl = document.getElementById("valThreatLevel");
    threatValEl.textContent = currentLang === 'en' ? 'LOW' : 'कमी';
    threatValEl.style.color = 'var(--secondary)';

    // Stop auto-captures
    if (autoSnapshotTimer) {
        clearInterval(autoSnapshotTimer);
        autoSnapshotTimer = null;
    }
    stopCameraStream();
    switchTab('home');

    showToast(currentLang === 'en' ? "Emergency Mode Deactivated" : "आणीबाणी मोड बंद केला", "success");
    updateSosText();
}

// Synthesized audio wailing siren using Web Audio API
function toggleSirenAlarm() {
    if (isSirenPlaying) {
        stopSiren();
        document.getElementById("btnToolSiren").classList.remove("active");
        showToast(currentLang === 'en' ? "Siren Stopped" : "सायरन बंद केला", "warn");
    } else {
        playSiren();
        document.getElementById("btnToolSiren").classList.add("active");
        showToast(currentLang === 'en' ? "Siren Alert Active" : "सायरन सुरू केला", "success");
    }
}

function playSiren() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (isSirenPlaying) return;

        sirenGain = audioCtx.createGain();
        sirenOsc1 = audioCtx.createOscillator();
        sirenOsc2 = audioCtx.createOscillator();
        
        sirenOsc1.type = 'sawtooth';
        sirenOsc1.frequency.setValueAtTime(800, audioCtx.currentTime); // Base Frequency
        
        // Wail modulator oscillator
        sirenOsc2.type = 'sine';
        sirenOsc2.frequency.setValueAtTime(2, audioCtx.currentTime); // 2Hz wail speed
        
        let osc2Gain = audioCtx.createGain();
        osc2Gain.gain.setValueAtTime(300, audioCtx.currentTime); // modulation pitch bounds
        
        sirenOsc2.connect(osc2Gain);
        osc2Gain.connect(sirenOsc1.frequency);
        
        sirenOsc1.connect(sirenGain);
        sirenGain.connect(audioCtx.destination);
        
        sirenGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        
        sirenOsc1.start();
        sirenOsc2.start();
        isSirenPlaying = true;
    } catch (e) {
        console.error("Audio Context wailing failed: ", e);
    }
}

function stopSiren() {
    if (sirenOsc1) {
        try { sirenOsc1.stop(); } catch(e){}
        sirenOsc1.disconnect();
        sirenOsc1 = null;
    }
    if (sirenOsc2) {
        try { sirenOsc2.stop(); } catch(e){}
        sirenOsc2.disconnect();
        sirenOsc2 = null;
    }
    if (sirenGain) {
        sirenGain.disconnect();
        sirenGain = null;
    }
    isSirenPlaying = false;
}

// Toggle visual flash strobe light
function toggleStrobeFlash() {
    const strobe = document.getElementById("strobeOverlay");
    const btn = document.getElementById("btnToolStrobe");
    if (strobe.classList.contains("active")) {
        strobe.classList.remove("active");
        btn.classList.remove("active");
    } else {
        strobe.classList.add("active");
        btn.classList.add("active");
        showToast(currentLang === 'en' ? "Visual Flash Alert Triggered" : "फ्लॅश लाईट इमर्जन्सी सुरू", "success");
    }
}

// ============================================================
// LIVE LOCATION SHARE via WhatsApp
// ============================================================

function buildLocationMessage(contactName) {
    const lat = currentCoordinates[0];
    const lng = currentCoordinates[1];
    const mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (currentLang === 'mr') {
        return `🚨 *रक्षक - आणीबाणी अलर्ट!*\n\nनमस्कार ${contactName},\n\nहे संकटकालीन संदेश आहे! मुलाचे/मुलीचे *सध्याचे लाईव्ह स्थान* खालील लिंकवर पाहा:\n\n📍 *Google Maps लिंक:*\n${mapsLink}\n\n⏰ वेळ: ${time}\n\nकृपया ताबडतोब संपर्क करा किंवा पोलिसांना कळवा: *112*\n\n_Rakshak Safety App द्वारे पाठवले_`;
    } else {
        return `🚨 *RAKSHAK - EMERGENCY ALERT!*\n\nHello ${contactName},\n\nThis is an emergency message! View the *current live location* below:\n\n📍 *Google Maps Link:*\n${mapsLink}\n\n⏰ Time: ${time}\n\nPlease contact immediately or call Police: *112*\n\n_Sent via Rakshak Safety App_`;
    }
}

function shareLocationToAll() {
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
            currentLang === 'en' ? `Opening WhatsApp for ${guardianContacts.length} guardian(s)...` : `${guardianContacts.length} रक्षकांना WhatsApp उघडत आहे...`,
            "success"
        );
    }, () => {
        // fallback with existing coords
        guardianContacts.forEach((contact, idx) => {
            setTimeout(() => shareLocationToOne(contact), idx * 1200);
        });
    }, { enableHighAccuracy: true, timeout: 5000 });
}

function shareLocationToOne(contact) {
    const msg = buildLocationMessage(contact.name);
    const phone = contact.phone.replace(/\D/g, ''); // digits only
    const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
}

function renderIndividualShareButtons() {
    const container = document.getElementById('individualShareList');
    if (!container) return;
    container.innerHTML = '';

    if (guardianContacts.length === 0) {
        container.innerHTML = `<div style="font-size:11px; color:var(--text-muted); text-align:center; font-style:italic;">${currentLang === 'en' ? 'Add guardians in Circle tab to enable per-contact sharing.' : 'Circle टॅबमध्ये रक्षक जोडा.'}</div>`;
        return;
    }

    guardianContacts.forEach(contact => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.03); padding:10px 12px; border-radius:12px; border:1px solid rgba(255,255,255,0.05);';
        row.innerHTML = `
            <div>
                <div style="font-size:13px; font-weight:700;">${contact.name}</div>
                <div style="font-size:11px; color:var(--text-muted);">📞 +91 ${contact.phone}</div>
            </div>
            <button onclick="shareLocationToOne(${JSON.stringify(contact).replace(/"/g, '&quot;')})"
                style="background:linear-gradient(135deg,#25D366,#128C7E); color:white; border:none; padding:8px 12px; border-radius:10px; font-size:11px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:6px;">
                <span>📲</span> WhatsApp
            </button>
        `;
        container.appendChild(row);
    });
}

// Called after SOS triggers — sends location to all guardians automatically
function simulateEmergencyAlertSends() {
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
            currentLang === 'en' ? `🚨 Live location sent to ${guardianContacts.length} guardian(s) via WhatsApp!` : `🚨 ${guardianContacts.length} रक्षकांना WhatsApp वर Live Location पाठवले!`,
            "success"
        );
    }, () => {
        guardianContacts.forEach((contact, idx) => {
            setTimeout(() => shareLocationToOne(contact), 800 + idx * 1500);
        });
    }, { enableHighAccuracy: true, timeout: 5000 });
}

// ============================================================
// NEAREST POLICE STATION (Overpass API - Real OpenStreetMap Data)
// ============================================================

function findNearestPolice() {
    const infoDiv = document.getElementById('policeStationInfo');
    infoDiv.innerHTML = `
        <div class="police-loading-state">
            <i data-lucide="loader" style="animation: spin 1s linear infinite;"></i>
            <span>${currentLang === 'en' ? 'Finding nearest police station...' : 'जवळचे पोलीस स्टेशन शोधत आहे...'}</span>
        </div>`;
    lucide.createIcons();

    const fetchPolice = (lat, lng) => {
        // Overpass API query: find police stations within 5km radius
        const radius = 5000; // 5 km
        const query = `
            [out:json][timeout:10];
            (
              node["amenity"="police"](around:${radius},${lat},${lng});
              way["amenity"="police"](around:${radius},${lat},${lng});
            );
            out center 5;
        `;
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

        fetch(url)
            .then(r => r.json())
            .then(data => {
                if (data.elements && data.elements.length > 0) {
                    // Sort by distance (closest first)
                    const sorted = data.elements.map(el => {
                        const eLat = el.lat || el.center?.lat;
                        const eLng = el.lon || el.center?.lon;
                        const dist = getDistanceKm(lat, lng, eLat, eLng);
                        return { ...el, dist, eLat, eLng };
                    }).sort((a, b) => a.dist - b.dist);

                    renderPoliceStations(sorted.slice(0, 3)); // show top 3 nearest
                } else {
                    infoDiv.innerHTML = `
                        <div class="police-loading-state" style="color:var(--warning);">
                            <i data-lucide="alert-triangle"></i>
                            <span>${currentLang === 'en' ? 'No police station found within 5km. Call 112 directly.' : '५ किमी मध्ये पोलीस स्टेशन सापडले नाही. थेट 112 वर कॉल करा.'}</span>
                        </div>
                        <a href="tel:112" style="display:flex;align-items:center;justify-content:center;gap:8px;background:var(--primary-gradient);color:white;padding:12px;border-radius:12px;text-decoration:none;font-weight:700;margin-top:10px;">
                            📞 ${currentLang === 'en' ? 'Call Police 112' : 'पोलीस 112 ला कॉल करा'}
                        </a>`;
                    lucide.createIcons();
                }
            })
            .catch(() => {
                infoDiv.innerHTML = `
                    <div class="police-loading-state" style="color:var(--warning);">
                        <i data-lucide="wifi-off"></i>
                        <span>${currentLang === 'en' ? 'Could not connect. Check internet and retry.' : 'इंटरनेट कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.'}</span>
                    </div>
                    <a href="tel:112" style="display:flex;align-items:center;justify-content:center;gap:8px;background:var(--primary-gradient);color:white;padding:12px;border-radius:12px;text-decoration:none;font-weight:700;margin-top:10px;">
                        📞 ${currentLang === 'en' ? 'Call Police 112' : 'पोलीस 112 ला कॉल करा'}
                    </a>`;
                lucide.createIcons();
            });
    };

    // Get GPS then fetch
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            currentCoordinates = [pos.coords.latitude, pos.coords.longitude];
            fetchPolice(pos.coords.latitude, pos.coords.longitude);
        }, () => {
            fetchPolice(currentCoordinates[0], currentCoordinates[1]);
        }, { enableHighAccuracy: true, timeout: 8000 });
    } else {
        fetchPolice(currentCoordinates[0], currentCoordinates[1]);
    }
}

function renderPoliceStations(stations) {
    const infoDiv = document.getElementById('policeStationInfo');
    infoDiv.innerHTML = '';

    stations.forEach((st, idx) => {
        const name = st.tags?.name || st.tags?.['name:en'] || (currentLang === 'en' ? 'Police Station' : 'पोलीस स्टेशन');
        const phone = st.tags?.phone || st.tags?.contact?.phone || '';
        const dist = st.dist < 1 ? `${Math.round(st.dist * 1000)}m` : `${st.dist.toFixed(1)}km`;
        const mapsLink = `https://maps.google.com/?q=${st.eLat},${st.eLng}`;
        const isNearest = idx === 0;

        const card = document.createElement('div');
        card.className = 'police-station-result' + (isNearest ? ' nearest' : '');
        card.innerHTML = `
            <div class="police-result-header">
                <div>
                    ${isNearest ? `<span class="nearest-badge">${currentLang === 'en' ? '🏆 NEAREST' : '🏆 सर्वात जवळ'}</span>` : ''}
                    <div class="police-name">${name}</div>
                    <div class="police-dist">📍 ${currentLang === 'en' ? 'Distance' : 'अंतर'}: <strong>${dist}</strong></div>
                </div>
            </div>
            <div class="police-actions">
                ${phone ? `<a href="tel:${phone}" class="police-action-btn call-btn">📞 ${currentLang === 'en' ? 'Call Station' : 'स्टेशनला कॉल करा'}</a>` : ''}
                <a href="tel:112" class="police-action-btn call-btn emergency-call">📞 112</a>
                <a href="${mapsLink}" target="_blank" class="police-action-btn maps-btn">🗺️ ${currentLang === 'en' ? 'Open Map' : 'नकाशा उघडा'}</a>
            </div>
        `;
        infoDiv.appendChild(card);
    });

    lucide.createIcons();
    showToast(
        currentLang === 'en' ? `✅ Found ${stations.length} police station(s) nearby!` : `✅ ${stations.length} पोलीस स्टेशन जवळ सापडले!`,
        "success"
    );
}

// Haversine formula — distance between two GPS coords in km
function getDistanceKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ============================================================
// SCREAM DETECTOR MODULE
// ============================================================
async function toggleScreamDetector() {
    const checkbox = document.getElementById("screamDetectorToggle");
    if (checkbox.checked) {
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const context = new (window.AudioContext || window.webkitAudioContext)();
            analyser = context.createAnalyser();
            analyser.fftSize = 256;
            
            audioSource = context.createMediaStreamSource(micStream);
            audioSource.connect(analyser);
            
            document.getElementById("audioVisualBar").style.display = "block";
            isScreamDetectorActive = true;
            showToast(currentLang === 'en' ? "Scream detector listening..." : "किंचाळणे शोधक सक्रिय झाले...", "success");
            
            let dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            screamInterval = setInterval(() => {
                if (!isScreamDetectorActive) return;
                analyser.getByteFrequencyData(dataArray);
                
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                let avg = sum / dataArray.length;
                let volumePercent = Math.min((avg / 120) * 100, 100);
                document.getElementById("audioFillProgress").style.width = volumePercent + "%";
                
                // Average amplitude threshold of 82 acts as loud scream/siren
                if (avg > 82 && !isSosActive && !isSosCountdownRunning) {
                    showToast(currentLang === 'en' ? "Loud noise/Scream detected!" : "मोठा आवाज / किंचाळणे आढळले!", "warn");
                    startSosSequence();
                }
            }, 100);
            
        } catch (e) {
            console.error("Mic access for scream check failed: ", e);
            checkbox.checked = false;
            showToast(currentLang === 'en' ? "Microphone access denied" : "मायक्रोफोन परवाना नाकारला", "warn");
        }
    } else {
        stopScreamDetector();
    }
}

function stopScreamDetector() {
    isScreamDetectorActive = false;
    if (screamInterval) {
        clearInterval(screamInterval);
        screamInterval = null;
    }
    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        micStream = null;
    }
    document.getElementById("audioVisualBar").style.display = "none";
    showToast(currentLang === 'en' ? "Scream detector stopped" : "किंचाळणे शोधक बंद केला", "warn");
}

// Trigger SOS if scream detected
function triggerScreamAlarm() {
    startSosSequence();
}

// ============================================================
// CAMERA & PHOTO LEDGER MODULE
// ============================================================
async function startCameraStream() {
    const video = document.getElementById("cameraStream");
    const placeholder = document.getElementById("cameraPlaceholder");
    const scanline = document.getElementById("cameraScanline");
    const hud = document.getElementById("cameraHUD");
    
    try {
        if (cameraStreamObj) {
            stopCameraStream();
        }
        
        let constraints = {
            video: { facingMode: activeFacingMode },
            audio: false
        };
        
        cameraStreamObj = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = cameraStreamObj;
        
        placeholder.style.display = "none";
        scanline.classList.add("active");
        hud.classList.add("active");
        
        document.getElementById("btnStartCamera").style.display = "none";
        document.getElementById("btnStopCamera").style.display = "block";
    } catch (e) {
        console.error("Failed to run camera feed: ", e);
        showToast(currentLang === 'en' ? "Camera stream failed. Check permission." : "कॅमेरा सुरू करता आला नाही. परवानगी तपासा.", "warn");
    }
}

function stopCameraStream() {
    const video = document.getElementById("cameraStream");
    const placeholder = document.getElementById("cameraPlaceholder");
    const scanline = document.getElementById("cameraScanline");
    const hud = document.getElementById("cameraHUD");
    
    if (cameraStreamObj) {
        cameraStreamObj.getTracks().forEach(track => track.stop());
        cameraStreamObj = null;
    }
    video.srcObject = null;
    placeholder.style.display = "flex";
    scanline.classList.remove("active");
    hud.classList.remove("active");
    
    document.getElementById("btnStartCamera").style.display = "block";
    document.getElementById("btnStopCamera").style.display = "none";
}

function switchCamera() {
    activeFacingMode = activeFacingMode === "user" ? "environment" : "user";
    if (cameraStreamObj) {
        startCameraStream();
    } else {
        showToast(currentLang === 'en' ? `Switched to ${activeFacingMode} camera` : `${activeFacingMode === 'user' ? 'समोरचा' : 'मागचा'} कॅमेरा निवडला`, "success");
    }
}

function takeSnapshotManual() {
    const video = document.getElementById("cameraStream");
    if (!cameraStreamObj) {
        showToast(currentLang === 'en' ? "Start camera stream first!" : "आधी कॅमेरा रेकॉर्डिंग सुरू करा!", "warn");
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 360;
    
    const ctx = canvas.getContext("2d");
    // Draw current video frame onto temporary canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imgData = canvas.toDataURL("image/jpeg", 0.7);
    
    // Add to photo ledger
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    photoLedger.unshift({
        src: imgData,
        time: timeStr
    });
    
    // Keep max 8 photos to prevent storage overflow
    if (photoLedger.length > 8) {
        photoLedger.pop();
    }
    
    renderSnapshots();
    showToast(currentLang === 'en' ? "Snapshot added to safety ledger" : "फोटो सुरक्षित गॅलरीमध्ये सेव्ह केला", "success");
}

function renderSnapshots() {
    const grid = document.getElementById("snapshotsGrid");
    grid.innerHTML = "";
    
    if (photoLedger.length === 0) {
        grid.innerHTML = `<div style="grid-column: span 4; font-size:11px; text-align:center; color:var(--text-muted); font-style:italic;">No snaps captured yet</div>`;
        return;
    }
    
    photoLedger.forEach(pic => {
        const item = document.createElement("div");
        item.className = "snapshot-item";
        item.onclick = () => viewPhotoModal(pic.src);
        
        item.innerHTML = `
            <img src="${pic.src}" alt="Safety Snap">
            <span class="snapshot-time">${pic.time}</span>
        `;
        grid.appendChild(item);
    });
}

function viewPhotoModal(imgSrc) {
    // Open a simple window/modal preview
    const previewWin = window.open();
    if(previewWin) {
        previewWin.document.write(`<img src="${imgSrc}" style="width:100%; max-width:600px; display:block; margin:20px auto; border-radius:12px; box-shadow:0 8px 30px rgba(0,0,0,0.5)">`);
        previewWin.document.title = "Rakshak Surveillance Snap";
    }
}

// ============================================================
// INTERACTIVE LEAFLET SAFETY MAP TRACKER
// ============================================================
function initMap() {
    try {
        safetyMap = L.map('safetyMap', {
            zoomControl: false,
            attributionControl: false
        }).setView(currentCoordinates, 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(safetyMap);

        // Add user location marker
        const userIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: var(--info); width: 14px; height: 14px; border: 2px solid white; border-radius: 50%; box-shadow: 0 0 10px var(--info);"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });
        
        userMarker = L.marker(currentCoordinates, { icon: userIcon }).addTo(safetyMap);
        userMarker.bindPopup(currentLang === 'en' ? "<b>You are here</b>" : "<b>तुम्ही येथे आहात</b>").openPopup();

        // Load incidents markers
        plotReportedIncidentMarkers();
        
        // Plot local safe hubs
        plotSafeHubsMarkers();
        renderSafeHubs();

    } catch (e) {
        console.error("Leaflet map initialization failed: ", e);
    }
}

function findCurrentLocation() {
    if (!navigator.geolocation) {
        showToast(currentLang === 'en' ? "Geolocation not supported" : "स्थान परवाना उपलब्ध नाही", "warn");
        return;
    }
    
    showToast(currentLang === 'en' ? "Locating device..." : "स्थान शोधत आहे...", "success");
    
    navigator.geolocation.getCurrentPosition(position => {
        currentCoordinates = [position.coords.latitude, position.coords.longitude];
        
        if (safetyMap) {
            safetyMap.setView(currentCoordinates, 15);
            if (userMarker) {
                userMarker.setLatLng(currentCoordinates);
                userMarker.bindPopup(currentLang === 'en' ? "<b>Accurate Location Found</b>" : "<b>अचूक स्थान सापडले</b>").openPopup();
            }
            
            // Replot hubs around new position
            plotSafeHubsMarkers();
            renderSafeHubs();
        }
        
        showToast(currentLang === 'en' ? "Location Synchronized" : "स्थान अचूकपणे जोडले गेले", "success");
    }, err => {
        console.error(err);
        showToast(currentLang === 'en' ? "Unable to retrieve GPS. Using fallback coordinates." : "जीपीएस सिग्नल मिळाला नाही. पर्यायी स्थान वापरले.", "warn");
    }, { enableHighAccuracy: true, timeout: 5000 });
}

// Plot Mock Safe Hubs based on user coords
function plotSafeHubsMarkers() {
    // Clear old hubs
    mapSafeHubMarkers.forEach(m => safetyMap.removeLayer(m));
    mapSafeHubMarkers = [];

    const lat = currentCoordinates[0];
    const lng = currentCoordinates[1];

    const hubs = [
        { name: { en: "City Central Police Station", mr: "शहर मध्यवर्ती पोलीस स्टेशन" }, type: "police", offset: [0.004, 0.005], phone: "112" },
        { name: { en: "Apex General Hospital", mr: "अपेक्स सामान्य रुग्णालय" }, type: "hospital", offset: [-0.005, 0.003], phone: "102" },
        { name: { en: "St. Mary School Safe Zone", mr: "सेंट मेरी स्कूल सुरक्षित क्षेत्र" }, type: "school", offset: [0.001, -0.006], phone: "1098" }
    ];

    hubs.forEach(h => {
        const hubCoords = [lat + h.offset[0], lng + h.offset[1]];
        let color = "var(--secondary)";
        let iconChar = "🛡️";
        if (h.type === 'hospital') { color = "var(--info)"; iconChar = "🏥"; }
        if (h.type === 'school') { color = "var(--accent)"; iconChar = "🏫"; }

        const icon = L.divIcon({
            className: 'hub-icon',
            html: `<div style="background-color: ${color}; color: white; display: flex; align-items:center; justify-content:center; width: 24px; height: 24px; border: 1.5px solid white; border-radius: 50%; font-size:12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">${iconChar}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const marker = L.marker(hubCoords, { icon: icon }).addTo(safetyMap);
        const nameVal = h.name[currentLang];
        marker.bindPopup(`<b>${nameVal}</b><br><span style="font-size:10px;">${currentLang === 'en' ? 'Helpline' : 'मदत क्रमांक'}: ${h.phone}</span>`);
        mapSafeHubMarkers.push(marker);
    });
}

function renderSafeHubs() {
    const list = document.getElementById("safeHubsList");
    if (!list) return;
    list.innerHTML = "";

    const lat = currentCoordinates[0];
    const lng = currentCoordinates[1];

    const hubs = [
        { name: { en: "City Central Police Station", mr: "शहर मध्यवर्ती पोलीस स्टेशन" }, type: { en: "Police Station", mr: "पोलीस ठाणे" }, offset: [0.004, 0.005], phone: "112" },
        { name: { en: "Apex General Hospital", mr: "अपेक्स सामान्य रुग्णालय" }, type: { en: "Hospital Desk", mr: "रुग्णालय डेस्क" }, offset: [-0.005, 0.003], phone: "102" }
    ];

    hubs.forEach(h => {
        const item = document.createElement("div");
        item.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);";
        
        let typeIcon = h.type === 'police' ? "🛡️" : "🏥";
        
        item.innerHTML = `
            <div>
                <span style="font-weight:700; color:var(--text-primary);">${h.name[currentLang]}</span><br>
                <span style="font-size:10px; color:var(--text-muted);">${h.type[currentLang]} • Near school/highway</span>
            </div>
            <a href="tel:${h.phone}" onclick="simulateDial('${h.phone}', event)" style="background:var(--secondary); color:white; border:none; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; text-decoration:none; font-size:12px;">📞</a>
        `;
        list.appendChild(item);
    });
}

// Report Unsafe Incidents on Maps
function openReportIncidentSheet() {
    document.getElementById("reportIncidentOverlay").classList.add("active");
}

function closeIncidentModal() {
    document.getElementById("reportIncidentOverlay").classList.remove("active");
}

function submitDangerIncident() {
    const typeSelect = document.getElementById("inputIncidentTitle");
    const descInput = document.getElementById("inputIncidentDesc");
    
    const type = typeSelect.value;
    const desc = descInput.value.trim();
    
    // Create random offset coordinate slightly off current location so it plots near user
    const randomOffsetLat = (Math.random() - 0.5) * 0.008;
    const randomOffsetLng = (Math.random() - 0.5) * 0.008;
    
    const newIncident = {
        id: Date.now(),
        type: type,
        desc: desc || (currentLang === 'en' ? "Reported hazard area" : "असुरक्षित क्षेत्र नोंदवले गेले"),
        lat: currentCoordinates[0] + randomOffsetLat,
        lng: currentCoordinates[1] + randomOffsetLng
    };

    reportedIncidents.push(newIncident);
    localStorage.setItem("rakshak_incidents", JSON.stringify(reportedIncidents));

    // Plot immediately on map
    plotSingleIncidentMarker(newIncident);

    closeIncidentModal();
    descInput.value = ""; // clear
    showToast(currentLang === 'en' ? "Incident alert registered on safety map!" : "इशारा नकाशावर नोंदवला गेला आहे!", "success");
}

function loadReportedIncidents() {
    const local = localStorage.getItem("rakshak_incidents");
    if (local) {
        reportedIncidents = JSON.parse(local);
    }
}

function plotReportedIncidentMarkers() {
    reportedIncidents.forEach(inc => {
        plotSingleIncidentMarker(inc);
    });
}

function plotSingleIncidentMarker(inc) {
    if (!safetyMap) return;

    // Glowing red alarm spot
    const dangerSpot = L.circle([inc.lat, inc.lng], {
        color: 'var(--primary)',
        fillColor: 'var(--primary)',
        fillOpacity: 0.35,
        radius: 120
    }).addTo(safetyMap);

    dangerSpot.bindPopup(`
        <strong style="color:var(--primary); font-family:var(--font-outfit);">${inc.type}</strong><br>
        <span style="font-size:11px;">${inc.desc}</span>
    `);
}

// ============================================================
// FAKE CALL ESCAPER SYSTEM
// ============================================================
function openFakeCallConfig() {
    document.getElementById("fakeCallConfigOverlay").classList.add("active");
}

function closeFakeCallModal() {
    document.getElementById("fakeCallConfigOverlay").classList.remove("active");
}

function scheduleFakeCallAction() {
    const nameInput = document.getElementById("inputFakeCaller");
    const delaySelect = document.getElementById("inputFakeDelay");
    
    const callerName = nameInput.value.trim() || (currentLang === 'en' ? "Papa" : "बाबा");
    const seconds = parseInt(delaySelect.value);
    
    closeFakeCallModal();
    
    showToast(currentLang === 'en' ? `Call scheduled in ${seconds}s` : `कॉल ${seconds} सेकंदात येईल`, "success");
    
    if (fakeCallTimer) clearTimeout(fakeCallTimer);
    
    fakeCallTimer = setTimeout(() => {
        triggerFakeIncomingCall(callerName);
    }, seconds * 1000);
}

function triggerFakeIncomingCall(name) {
    fakeCallActive = true;
    
    const overlay = document.getElementById("fakeIncomingCallOverlay");
    const nameEl = document.getElementById("fakeCallerName");
    const statusEl = document.getElementById("fakeCallStatus");
    const avatar = document.getElementById("fakeCallAvatar");

    overlay.classList.remove("in-call");
    overlay.classList.add("active");
    
    nameEl.textContent = name;
    statusEl.textContent = currentLang === 'en' ? "Incoming Safety Call..." : "इनकमिंग कॉल...";
    avatar.classList.add("ringing");

    // Ringtone simulation using synthetic osc wails
    playRingtoneBeeps();
}

function playRingtoneBeeps() {
    if (callRingtoneInterval) clearInterval(callRingtoneInterval);
    
    const speakRingtone = () => {
        if (!fakeCallActive) return;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = "sine";
            // Realistic telephone ring pitch doublets: 440Hz and 480Hz combined
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.45);
            
            setTimeout(() => {
                const osc2 = ctx.createOscillator();
                osc2.type = "sine";
                osc2.frequency.setValueAtTime(440, ctx.currentTime);
                osc2.connect(gain);
                osc2.start();
                osc2.stop(ctx.currentTime + 0.45);
            }, 550);
            
        } catch(e){}
    };
    
    speakRingtone();
    callRingtoneInterval = setInterval(speakRingtone, 3000);
}

function acceptFakeCall() {
    clearInterval(callRingtoneInterval);
    
    const overlay = document.getElementById("fakeIncomingCallOverlay");
    const statusEl = document.getElementById("fakeCallStatus");
    const avatar = document.getElementById("fakeCallAvatar");
    
    overlay.classList.add("in-call");
    avatar.classList.remove("ringing");
    
    statusEl.textContent = "00:00";
    activeCallSeconds = 0;
    
    activeCallTimer = setInterval(() => {
        activeCallSeconds++;
        let mm = Math.floor(activeCallSeconds / 60);
        let ss = activeCallSeconds % 60;
        mm = mm < 10 ? '0' + mm : mm;
        ss = ss < 10 ? '0' + ss : ss;
        statusEl.textContent = `${mm}:${ss}`;
    }, 1000);

    // Speak synthetic voice response using Web Speech Synthesis API
    speakSyntheticCallVoice();
}

function speakSyntheticCallVoice() {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any ongoing speeches
    window.speechSynthesis.cancel();
    
    let text = "";
    let speechLang = "en-US";
    
    if (currentLang === 'en') {
        text = "Hello! I am nearby. I will reach you in two minutes. Stay on the line. Are you safe? Speak loudly!";
        speechLang = "en-US";
    } else {
        text = "हॅलो! मी जवळच आलो आहे. मी दोन मिनिटांत पोहोचतोय. फोन चालू ठेव. तू ठीक आहेस ना? मोठ्याने बोल!";
        speechLang = "hi-IN"; // Hindi voice matches Marathi text phonetics beautifully on Android/Windows TTS
    }
    
    callerSpeech = new SpeechSynthesisUtterance(text);
    callerSpeech.lang = speechLang;
    callerSpeech.rate = 0.95; // slightly slower for clarity
    
    window.speechSynthesis.speak(callerSpeech);
}

function declineFakeCall() {
    fakeCallActive = false;
    clearInterval(callRingtoneInterval);
    clearInterval(activeCallTimer);
    
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    
    const overlay = document.getElementById("fakeIncomingCallOverlay");
    overlay.classList.remove("active");
    
    showToast(currentLang === 'en' ? "Call Terminated" : "कॉल समाप्त केला", "warn");
}

// ============================================================
// ACADEMY MODULE (QUIZ & TIPS)
// ============================================================
function switchAcademyMode(mode) {
    const btnKids = document.getElementById("btnAcademyKids");
    const btnAdults = document.getElementById("btnAcademyAdults");
    
    const contentKids = document.getElementById("academy-kids");
    const contentAdults = document.getElementById("academy-adults");
    
    btnKids.classList.remove("active", "kids-mode");
    btnAdults.classList.remove("active", "adults-mode");
    
    contentKids.classList.remove("active");
    contentAdults.classList.remove("active");
    
    if (mode === 'kids') {
        btnKids.classList.add("active", "kids-mode");
        contentKids.classList.add("active");
    } else {
        btnAdults.classList.add("active", "adults-mode");
        contentAdults.classList.add("active");
    }
}

function loadQuizQuestion() {
    const questEl = document.getElementById("quizQuestion");
    const optionsBox = document.getElementById("quizOptions");
    const badgeBox = document.getElementById("certificateBadgeBox");
    
    if (!questEl || !optionsBox) return;

    if (currentQuestionIndex >= quizQuestions.length) {
        // Quiz completed
        questEl.style.display = "none";
        optionsBox.innerHTML = "";
        badgeBox.style.display = "block";
        return;
    }
    
    questEl.style.display = "block";
    badgeBox.style.display = "none";
    
    const data = quizQuestions[currentQuestionIndex];
    questEl.textContent = `${currentQuestionIndex + 1}. ${data.q[currentLang]}`;
    
    optionsBox.innerHTML = "";
    
    data.options.forEach((opt, idx) => {
        const btn = document.createElement("button");
        btn.className = "quiz-option-btn";
        btn.textContent = opt[currentLang];
        btn.onclick = () => verifyQuizAnswer(idx, btn);
        optionsBox.appendChild(btn);
    });
}

function verifyQuizAnswer(idx, btnEl) {
    const data = quizQuestions[currentQuestionIndex];
    const optionsBox = document.getElementById("quizOptions");
    
    // Disable all options
    Array.from(optionsBox.children).forEach(btn => {
        btn.disabled = true;
    });
    
    const correctIdx = data.options.findIndex(o => o.correct);
    
    if (idx === correctIdx) {
        btnEl.classList.add("correct");
        quizScore++;
        showToast(currentLang === 'en' ? "Excellent! Correct." : "खूप छान! बरोबर उत्तर.", "success");
    } else {
        btnEl.classList.add("incorrect");
        // Highlight correct option
        optionsBox.children[correctIdx].classList.add("correct");
        showToast(currentLang === 'en' ? "Oops! Incorrect." : "चूक! योग्य उत्तर दाखवले आहे.", "warn");
    }
    
    // Proceed to next question after delay
    setTimeout(() => {
        currentQuestionIndex++;
        loadQuizQuestion();
    }, 2500);
}

// Reset quiz function (invoked automatically if finished & clicked)
function resetSafetyQuiz() {
    currentQuestionIndex = 0;
    quizScore = 0;
    loadQuizQuestion();
}

// ============================================================
// TRUSTED CONTACTS (GUARD CIRCLE)
// ============================================================
function openAddContactSheet() {
    document.getElementById("addContactOverlay").classList.add("active");
}

function closeContactModal() {
    document.getElementById("addContactOverlay").classList.remove("active");
}

function loadContacts() {
    const local = localStorage.getItem("rakshak_contacts");
    if (local) {
        guardianContacts = JSON.parse(local);
    } else {
        // Preset mock guardian
        guardianContacts = [
            { name: "Papa (बाबा)", phone: "9876543210", relation: "Father" }
        ];
        localStorage.setItem("rakshak_contacts", JSON.stringify(guardianContacts));
    }
}

function renderContacts() {
    const list = document.getElementById("contactsListContainer");
    if (!list) return;
    list.innerHTML = "";
    
    if (guardianContacts.length === 0) {
        list.innerHTML = `
            <div class="empty-contacts-view">
                ${currentLang === 'en' ? 'Circle of trust is empty. Add a contact now.' : 'रक्षक गट रिकामा आहे. त्वरित संपर्क जोडा.'}
            </div>
        `;
        return;
    }
    
    guardianContacts.forEach((contact, idx) => {
        const row = document.createElement("div");
        row.className = "contact-item-row";
        
        row.innerHTML = `
            <div class="contact-info-col">
                <span class="contact-name-txt">${contact.name}</span>
                <span class="contact-phone-txt">📞 ${contact.phone}</span>
                <span class="contact-relation-badge">${contact.relation}</span>
            </div>
            <div class="contact-actions">
                <button class="contact-action-btn" onclick="deleteContact(${idx})" title="Remove Guardian">✕</button>
            </div>
        `;
        list.appendChild(row);
    });
}

function saveNewContact() {
    const nameVal = document.getElementById("inputContactName").value.trim();
    const phoneVal = document.getElementById("inputContactPhone").value.trim();
    const relationVal = document.getElementById("inputContactRelation").value.trim();
    
    if (!nameVal || !phoneVal) {
        showToast(currentLang === 'en' ? "Please fill Name & Phone!" : "कृपया नाव आणि फोन नंबर टाका!", "warn");
        return;
    }
    
    const newContact = {
        name: nameVal,
        phone: phoneVal,
        relation: relationVal || (currentLang === 'en' ? "Guardian" : "रक्षक")
    };
    
    guardianContacts.push(newContact);
    localStorage.setItem("rakshak_contacts", JSON.stringify(guardianContacts));
    
    renderContacts();
    closeContactModal();
    
    // Reset values
    document.getElementById("inputContactName").value = "";
    document.getElementById("inputContactPhone").value = "";
    document.getElementById("inputContactRelation").value = "";
    
    showToast(currentLang === 'en' ? "Guardian added successfully!" : "रक्षक यशस्वीरित्या जोडला गेला!", "success");
}

function deleteContact(idx) {
    guardianContacts.splice(idx, 1);
    localStorage.setItem("rakshak_contacts", JSON.stringify(guardianContacts));
    renderContacts();
    showToast(currentLang === 'en' ? "Guardian removed" : "रक्षक संपर्क काढला", "warn");
}

// ============================================================
// HELPER UTILITIES
// ============================================================
function showToast(msg, status = "info") {
    const toast = document.getElementById("toastNotification");
    const txt = document.getElementById("toastMessage");
    
    txt.textContent = msg;
    toast.className = "toast-overlay show " + status;
    
    // Select toast icon based on status
    const icon = toast.querySelector("i");
    if (icon) {
        if (status === 'success') icon.setAttribute("data-lucide", "check-circle");
        else if (status === 'warn') icon.setAttribute("data-lucide", "alert-circle");
        else icon.setAttribute("data-lucide", "info");
        lucide.createIcons();
    }
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function simulateDial(num, e) {
    e.preventDefault();
    alert(currentLang === 'en' 
        ? `📲 Simulated Dial: Calling ${num} helpline...`
        : `📲 सिम्युलेटेड डायल: ${num} हेल्पलाईनशी संपर्क साधत आहे...`
    );
}

// Close bottom sheets when tapping empty dark space
function closeModalOnOuterClick(e, modalId) {
    if (e.target.id === modalId) {
        document.getElementById(modalId).classList.remove("active");
        
        // Stop cameras if closed camera config
        if (modalId === 'addContactOverlay') {
            document.getElementById("inputContactName").value = "";
            document.getElementById("inputContactPhone").value = "";
            document.getElementById("inputContactRelation").value = "";
        }
    }
}
