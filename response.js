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
        part = part.trim();
        if (part.match(/\.(jpeg|jpg|png|gif|svg)$/i)) {
            elements.push({ type: "image", content: part });
        } else if (part.match(/\.(mp4|webm|ogg)$/i)) {
            elements.push({ type: "video", content: part });
        } else if (part.includes("![") && part.includes("](")) { 
            let matches = part.match(/\!\[(.*?)\]\((.*?)\)/);
            if (matches) {
                elements.push({ type: "image", content: matches[2].trim() });
            }
        } else {
            let sentences = part.replace(/([.!?])\s*/g, "$1|").split("|");
            sentences.forEach(sentence => {
                elements.push({ type: "text", content: sentence.trim() });
            });
        }
    });

    return elements;
}

function structureAndAnimateContent() {
    const contentContainer = document.getElementById("lectureContainer");
    contentContainer.innerHTML = "";
    y = 0; // Reset scroll position

    formattedElements.forEach(element => {
        if (element.type === "text") {
            let p = document.createElement("p");
            p.innerText = element.content;
            p.style.color = "white";
            p.style.fontSize = "24px";
            p.style.marginBottom = "15px";
            contentContainer.appendChild(p);
        } else if (element.type === "image") {
            let img = document.createElement("img");
            img.src = element.content;
            img.style.maxWidth = "100%";
            img.style.display = "block";
            img.style.margin = "10px auto";
            contentContainer.appendChild(img);
        } else if (element.type === "video") {
            let video = document.createElement("video");
            video.src = element.content;
            video.controls = true;
            video.style.maxWidth = "100%";
            video.style.display = "block";
            video.style.margin = "10px auto";
            contentContainer.appendChild(video);
        }
    });

    scrollContent();
}

// **🚀 Scroll Function**
function scrollContent() {
    if (isPaused) return;

    const contentContainer = document.getElementById("lectureContainer");

    contentContainer.style.transform = `translateY(${-y}px)`;

    y += scrollSpeed;

    if (y < contentContainer.scrollHeight - window.innerHeight) {
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
