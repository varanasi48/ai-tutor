async function generateVideo() {
    const text = document.getElementById("response")?.innerText || "Default AI Lecture Text";
    
    if (text === "Waiting for response..." || text === "⏳ Processing...") {
        alert("❌ No valid lecture to generate video!");
        return;
    }

    document.getElementById("loader").style.display = "block";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 1280;
    canvas.height = 720;

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
        ctx.font = "40px Arial";
        ctx.textAlign = "center";

        const words = text.split(" ");
        let yOffset = y;

        words.forEach((word, index) => {
            ctx.fillText(word, canvas.width / 2, yOffset + index * 50);
        });

        y -= speed;
        if (y > -canvas.height) {
            requestAnimationFrame(drawFrame);
        } else {
            recorder.stop();
            document.getElementById("loader").style.display = "none";
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
