async function generateVideo() {
    const text = document.getElementById("response").innerText;
    if (!text) {
        alert("No AI response available to generate video.");
        return;
    }

    // Show preloader
    const preloader = document.getElementById("preloader");
    preloader.style.display = 'block';
    preloader.innerText = "⏳ Generating video... Please wait.";

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

    // Use FFmpeg.js to create a video in the browser
    const ffmpeg = await loadFFmpeg();
    const videoFile = await createVideoWithFFmpeg(frames, ffmpeg);

    // Hide preloader and show video
    preloader.style.display = 'none';
    const videoPreview = document.getElementById("videoPreview");
    videoPreview.src = URL.createObjectURL(videoFile);
    videoPreview.style.display = 'block';
    
    // Enable download button
    const downloadBtn = document.getElementById("downloadBtn");
    downloadBtn.href = URL.createObjectURL(videoFile);
    downloadBtn.style.display = 'block';
}

async function loadFFmpeg() {
    const { createFFmpeg } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
    return ffmpeg;
}

async function createVideoWithFFmpeg(frames, ffmpeg) {
    const frameFiles = frames.map((dataUrl, index) => {
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

window.generateVideo = generateVideo;
