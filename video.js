async function generateVideo() {
    const responseContainer = document.getElementById("response");
    const text = responseContainer.innerText.trim();
    
    if (!text || text === "Waiting for response...") {
        alert("Please generate a lecture first.");
        return;
    }

    // Show loading message
    const videoStatus = document.getElementById("videoStatus");
    videoStatus.innerText = "⏳ Generating video, please wait...";
    videoStatus.style.display = "block";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 720;
    canvas.height = 1280;

    const words = text.split(" ");
    let lines = [];
    let currentLine = "";

    words.forEach(word => {
        let testLine = currentLine + word + " ";
        let testWidth = ctx.measureText(testLine).width;
        if (testWidth > 600) {  // Wrap text if it exceeds width
            lines.push(currentLine);
            currentLine = word + " ";
        } else {
            currentLine = testLine;
        }
    });
    lines.push(currentLine);  // Add last line

    let y = canvas.height;
    const lineHeight = 50;
    const scrollSpeed = 2; // Adjust scrolling speed

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    let chunks = [];

    recorder.ondataavailable = event => chunks.push(event.data);
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const videoURL = URL.createObjectURL(blob);
        displayVideo(videoURL);
    };

    recorder.start();

    function drawFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";

        lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, y + index * lineHeight);
        });

        y -= scrollSpeed;
        if (y + (lines.length * lineHeight) > 0) {
            requestAnimationFrame(drawFrame);
        } else {
            recorder.stop();
        }
    }

    drawFrame();
}

// Function to show video
function displayVideo(videoUrl) {
    const videoPreview = document.getElementById("videoPreview");
    videoPreview.src = videoUrl;
    videoPreview.style.display = "block";

    const downloadBtn = document.getElementById("downloadBtn");
    downloadBtn.href = videoUrl;
    downloadBtn.style.display = "block";

    // Hide loading message
    const videoStatus = document.getElementById("videoStatus");
    videoStatus.innerText = "✅ Video generated successfully!";
}
