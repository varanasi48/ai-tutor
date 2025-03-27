async function generateVideo() {
    const responseContainer = document.getElementById("response");
    const text = responseContainer.innerText.trim();
    
    if (!text || text === "Waiting for response...") {
        alert("Please generate a lecture first.");
        return;
    }

    // Show full-screen video container
    document.getElementById("videoContainer").style.display = "flex";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Set max width for text and scroll speed
    const maxWidth = canvas.width * 0.8; // 80% of screen width
    const lineHeight = 50;
    const scrollSpeed = 2;

    ctx.font = "40px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    function wrapText(text, maxWidth) {
        const words = text.split(" ");
        let lines = [];
        let currentLine = "";

        words.forEach(word => {
            let testLine = currentLine + word + " ";
            let testWidth = ctx.measureText(testLine).width;
            if (testWidth > maxWidth) {
                lines.push(currentLine);
                currentLine = word + " ";
            } else {
                currentLine = testLine;
            }
        });

        lines.push(currentLine);
        return lines;
    }

    const lines = wrapText(text, maxWidth);
    let y = canvas.height;

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

        let textY = y;
        lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, textY + index * lineHeight);
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

// Function to display the generated video
function displayVideo(videoUrl) {
    const videoPreview = document.getElementById("videoPreview");
    videoPreview.src = videoUrl;
    videoPreview.style.display = "block";

    const downloadBtn = document.getElementById("downloadBtn");
    downloadBtn.href = videoUrl;
    downloadBtn.style.display = "block";
}
