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
            startLiveLecture(result);
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
            startLiveLecture(result);
        } else {
            setTimeout(() => checkStatus(url), 3000);
        }
    } catch (error) {
        console.error("Polling error:", error);
        setTimeout(() => checkStatus(url), 3000);
    }
}

function startLiveLecture(result) {
    document.getElementById("loader").style.display = "none";

    const lectureText = result?.answer || "No lecture content available.";
    const images = result?.images || [];
    const videos = result?.videos || [];

    console.log("✅ Lecture Content:", lectureText);
    console.log("📷 Images:", images);
    console.log("🎥 Videos:", videos);

    const canvas = document.getElementById("lectureCanvas");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let y = canvas.height;
    const words = lectureText.split(" ");
    const speed = 2; // Speed of scrolling text

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
            console.log("✅ Lecture Ended");
        }
    }

    drawFrame();

    // Display Images One by One (5-sec duration)
    let imgIndex = 0;
    function showNextImage() {
        if (imgIndex < images.length) {
            const img = new Image();
            img.src = images[imgIndex];
            img.onload = function () {
                ctx.drawImage(img, (canvas.width - img.width) / 2, (canvas.height - img.height) / 2);
            };
            imgIndex++;
            setTimeout(showNextImage, 5000);
        }
    }

    showNextImage();

    // Play Videos One by One
    let videoIndex = 0;
    function showNextVideo() {
        if (videoIndex < videos.length) {
            const video = document.createElement("video");
            video.src = videos[videoIndex];
            video.setAttribute("autoplay", true);
            video.style.position = "absolute";
            video.style.top = "50%";
            video.style.left = "50%";
            video.style.transform = "translate(-50%, -50%)";
            video.style.width = "80%";
            document.body.appendChild(video);

            video.onended = () => {
                document.body.removeChild(video);
                videoIndex++;
                showNextVideo();
            };
        }
    }

    showNextVideo();
}
