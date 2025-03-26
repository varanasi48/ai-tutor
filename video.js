const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const { exec } = require('child_process');

async function createVideo(text, outputFilePath) {
    const canvas = createCanvas(1280, 720);
    const ctx = canvas.getContext('2d');
    const words = text.split(' ');
    const groupedText = [];

    for (let i = 0; i < words.length; i += 7) {
        groupedText.push(words.slice(i, i + 7).join(' '));
    }

    let y = canvas.height;
    const speed = 3;
    const frames = [];
    const tempDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    function drawFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';

        groupedText.forEach((line, i) => {
            ctx.fillText(line, canvas.width / 2, y + (i * 60));
        });

        y -= speed;
    }

    while (y + groupedText.length * 60 > 0) {
        drawFrame();
        frames.push(canvas.toBuffer('image/png'));
    }

    frames.forEach((frame, index) => {
        fs.writeFileSync(path.join(tempDir, `frame${index}.png`), frame);
    });

    const ffmpegCommand = `ffmpeg -framerate 30 -i ${tempDir}/frame%d.png -c:v libx264 -pix_fmt yuv420p ${outputFilePath}`;
    exec(ffmpegCommand, (error) => {
        const preloader = document.getElementById("preloader");
        if (error) {
            console.error(`Error creating video: ${error.message}`);
            preloader.innerText = "❌ Error generating video.";
            return;
        }
        console.log(`Video created successfully: ${outputFilePath}`);
        fs.rmdirSync(tempDir, { recursive: true });
        
        // Hide preloader and show video
        preloader.style.display = 'none';
        const videoPreview = document.getElementById("videoPreview");
        videoPreview.src = outputFilePath;
        videoPreview.style.display = 'block';
        
        // Enable download button
        const downloadBtn = document.getElementById("downloadBtn");
        downloadBtn.href = outputFilePath;
        downloadBtn.style.display = 'block';
    });
}

// UI Integration
window.generateVideo = async function() {
    const text = document.getElementById("response").innerText;
    if (!text) {
        alert("No AI response available to generate video.");
        return;
    }
    
    // Show preloader
    const preloader = document.getElementById("preloader");
    preloader.style.display = 'block';
    preloader.innerText = "⏳ Generating video... Please wait.";
    
    const outputFilePath = 'lecture.mp4';
    createVideo(text, outputFilePath);
};
