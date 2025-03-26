document.addEventListener("DOMContentLoaded", () => {
    const generateButton = document.getElementById("generateVideoButton");
    if (generateButton) {
        generateButton.addEventListener("click", generateVideo);
    }
});

async function generateVideo() {
    const text = document.getElementById("response")?.innerText;
    if (!text) {
        alert("No AI response available to generate video.");
        return;
    }

    const preloader = document.getElementById("preloader");
    if (preloader) {
        preloader.style.display = 'block';
        preloader.innerText = "⏳ Generating video... Please wait.";
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 1280;
    canvas.height = 720;
    
    const words = text.split(' ');
    const groupedText = [];
    for (let i = 0; i < words.length; i += 7) {
        groupedText.push(words.slice(i, i + 7).join(' '));
    }

    let y = canvas.height;
    const speed = 3;
    const frames = [];
    
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
        frames.push(canvas.toDataURL("image/png"));
    }

    try {
        const ffmpeg = await loadFFmpeg();
        const videoFile = await createVideoWithFFmpeg(frames, ffmpeg);
        
        if (preloader) preloader.style.display = 'none';
        
        const videoPreview = document.getElementById("videoPreview");
        if (videoPreview) {
            videoPreview.src = URL.createObjectURL(videoFile);
            videoPreview.style.display = 'block';
        }
        
        const downloadBtn = document.getElementById("downloadBtn");
        if (downloadBtn) {
            downloadBtn.href = URL.createObjectURL(videoFile);
            downloadBtn.style.display = 'block';
        }
    } catch (error) {
        console.error("Video generation failed:", error);
        if (preloader) preloader.innerText = "❌ Error generating video.";
    }
}

async function loadFFmpeg() {
    if (!window.FFmpeg) {
        console.error("FFmpeg.js not found! Make sure the script is included.");
        return;
    }
    const { createFFmpeg } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
    return ffmpeg;
}

async function createVideoWithFFmpeg(frames, ffmpeg) {
    frames.forEach((dataUrl, index) => {
        const byteString = atob(dataUrl.split(',')[1]);
        const arrayBuffer = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            arrayBuffer[i] = byteString.charCodeAt(i);
        }
        ffmpeg.FS("writeFile", `frame${index}.png`, arrayBuffer);
    });

    await ffmpeg.run("-framerate", "30", "-i", "frame%d.png", "-c:v", "libx264", "-pix_fmt", "yuv420p", "output.mp4");
    const data = ffmpeg.FS("readFile", "output.mp4");
    return new Blob([data.buffer], { type: "video/mp4" });
}
