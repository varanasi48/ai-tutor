async function generateVideo() {
    const responseContainer = document.getElementById("response");

    if (!responseContainer || responseContainer.innerText.trim() === "Waiting for response...") {
        alert("No lecture available. Ask AI first!");
        return;
    }

    // Extract lecture text
    let lectureText = "";
    let images = [];
    let videos = [];

    responseContainer.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            lectureText += node.textContent + " ";
        } else if (node.tagName === "IMG") {
            images.push(node.src);
        } else if (node.tagName === "VIDEO") {
            videos.push(node.querySelector("source")?.src);
        }
    });

    if (!lectureText.trim()) {
        alert("Lecture content is empty.");
        return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 1280;
    canvas.height = 720;

    const lines = splitTextIntoLines(lectureText, 60);
    let y = canvas.height;
    let index = 0;

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

        if (index < lines.length) {
            ctx.fillText(lines[index], canvas.width / 2, y);
            y -= 2;
            if (y < 300) {
                index++;
                y = canvas.height;
                setTimeout(drawFrame, 1000);
            } else {
                requestAnimationFrame(drawFrame);
            }
        } else {
            recorder.stop();
        }
    }

    drawFrame();
}

function splitTextIntoLines(text, maxCharsPerLine) {
    const words = text.split(" ");
    let lines = [];
    let currentLine = "";

    words.forEach(word => {
        if ((currentLine + word).length <= maxCharsPerLine) {
            currentLine += word + " ";
        } else {
            lines.push(currentLine.trim());
            currentLine = word + " ";
        }
    });

    if (currentLine.trim()) {
        lines.push(currentLine.trim());
    }

    return lines;
}

function displayVideo(videoUrl) {
    const videoPreview = document.getElementById("videoPreview");
    videoPreview.src = videoUrl;
    videoPreview.style.display = "block";

    const downloadBtn = document.getElementById("downloadBtn");
    downloadBtn.href = videoUrl;
    downloadBtn.style.display = "block";
}
