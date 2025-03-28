let isPaused = false;
let scrollSpeed = 2;
let formattedElements = [];
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
    formattedElements = extractTextAndMedia(text);
    structureAndAnimateContent();
}

function extractTextAndMedia(text) {
    let elements = [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    let parts = text.split(urlRegex);

    parts.forEach(part => {
        if (part.match(/\.(jpeg|jpg|png|gif|svg)$/i)) {
            elements.push({ type: "image", content: part.trim() });
        } else if (part.match(/\.(mp4|webm|ogg)$/i)) {
            elements.push({ type: "video", content: part.trim() });
        } else if (part.includes("![") && part.includes("](")) { 
            // Handles markdown-style images [Title](URL)
            let matches = part.match(/\!\[(.*?)\]\((.*?)\)/);
            if (matches) {
                elements.push({ type: "image", content: matches[2].trim() });
            }
        } else {
            let sentences = part.replace(/([.!?])\s*/g, "$1|").split("|");
            sentences.forEach(sentence => {
                let words = sentence.trim().split(" ");
                let line = "";

                words.forEach(word => {
                    let testLine = line + word + " ";
                    if (testLine.length > 50) {
                        elements.push({ type: "text", content: line });
                        line = word + " ";
                    } else {
                        line = testLine;
                    }
                });

                elements.push({ type: "text", content: line });
                elements.push({ type: "text", content: "" });
            });
        }
    });

    return elements;
}

function structureAndAnimateContent() {
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

    y = canvas.height; // Reset position

    scrollContent();
}

// **🚀 Scroll Function**
function scrollContent() {
    if (isPaused) return;

    const canvas = document.getElementById("lectureCanvas");
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let yOffset = y;

    formattedElements.forEach(element => {
        if (element.type === "text") {
            ctx.fillStyle = "white";
            ctx.fillText(element.content, 50, yOffset);
            yOffset += 40;
        } else if (element.type === "image") {
            let img = new Image();
            img.src = element.content;
            img.onload = function () {
                ctx.drawImage(img, 50, yOffset, 300, 200);
            };
            yOffset += 220;
        } else if (element.type === "video") {
            let video = document.createElement("video");
            video.src = element.content;
            video.controls = true;
            video.width = 300;
            video.height = 200;
            video.style.position = "absolute";
            video.style.top = `${yOffset}px`;
            video.style.left = "50px";
            document.body.appendChild(video);
            yOffset += 220;
        }
    });

    y -= scrollSpeed;

    if (y + yOffset > 0) {
        requestAnimationFrame(scrollContent);
    }
}

// **🚀 Pause/Resume Button**
function toggleScroll() {
    isPaused = !isPaused;
    if (!isPaused) {
        scrollContent();
    }
}
