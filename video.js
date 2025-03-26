document.addEventListener("DOMContentLoaded", async () => {
    const generateButton = document.getElementById("generateVideoButton");
    if (generateButton) {
        generateButton.addEventListener("click", generateVideo);
    }

    await loadFFmpeg(); // Load FFmpeg on page load
});

async function loadFFmpeg() {
    if (typeof createFFmpeg !== "undefined") {
        window.ffmpeg = createFFmpeg({ log: true });
        await window.ffmpeg.load();
        console.log("✅ FFmpeg.js Loaded Successfully");
    } else {
        console.error("❌ FFmpeg.js not found! Make sure the script is included.");
    }
}

async function generateVideo() {
    const text = document.getElementById("response")?.innerText;
    if (!text) {
        alert("No AI response available to generate video.");
        return;
    }

    const preloader = document.getElementById("preloader");
    if (preloader) {
        preloader.style.display = "block";
        preloader.innerText = "⏳ Generating video...";
    }

    try {
        if (!window.ffmpeg || !window.ffmpeg.isLoaded()) {
            console.error("❌ FFmpeg.js is not loaded!");
            return;
        }

        const inputFileName = "input.txt";
        window.ffmpeg.FS("writeFile", inputFileName, new TextEncoder().encode(text));

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
        if (preloader) preloader.innerText = "❌ Video processing failed.";
    }
}

function displayVideo(videoUrl) {
    if (!videoUrl) return;
    const preloader = document.getElementById("preloader");
    if (preloader) preloader.style.display = "none";

    const videoPreview = document.getElementById("videoPreview");
    if (videoPreview) {
        videoPreview.src = videoUrl;
        videoPreview.style.display = "block";
    }

    const downloadBtn = document.getElementById("downloadBtn");
    if (downloadBtn) {
        downloadBtn.href = videoUrl;
        downloadBtn.style.display = "block";
    }
}
