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
    startScrollingText(text);
}

function startScrollingText(text) {
    const canvasContainer = document.getElementById("canvasContainer");
    const canvas = document.getElementById("lectureCanvas");
    const ctx = canvas.getContext("2d");

    canvasContainer.style.display = "block";

    canvas.width = 600;
    canvas.height = 300;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "24px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    let y = canvas.height;

    function animate() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.fillText(text, canvas.width / 2, y);

        y -= 1;

        if (y > -50) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}
