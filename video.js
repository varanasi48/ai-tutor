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
        preloader.innerText = "⏳ Generating video...";
    }

    try {
        const LOGIC_APP_URL = "YOUR_LOGIC_APP_URL_HERE"; // Replace with your Logic App URL

        const response = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error("Failed to send request to Logic App");
        }

        const result = await response.json();
        if (!result.videoUrl) {
            throw new Error("Logic App response did not include a video URL");
        }

        preloader.innerText = "✅ Video Ready!";
        displayVideo(result.videoUrl);
    } catch (error) {
        console.error("Error in Logic App request:", error);
        preloader.innerText = "❌ Video generation failed.";
    }
}

function displayVideo(videoUrl) {
    if (!videoUrl) return;
    const preloader = document.getElementById("preloader");
    if (preloader) preloader.style.display = 'none';

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
