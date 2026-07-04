const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ffmpegPath = require('ffmpeg-static');
const baseDir = 'C:\\Users\\Akash Misal\\Desktop\\RakshakApp';
const wwwDir = path.join(baseDir, 'www');
const outputVideo = path.join(wwwDir, 'safety_video.mp4');

const slides = [
    { file: path.join(baseDir, 'hero_child.png'), duration: 7 },
    { file: path.join(baseDir, 'good_touch.png'), duration: 7 },
    { file: path.join(baseDir, 'bad_touch.png'), duration: 7 },
    { file: path.join(baseDir, 'child_safety_poster.png'), duration: 7 },
    { file: path.join(baseDir, 'safe_parents.png'), duration: 7 },
];

slides.forEach(s => {
    if (!fs.existsSync(s.file)) { console.error('Missing:', s.file); process.exit(1); }
    console.log('✅', path.basename(s.file));
});

const xfadeDuration = 1;
const W = 720, H = 1280;

// Build input args
let inputArgs = [];
slides.forEach(s => {
    inputArgs.push('-loop', '1', '-t', String(s.duration), '-i', s.file);
});

// Build filter_complex:
// Step 1: scale+pad each input to 720x1280
// Step 2: xfade chain

let scaleParts = slides.map((_, i) =>
    `[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:black,setsar=1[sv${i}]`
);

let xfadeParts = [];
let currentLabel = 'sv0';
for (let i = 1; i < slides.length; i++) {
    const offset = slides.slice(0, i).reduce((sum, s) => sum + s.duration, 0) - xfadeDuration * i;
    const newLabel = i === slides.length - 1 ? 'vout' : `xf${i}`;
    xfadeParts.push(`[${currentLabel}][sv${i}]xfade=transition=fade:duration=${xfadeDuration}:offset=${offset}[${newLabel}]`);
    currentLabel = newLabel;
}

const filterComplex = [...scaleParts, ...xfadeParts].join('; ');

const args = [
    ...inputArgs,
    '-filter_complex', filterComplex,
    '-map', '[vout]',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '23',
    '-pix_fmt', 'yuv420p',
    '-r', '25',
    '-movflags', '+faststart',
    '-y',
    outputVideo
];

console.log('\n🎬 Generating safety_video.mp4 ...\n');

const result = spawnSync(ffmpegPath, args, { stdio: 'inherit' });

if (result.status === 0) {
    const size = (fs.statSync(outputVideo).size / 1024 / 1024).toFixed(2);
    console.log(`\n✅ SUCCESS! safety_video.mp4 created`);
    console.log(`📦 Size: ${size} MB at ${outputVideo}`);
} else {
    console.error('\n❌ FFmpeg failed. Code:', result.status);
    process.exit(1);
}
