const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

// Using chunked sentences to safely handle TTS limits and create long detailed narration.
const slides = [
    {
        image: 'hero_child.png',
        chunks: [
            'नमस्कार! रक्षक ॲप या आपल्या सर्वांच्या आवडत्या सुरक्षा प्लॅटफॉर्मवर आपले स्वागत आहे.',
            'पालकांचे आणि मुलांचे नाते अधिक सुरक्षित करण्यासाठी हे ॲप खास डिझाइन केले आहे.',
            'आजकालच्या सतत बदलणाऱ्या वातावरणात मुलांवर लक्ष ठेवणे हे अत्यंत गरजेचे झाले आहे.',
            'रक्षक ॲपच्या मदतीने तुम्ही तुमची ही जबाबदारी अतिशय सोप्या पद्धतीने आणि घरबसल्या पार पाडू शकता.'
        ]
    },
    {
        image: 'child_safety_poster.png',
        chunks: [
            'या ॲपचा मुख्य उद्देश केवळ ट्रॅकिंगपुरता मर्यादित नसून, मुलांमध्ये सुरक्षेबद्दल प्रत्यक्ष जागरूकता निर्माण करणे हा आहे.',
            'लहान मुलांना सुरक्षिततेचे महत्त्व व्हिडिओ आणि ॲनिमेशनद्वारे समजून सांगता येते, ज्यामुळे त्यांना कंटाळा न येता महत्त्वाची माहिती मिळते.',
            'यामुळे मुले स्वतःहून सजग होतात आणि कोणत्याही आणीबाणीच्या वेळी घाबरून न जाता योग्य निर्णय घेऊ शकतात.'
        ]
    },
    {
        image: 'good_touch.png',
        chunks: [
            'मुलांच्या सुरक्षिततेची पहिली पायरी म्हणजे त्यांना गुड टच म्हणजे काय हे समजून सांगणे.',
            'गुड टच म्हणजे असा स्पर्श ज्यामुळे मुलाला सुरक्षित, आरामदायक आणि आनंदी वाटते.',
            'उदाहरणार्थ, आई-बाबांची मिठी, शिक्षकांचे शाबासकी देणे, किंवा मित्रांसोबत हाय-फाय देणे!',
            'मुलांना याचा सकारात्मक अर्थ सांगून आपण त्यांच्या सुरक्षिततेचा पाया भक्कम करू शकतो.'
        ]
    },
    {
        image: 'bad_touch.png',
        chunks: [
            'त्याचप्रमाणे बॅड टच बद्दल स्पष्ट आणि सविस्तर माहिती समजावणे ही आपली मोठी जबाबदारी आहे.',
            'जर कुणाच्या स्पर्शाने मुलाला भीती वाटली, अस्वस्थ वाटले किंवा कोणी त्यांना गुपित ठेवायला सांगितले तर तो चुकीचा किंवा बॅड टच असू शकतो.',
            'अशा वेळी घाबरून न जाता मोठ्याने नाही म्हणायला आणि लगेच आई-बाबा किंवा शिक्षकांना सांगायला आपण शिकवतो.'
        ]
    },
    {
        image: 'safe_parents.png',
        chunks: [
            'यासोबतच, रक्षक ॲप पालकांना भक्कम नियंत्रण देते. पालक एका क्लिकवर मुलांच्या फोनचा कॅमेरा चालू करून लाईव्ह व्हिडिओ बघू शकतात.',
            'त्यांचा ऑडिओ ऐकू शकतात आणि अचूक लाईव्ह लोकेशन ट्रॅक करू शकतात.',
            'याशिवाय, धोका वाटल्यास अलर्ट द्वारे सर्व जवळच्या नातेवाईकांना आपत्कालीन संदेश जातो.',
            'सुरक्षा आणि विश्वासाचे हे अद्वितीय साधन म्हणजे आपले रक्षक ॲप! आजच त्याचा वापर सुरू करा आणि चिंतामुक्त व्हा!'
        ]
    }
];

function downloadTTSChunk(text) {
    const url = 'https://translate.googleapis.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(text) + '&tl=mr&client=tw-ob';
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const chunks = [];
            res.on('data', c => chunks.push(c));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

async function downloadSlideAudio(chunks, filename) {
    const file = fs.createWriteStream(filename);
    for (let c of chunks) {
        const buffer = await downloadTTSChunk(c);
        file.write(buffer);
    }
    file.end();
    return new Promise(resolve => file.on('finish', resolve));
}

async function main() {
    let listContent = '';
    const tempFiles = [];

    console.log('Building Extended Explainer Audio & Video...');

    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const audioFile = `temp_audio_detailed_${i}.mp3`;
        const videoFile = `temp_video_detailed_${i}.mp4`;
        tempFiles.push(audioFile, videoFile);

        console.log(`\n--- Slide ${i + 1} ---`);
        console.log(`Generating detailed chunked audio...`);
        await downloadSlideAudio(slide.chunks, audioFile);

        console.log(`Generating extended video segment...`);
        const scaleFilter = 'scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2:black,setsar=1';

        const args = [
            '-loop', '1',
            '-i', slide.image,
            '-i', audioFile,
            '-vf', scaleFilter,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-tune', 'stillimage',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-pix_fmt', 'yuv420p',
            '-r', '25',
            '-shortest',
            '-y',
            videoFile
        ];

        const res = spawnSync(ffmpegPath, args);
        if (res.status !== 0) {
            console.error('FFmpeg error on slide ' + (i + 1));
            console.error(res.stderr ? res.stderr.toString() : 'Unknown error');
            process.exit(1);
        }

        listContent += `file '${videoFile}'\n`;
    }

    fs.writeFileSync('list_detailed.txt', listContent);
    tempFiles.push('list_detailed.txt');

    console.log('\n🎬 Concatenating all extended segments into rakshak_explainer_detailed.mp4...');
    const outPath = path.join('www', 'rakshak_explainer_detailed.mp4');
    const concatArgs = [
        '-f', 'concat',
        '-safe', '0',
        '-i', 'list_detailed.txt',
        '-c', 'copy',
        '-y',
        outPath
    ];

    const concatRes = spawnSync(ffmpegPath, concatArgs);
    if (concatRes.status !== 0) {
        console.error('FFmpeg concat error');
        console.error(concatRes.stderr ? concatRes.stderr.toString() : '');
        process.exit(1);
    }

    // Cleanup
    tempFiles.forEach(f => {
        if (fs.existsSync(f)) fs.unlinkSync(f);
    });

    console.log('✅ Generated ' + outPath + ' successfully!');
}

main().catch(console.error);
