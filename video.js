async function generateVideo() {
    const lectureText = sessionStorage.getItem("lectureContent");
    const images = JSON.parse(sessionStorage.getItem("images") || "[]");

    if (!lectureText) {
        alert("No lecture content found. Ask AI first!");
        return;
    }

    console.log("📌 Loaded Lecture Content:", lectureText);
    console.log("📌 Loaded Images:", images);

    const videoPreview = document.getElementById("videoPreview");
    const downloadBtn = document.getElementById("downloadBtn");

    // Show processing message
    document.getElementById("loadingText").innerText = "🎬 Generating video...";
    document.getElementById("loadingText").style.display = "block";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 1280;
    canvas.height = 720;

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

        document.getElementById("loadingText").innerText = "✅ Video ready!";
    };

    recorder.start();

    const slides = lectureText.split(". ").map((sentence, index) => ({
        text: sentence.trim(),
        image: images[index] || null,
    }));

    let currentSlide = 0;
    
    function drawSlide() {
        if (currentSlide >= slides.length) {
            setTimeout(() => recorder.stop(), 2000);
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "36px Arial";
        ctx.textAlign = "center";
        ctx.fillText(slides[currentSlide].text, canvas.width / 2, canvas.height / 2);

        if (slides[currentSlide].image) {
            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, (canvas.width - 600) / 2, canvas.height / 4, 600, 300);
            };
            img.src = slides[currentSlide].image;
        }

        currentSlide++;
        setTimeout(drawSlide, 4000);
    }

    drawSlide();
}
