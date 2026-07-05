const https = require('https');
const fs = require('fs');
const url = 'https://translate.googleapis.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent('नमस्कार') + '&tl=mr&client=tw-ob';
https.get(url, (res) => {
    res.pipe(fs.createWriteStream('test_audio.mp3'));
    res.on('end', () => console.log('Audio saved'));
});
