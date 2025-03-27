function generateVideo() {
    if (!aiResponse) {
        alert("No AI response available. Please ask a question first.");
        return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 720;
    canvas.height = 1280;

    let textLines = aiResponse.split(" "); // Break text into words
    let y = canvas.height; // Start text from bottom
    const speed = 2; // Scroll speed

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    let chunks = [];

    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.onstop = async () => {
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
        ctx.font = "30px Arial";
        ctx.textAlign = "center";

        let line = "";
        let yOffset = 40; 

        for (let i = 0; i < textLines.length; i++) {
            line += textLines[i] + " ";
            if (i % 10 === 0 || i === textLines.length - 1) { // Wrap text every 10 words
                ctx.fillText(line.trim(), canvas.width / 2, y - yOffset);
                yOffset += 40; 
                line = "";
            }
        }

        y -= speed;
        if (y + 40 > 0) {
            requestAnimationFrame(drawFrame);
        } else {
            recorder.stop();
        }
    }

    drawFrame();
}

function displayVideo(videoUrl) {
    const videoPreview = document.getElementById("videoPreview");
    videoPreview.src = videoUrl;
    videoPreview.style.display = "block";

    const downloadBtn = document.getElementById("downloadBtn");
    downloadBtn.href = videoUrl;
    downloadBtn.style.display = "block";
}
