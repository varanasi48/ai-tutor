async function generateLectureVideo() {
    const text = localStorage.getItem("lectureText") || "Default AI Lecture Text";
    const mediaData = JSON.parse(localStorage.getItem("lectureMedia")) || {};
    const images = mediaData.images || [];
    const videos = mediaData.videos || [];
    
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 1280;
    canvas.height = 720;
    
    let slideIndex = 0;
    const slides = text.split("\n\n");
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    let chunks = [];

    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const videoURL = URL.createObjectURL(blob);
        displayLectureVideo(videoURL);
    };

    recorder.start();

    function drawSlide() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";

        // Handle Text Formatting
        const lines = slides[slideIndex].split(" ");
        let y = 100;
        let line = "";
        for (let word of lines) {
            if (ctx.measureText(line + " " + word).width > 1000) {
                ctx.fillText(line, canvas.width / 2, y);
                line = word;
                y += 50;
            } else {
                line += " " + word;
            }
        }
        ctx.fillText(line, canvas.width / 2, y);

        // Handle Images
        if (images[slideIndex]) {
            const img = new Image();
            img.src = images[slideIndex];
            img.onload = () => ctx.drawImage(img, 300, 200, 680, 400);
        }

        // Handle Videos
        if (videos[slideIndex]) {
            const video = document.createElement("video");
            video.src = videos[slideIndex];
            video.autoplay = true;
            video.muted = true;
            video.loop = false;
            video.onloadeddata = () => ctx.drawImage(video, 300, 200, 680, 400);
        }

        slideIndex++;
        if (slideIndex < slides.length) {
            setTimeout(drawSlide, 5000); // 5 seconds per slide
        } else {
            setTimeout(() => recorder.stop(), 5000);
        }
    }
    
    drawSlide();
}

function displayLectureVideo(videoUrl) {
    const videoPreview = document.getElementById("videoPreview");
    videoPreview.src = videoUrl;
    videoPreview.style.display = "block";
    
    const downloadBtn = document.getElementById("downloadBtn");
    downloadBtn.href = videoUrl;
    downloadBtn.style.display = "block";
}
