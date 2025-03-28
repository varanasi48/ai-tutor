let isPaused = false;
let scrollSpeed = 2;
let animationFrame;
let formattedLines = [];
let y = 0; // Store Y position for resume

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
            storeAndDisplayLecture(result);
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
            storeAndDisplayLecture(result);
        } else {
            setTimeout(() => checkStatus(url), 3000);
        }
    } catch (error) {
        console.error("Polling error:", error);
        setTimeout(() => checkStatus(url), 3000);
    }
}

// **Store text and start animation**
function storeAndDisplayLecture(result) {
    document.getElementById("preloader").style.display = "none"; // Hide loader

    const text = result?.answer || "No lecture content available.";
    formattedLines = structureText(text);
    y = window.innerHeight; // Reset scroll position
    animateText();
}

// **Breaks text into readable lines**
function structureText(text) {
    const canvas = document.getElementById("lectureCanvas");
    const ctx = canvas.getContext("2d");
    ctx.font = "30px Arial";
    
    let sentences = text.replace(/([.!?])\s*/g, "$1|").split("|");
    let lines = [];

    sentences.forEach(sentence => {
        let words = sentence.trim().split(" ");
        let line = "";

        words.forEach(word => {
            let testLine = line + word + " ";
            let metrics = ctx.measureText(testLine);
            if (metrics.width > canvas.width - 100) {
                lines.push(line);
                line = word + " ";
            } else {
                line = testLine;
            }
        });

        lines.push(line);
        lines.push(""); // **Spacing between sentences**
    });

    return lines;
}

// **Scrolling text animation**
function animateText() {
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
        animationFrame = requestAnimationFrame(animateText);
    }
}

// **Pause & Resume Function**
function toggleScroll() {
    isPaused = !isPaused;
    const btn = document.getElementById("pauseBtn");

    if (isPaused) {
        cancelAnimationFrame(animationFrame);
        btn.innerText = "Resume";
    } else {
        btn.innerText = "Pause";
        animationFrame = requestAnimationFrame(animateText);
    }
}
