async function generateLectureVideo() {
    const text = localStorage.getItem("lectureText") || "Default AI Lecture Text";
    const mediaData = JSON.parse(localStorage.getItem("lectureMedia") || "{}");
    const images = mediaData.images || [];
    const videos = mediaData.videos || [];

    if (!text.trim()) {
        console.error("No lecture text found!");
        return;
    }

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

        // Wrap text properly
        const words = slides[slideIndex].split(" ");
        let line = "";
        let y = 200;
        
        for (let i = 0; i < words.length; i++) {
            let testLine = line + words[i] + " ";
            let metrics = ctx.measureText(testLine);
            if (metrics.width > 1000) {
                ctx.fillText(line, canvas.width / 2, y);
                line = words[i] + " ";
                y += 50;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, canvas.width / 2, y);

        // Show image for slide if available
        if (images[slideIndex]) {
            const img = new Image();
            img.src = images[slideIndex];
            img.onload = () => ctx.drawImage(img, 300, 150, 680, 400);
        }

        // Show video if available
        if (videos[slideIndex]) {
            const video = document.createElement("video");
            video.src = videos[slideIndex];
            video.autoplay = true;
            video.muted = true;
            video.loop = false;
            video.onloadeddata = () => ctx.drawImage(video, 300, 150, 680, 400);
        }

        slideIndex++;
        if (slideIndex < slides.length) {
            setTimeout(drawSlide, 7000);
        } else {
            setTimeout(() => recorder.stop(), 7000);
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
