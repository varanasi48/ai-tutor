document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("generateVideoButton").addEventListener("click", generateVideo);
});

async function generateVideo() {
    const text = localStorage.getItem("lectureText") || "Default AI Lecture";
    const videoPreview = document.getElementById("videoPreview");
    const downloadBtn = document.getElementById("downloadBtn");

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 720;
    canvas.height = 1280;

    let y = canvas.height;
    const speed = 2;

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    let chunks = [];

    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const videoURL = URL.createObjectURL(blob);
        videoPreview.src = videoURL;
        videoPreview.style.display = "block";

        downloadBtn.href = videoURL;
        downloadBtn.style.display = "block";
    };

    recorder.start();

    function drawFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(text, canvas.width / 2, y);

        y -= speed;
        if (y + 40 > 0) {
            requestAnimationFrame(drawFrame);
        } else {
            recorder.stop();
        }
    }

    drawFrame();
}
