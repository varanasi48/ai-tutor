let isPaused = false;
let scrollSpeed = 2;
let formattedLines = [];
let y = 0; // Start scrolling position

async function fetchLecture() {
    const question = document.getElementById("question").value;
    if (!question) {
        alert("Please enter a question");
        return;
    }

    const LOGIC_APP_URL = "https://prod-30.southindia.logic.azure.com:443/workflows/f6ad47edbaaf42b0a3b6e4816d8fbb73/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=c8sFzIKpt9E-VoiCZ46VuTosaiSZjQL0JkzmrxUWkV0";

    document.getElementById("preloader").style.display = "block"; // Show loader

    try {
        const response = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });

        if (response.status === 202) {
            checkStatus(response.headers.get("Location"));
        } else if (response.status === 200) {
            const result = await response.json();
            saveLectureToFile(result.answer);
            displayLecture(result);
        } else {
            document.getElementById("preloader").innerText = "❌ Error fetching lecture.";
        }
    } catch (error) {
        console.error("Fetch error:", error);
        document.getElementById("preloader").innerText = "❌ Request failed.";
    }
}

async function checkStatus(url) {
    if (!url) {
        document.getElementById("preloader").innerText = "❌ No result URL.";
        return;
    }
    try {
        const response = await fetch(url);
        if (response.status === 200) {
            const result = await response.json();
            saveLectureToFile(result.answer);
            displayLecture(result);
        } else {
            setTimeout(() => checkStatus(url), 3000);
        }
    } catch (error) {
        console.error("Polling error:", error);
        setTimeout(() => checkStatus(url), 3000);
    }
}

function saveLectureToFile(text) {
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "lecture.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function displayLecture(result) {
    document.getElementById("preloader").style.display = "none";

    const text = result?.answer || "No lecture content available.";
    structureAndAnimateText(text);
}

function structureAndAnimateText(text) {
    const canvasContainer = document.getElementById("canvasContainer");
    const canvas = document.getElementById("lectureCanvas");
    const ctx = canvas.getContext("2d");

    canvasContainer.style.display = "block";

    // Full screen canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";

    formattedLines = [];
    y = canvas.height; // Reset position

    let sentences = text.replace(/([.!?])\s*/g, "$1|").split("|");

    sentences.forEach(sentence => {
        let words = sentence.trim().split(" ");
        let line = "";

        words.forEach(word => {
            let testLine = line + word + " ";
            let metrics = ctx.measureText(testLine);
            if (metrics.width > canvas.width - 100) {
                formattedLines.push(line);
                line = word + " ";
            } else {
                line = testLine;
            }
        });

        formattedLines.push(line);
        formattedLines.push(""); // Add spacing between sentences
    });

    scrollText();
}

// **🚀 Scroll Function**
function scrollText() {
    if (isPaused) return;

    const canvas = document.getElementById("lectureCanvas");
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "left";

    formattedLines.forEach((line, index) => {
        ctx.fillText(line, 50, y + index * 40);
    });

    y -= scrollSpeed;

    if (y + formattedLines.length * 40 > 0) {
        requestAnimationFrame(scrollText);
    }
}

// **🚀 Pause/Resume Button**
function toggleScroll() {
    isPaused = !isPaused;
    if (!isPaused) {
        scrollText();
    }
}

// **🚀 Add Slider to Control Scroll Position**
function adjustScroll(value) {
    y = parseInt(value);
}

// **🚀 Show Media (Images/Videos) in Text Flow**
function processMediaInText(text) {
    const mediaContainer = document.getElementById("lectureContainer");
    mediaContainer.innerHTML = "";

    const parts = text.split(/\s+/);
    parts.forEach(part => {
        if (part.match(/\.(jpeg|jpg|png|gif)$/)) {
            const img = document.createElement("img");
            img.src = part;
            img.style.maxWidth = "100%";
            img.style.borderRadius = "10px";
            mediaContainer.appendChild(img);
        } else if (part.match(/\.(mp4|webm|ogg)$/)) {
            const video = document.createElement("video");
            video.src = part;
            video.controls = true;
            video.style.maxWidth = "100%";
            mediaContainer.appendChild(video);
        } else {
            const span = document.createElement("span");
            span.textContent = part + " ";
            mediaContainer.appendChild(span);
        }
    });
}
