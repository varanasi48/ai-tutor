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
    const words = text.split(" "); 
    const lines = [];
    let line = "";

    words.forEach((word, index) => {
        if ((line + word).length > 30 || index === words.length - 1) {
            lines.push(line);
            line = word;
        } else {
            line += " " + word;
        }
    });
    if (line) lines.push(line);

    // ✅ Set up canvas and video
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 720;
    canvas.height = 1280;
    const lineHeight = 50;

    let y = canvas.height; 
    const speed = 6; // ✅ Increase speed to reduce delay

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

        // ✅ Draw all lines properly
        lines.forEach((line, i) => {
            ctx.fillText(line, canvas.width / 2, y + i * lineHeight);
        });

        y -= speed;

        if (y + lines.length * lineHeight > 0) {
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

/* 🖼️ ✅ Display images in UI instead of links */
function displayImages(imageUrls) {
    const imageContainer = document.getElementById("imageContainer");
    imageContainer.innerHTML = ""; // Clear previous content

    imageUrls.forEach((url) => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = "Reference Image";
        img.style.maxWidth = "300px";
        img.style.display = "block";
        img.style.margin = "10px auto";
        imageContainer.appendChild(img);
    });
}

/* 🎬 ✅ Embed reference videos */
function displayVideos(videoUrls) {
    const videoContainer = document.getElementById("videoContainer");
    videoContainer.innerHTML = ""; 

    videoUrls.forEach((url) => {
        const videoElement = document.createElement("video");
        videoElement.src = url;
        videoElement.controls = true;
        videoElement.style.width = "320px";
        videoContainer.appendChild(videoElement);
    });
}
