document.addEventListener("DOMContentLoaded", async () => {
    await loadFFmpeg();
    const generateButton = document.getElementById("generateVideoButton");
    if (generateButton) {
        generateButton.addEventListener("click", generateVideo);
    }
});

async function loadFFmpeg() {
    if (typeof FFmpeg === "undefined" || !FFmpeg.createFFmpeg) {
        console.error("❌ FFmpeg.js not found! Check if it's included in index.html.");
        return;
    }

    const { createFFmpeg, fetchFile } = FFmpeg; // ✅ Extract functions properly
    window.ffmpeg = createFFmpeg({ log: true });

    try {
        console.log("⏳ Loading FFmpeg.js...");
        await window.ffmpeg.load();
        console.log("✅ FFmpeg.js Loaded Successfully");
    } catch (error) {
        console.error("❌ FFmpeg failed to load:", error);
    }
}

async function generateVideo() {
    if (!window.ffmpeg || !window.ffmpeg.isLoaded()) {
        console.error("❌ FFmpeg.js is not loaded yet!");
        return;
    }

    console.log("🎬 Generating video...");
    try {
        const text = document.getElementById("response")?.innerText;
        if (!text) {
            alert("No AI response available to generate video.");
            return;
        }

        window.ffmpeg.FS("writeFile", "input.txt", new TextEncoder().encode(text));

        await window.ffmpeg.run(
            "-f", "lavfi",
            "-i", "color=c=black:s=1280x720:d=5",
            "-vf", `drawtext=text='${text}':fontcolor=white:fontsize=24:x=100:y=100`,
            "output.mp4"
        );

        const outputData = window.ffmpeg.FS("readFile", "output.mp4");
        const videoBlob = new Blob([outputData.buffer], { type: "video/mp4" });
        const videoUrl = URL.createObjectURL(videoBlob);

        displayVideo(videoUrl);
    } catch (error) {
        console.error("❌ Error generating video:", error);
    }
}

function displayVideo(videoUrl) {
    if (!videoUrl) return;

    const videoPreview = document.getElementById("videoPreview");
    if (videoPreview) {
        videoPreview.src = videoUrl;
        videoPreview.style.display = 'block';
    }

    const downloadBtn = document.getElementById("downloadBtn");
    if (downloadBtn) {
        downloadBtn.href = videoUrl;
        downloadBtn.style.display = 'block';
    }
}
