const https = require('https');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const slides = [
    {
        image: 'hero_child.png',
        text: 'नमस्कार! रक्षक ॲपमध्ये आपले स्वागत आहे. हे ॲप तुमच्या मुलांच्या आणि कुटुंबाच्या सुरक्षेसाठी खास बनवले आहे.'
    },
    {
        image: 'child_safety_poster.png',
        text: 'या ॲपचा मुख्य उपयोग म्हणजे, लहान मुलांना व्हिडिओद्वारे गुड टच आणि बॅड टच बद्दल माहिती देणे व जागृत करणे.'
    },
    {
        image: 'good_touch.png',
        text: 'गुड टच म्हणजे काय आणि सुरक्षित स्पर्श कोणता असतो, हे मुलांना सोप्या भाषेत समजून सांगता येते.'
    },
    {
        image: 'bad_touch.png',
        text: 'तसेच बॅड टच बद्दल सावधानता कशी बाळगावी, आणि धोक्याच्या वेळी लगेच मदत कशी मागावी हे शिकवते.'
    },
    {
        image: 'safe_parents.png',
        text: 'याचा सर्वात मोठा फायदा म्हणजे, पालक आपल्या मुलांचे लाईव्ह लोकेशन आणि कॅमेरा त्यांच्या फोनवर पाहू शकतात. रक्षक ॲप वापरा आणि सुरक्षित राहा!'
    }
];

async function downloadTTS(text, filename) {
    const url = 'https://translate.googleapis.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(text) + '&tl=mr&client=tw-ob';
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const file = fs.createWriteStream(filename);
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        }).on('error', reject);
    });
}

async function main() {
    let listContent = '';
    const tempFiles = [];

    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const audioFile = `temp_audio_${i}.mp3`;
        const videoFile = `temp_video_${i}.mp4`;
        tempFiles.push(audioFile, videoFile);

        console.log(`Downloading audio for slide ${i + 1}...`);
        await downloadTTS(slide.text, audioFile);

        console.log(`Creating video segment ${i + 1}...`);
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
            // try to output error logs
            console.error(res.stderr ? res.stderr.toString() : 'Unknown error');
            process.exit(1);
        }

        listContent += `file '${videoFile}'\n`;
    }

    fs.writeFileSync('list.txt', listContent);
    tempFiles.push('list.txt');

    console.log('Concatenating all segments into rakshak_explainer.mp4...');
    const outPath = path.join('www', 'rakshak_explainer.mp4');
    const concatArgs = [
        '-f', 'concat',
        '-safe', '0',
        '-i', 'list.txt',
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
