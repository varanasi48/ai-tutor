async function fetchLecture() {
    const question = document.getElementById("question").value;
    if (!question) {
        alert("Please enter a question");
        return;
    }

    const LOGIC_APP_URL = "https://prod-30.southindia.logic.azure.com:443/workflows/f6ad47edbaaf42b0a3b6e4816d8fbb73/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=c8sFzIKpt9E-VoiCZ46VuTosaiSZjQL0JkzmrxUWkV0";

    document.getElementById("loader").style.display = "block";

    try {
        const response = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });

        if (response.status === 202) {
            const location = response.headers.get("Location");
            if (location) {
                checkStatus(location);
            } else {
                alert("❌ No result URL provided.");
            }
        } else if (response.status === 200) {
            const result = await response.json();
            console.log("✅ Received Response:", result);
            generateVideo(result);
        } else {
            alert("❌ Error connecting to AI Tutor.");
        }
    } catch (error) {
        console.error("Fetch error:", error);
        alert("❌ Request failed.");
    }
}

async function checkStatus(url) {
    try {
        const response = await fetch(url);
        if (response.status === 200) {
            const result = await response.json();
            generateVideo(result);
        } else {
            setTimeout(() => checkStatus(url), 3000);
        }
    } catch (error) {
        console.error("Polling error:", error);
        setTimeout(() => checkStatus(url), 3000);
    }
}

function generateVideo(result) {
    document.getElementById("loader").style.display = "block";

    const lectureText = result?.answer || "No lecture content available.";
    const images = result?.images || [];
    const videos = result?.videos || [];

    console.log("✅ Lecture Content:", lectureText);
    console.log("📷 Images:", images);
    console.log("🎥 Videos:", videos);

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
        displayVideo(videoURL);
    };

    recorder.start();

    let y = canvas.height;
    const speed = 2; 
    const words = lectureText.split(" ");
    
    function drawFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";

        let yOffset = y;
        words.forEach((word, index) => {
            ctx.fillText(word, canvas.width / 2, yOffset + index * 50);
        });

        y -= speed;
        if (y > -canvas.height) {
            requestAnimationFrame(drawFrame);
        } else {
            recorder.stop();
            document.getElementById("loader").style.display = "none";
        }
    }

    drawFrame();
}

function displayVideo(videoUrl) {
    const videoPreview = document.getElementById("videoPreview");
    videoPreview.src = videoUrl;
    videoPreview.style.display = "block";

    const downloadBtn = document.getElementById("downloadBtn");
    downloadBtn.href = videoUrl;
    downloadBtn.style.display = "block";
}
