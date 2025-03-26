document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("generateVideoButton").addEventListener("click", generateVideo);
});

async function generateVideo() {
    const text = "AI-Generated Lecture: Understanding Pascal’s Principle";
    const images = [
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Pascal%27s_principle.svg/1200px-Pascal%27s_principle.svg.png"
    ];

    // Hide text response, show processing message
    document.getElementById("responseContainer").style.display = "none";
    const preloader = document.getElementById("preloader");
    preloader.style.display = "block";
    preloader.innerText = "⏳ Generating lecture video...";

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
        displayVideo(videoURL);
    };

    recorder.start();

    function drawFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add text lecture content
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText(text, canvas.width / 2, y);

        // Add image inside the video
        const img = new Image();
        img.src = images[0];
        img.onload = () => {
            ctx.drawImage(img, 160, 300, 400, 300);
        };

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
    document.getElementById("preloader").style.display = "none";
    
    const videoPreview = document.getElementById("videoPreview");
    videoPreview.src = videoUrl;
    videoPreview.style.display = "block";
    videoPreview.play();

    const downloadBtn = document.getElementById("downloadBtn");
    downloadBtn.href = videoUrl;
    downloadBtn.style.display = "block";

    // Generate lecture notes
    const lectureNotes = "Understanding Pascal’s Principle\n- Pascal’s Principle states that pressure applied to an enclosed fluid is transmitted equally in all directions.\n- Used in hydraulic systems like brakes and jacks.";
    createDownloadableNotes(lectureNotes);
}

function createDownloadableNotes(notes) {
    const blob = new Blob([notes], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    
    const notesDownload = document.createElement("a");
    notesDownload.href = url;
    notesDownload.download = "Lecture_Notes.txt";
    notesDownload.innerText = "📄 Download Notes";
    notesDownload.style.display = "block";
    
    document.body.appendChild(notesDownload);
}
