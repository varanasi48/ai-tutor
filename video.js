document.addEventListener("DOMContentLoaded", () => {
    const generateButton = document.getElementById("generateVideoButton");

    if (!generateButton) {
        console.error("❌ Button with ID 'generateVideoButton' not found in the DOM.");
        return;
    }

    console.log("✅ Button found, adding event listener...");
    generateButton.addEventListener("click", generateVideo);
});

async function generateVideo() {
    console.log("🎬 Generating video...");

    const responseElement = document.getElementById("response");
    if (!responseElement) {
        console.error("❌ Element with ID 'response' not found.");
        alert("No response text found!");
        return;
    }

    const text = responseElement.innerText || "Default AI Lecture Text";
    
    // ✅ Ensure canvas and video capture setup
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 720;
    canvas.height = 1280;

    let y = canvas.height; // Start text from bottom
    const speed = 2; // Scroll speed

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    let chunks = [];

    recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
    };

    recorder.onstop = async () => {
        console.log("✅ Video recording completed!");
        if (chunks.length === 0) {
            console.error("❌ No video data captured.");
            alert("Video generation failed.");
            return;
        }

        const blob = new Blob(chunks, { type: "video/webm" });
        const videoURL = URL.createObjectURL(blob);
        displayVideo(videoURL);
    };

    recorder.start();
    console.log("📹 Video recording started...");

    function drawFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText(text, canvas.width / 2, y);

        y -= speed;
        if (y + 40 > 0) {
            requestAnimationFrame(drawFrame);
        } else {
            console.log("🎞 Stopping recording...");
            recorder.stop();
        }
    }

    drawFrame();
}

function displayVideo(videoUrl) {
    console.log("🎥 Displaying video...");
    
    const videoPreview = document.getElementById("videoPreview");
    if (!videoPreview) {
        console.error("❌ Element with ID 'videoPreview' not found.");
        return;
    }

    videoPreview.src = videoUrl;
    videoPreview.style.display = "block";

    const downloadBtn = document.getElementById("downloadBtn");
    if (!downloadBtn) {
        console.error("❌ Element with ID 'downloadBtn' not found.");
        return;
    }

    downloadBtn.href = videoUrl;
    downloadBtn.style.display = "block";
}
