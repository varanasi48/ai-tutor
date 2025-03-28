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
            displayLecture(result);
        } else {
            setTimeout(() => checkStatus(url), 3000);
        }
    } catch (error) {
        console.error("Polling error:", error);
        setTimeout(() => checkStatus(url), 3000);
    }
}

function displayLecture(result) {
    document.getElementById("preloader").style.display = "none"; // Hide loader

    const text = result?.answer || "No lecture content available.";
    startTypingEffect(text);
}

function startTypingEffect(text) {
    const canvasContainer = document.getElementById("canvasContainer");
    const canvas = document.getElementById("lectureCanvas");
    const ctx = canvas.getContext("2d");

    canvasContainer.style.display = "block";

    // Set canvas full screen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";

    let words = text.split(" ");
    let lines = [];
    let line = "";

    // Breaking text into lines
    for (let word of words) {
        let testLine = line + word + " ";
        let metrics = ctx.measureText(testLine);
        if (metrics.width > canvas.width - 100) {
            lines.push(line);
            line = word + " ";
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    let y = 100;
    let currentText = "";
    let index = 0;
    let lineIndex = 0;

    function typeEffect() {
        if (lineIndex < lines.length) {
            if (index < lines[lineIndex].length) {
                currentText += lines[lineIndex][index];
                ctx.fillText(currentText, 50, y);
                index++;
                setTimeout(typeEffect, 50); // Adjust speed of typing
            } else {
                index = 0;
                currentText = "";
                y += 40; // Move to next line
                lineIndex++;
                setTimeout(typeEffect, 300); // Small delay before next line
            }
        }
    }

    typeEffect();
}
