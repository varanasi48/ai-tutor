async function generateVideo() {
    const result = JSON.parse(sessionStorage.getItem("lectureContent"));
    if (!result) {
        alert("No lecture content available.");
        return;
    }

    document.getElementById("videoContainer").style.display = "flex";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const textChunks = splitText(result.answer, 80); // Split text into slides
    const images = result.images || [];
    const videos = result.videos || [];

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

    async function renderSlides() {
        for (let i = 0; i < textChunks.length; i++) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            ctx.font = "40px Arial";
            ctx.textAlign = "center";
            ctx.fillText(textChunks[i], canvas.width / 2, canvas.height / 2);

            await delay(3000); // Pause for readability
        }

        for (let imgUrl of images) {
            const img = await loadImage(imgUrl);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            await delay(5000);
        }

        for (let videoUrl of videos) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillText("Playing Video...", canvas.width / 2, canvas.height / 2);
            await delay(3000);
        }

        recorder.stop();
    }

    renderSlides();
}

function displayVideo(videoUrl) {
    const videoPreview = document.getElementById("videoPreview");
    videoPreview.src = videoUrl;
    videoPreview.style.display = "block";

    const downloadBtn = document.getElementById("downloadBtn");
    downloadBtn.href = videoUrl;
    downloadBtn.style.display = "block";
}

// Utility Functions
function splitText(text, maxChars) {
    const words = text.split(" ");
    let slides = [];
    let currentSlide = "";

    for (let word of words) {
        if ((currentSlide + word).length > maxChars) {
            slides.push(currentSlide);
            currentSlide = word + " ";
        } else {
            currentSlide += word + " ";
        }
    }
    slides.push(currentSlide);
    return slides;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function loadImage(url) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = url;
    });
}
