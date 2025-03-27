async function fetchLecture() {
    const question = document.getElementById("question").value;
    if (!question) {
        alert("Please enter a question");
        return;
    }

    const LOGIC_APP_URL = "https://prod-30.southindia.logic.azure.com:443/workflows/f6ad47edbaaf42b0a3b6e4816d8fbb73/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=c8sFzIKpt9E-VoiCZ46VuTosaiSZjQL0JkzmrxUWkV0";

    document.getElementById("loader").style.display = "block";
    document.getElementById("lecture").innerText = "";
    document.getElementById("imageContainer").innerHTML = "";

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
                document.getElementById("loader").innerText = "❌ No response URL.";
            }
        } else if (response.status === 200) {
            const result = await response.json();
            startLiveLecture(result);
        } else {
            document.getElementById("loader").innerText = "❌ Error fetching response.";
        }
    } catch (error) {
        console.error("Fetch error:", error);
        document.getElementById("loader").innerText = "❌ Request failed.";
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

    const lectureContainer = document.getElementById("lecture");
    const imageContainer = document.getElementById("imageContainer");

    const lectureText = result?.answer || "No lecture content available.";
    const images = result?.images || [];
    const videos = result?.videos || [];

    console.log("✅ Lecture Content:", lectureText);
    console.log("📷 Images:", images);
    console.log("🎥 Videos:", videos);

    // Fix: Group words properly instead of one word per line
    let words = lectureText.split(" ");
    let index = 0;

    function typeNextWord() {
        if (index < words.length) {
            lectureContainer.innerHTML += words[index] + " ";
            index++;
            setTimeout(typeNextWord, 100); // Adjust speed
        } else {
            showNextImage(0);
        }
    }
    typeNextWord();

    function showNextImage(imgIndex) {
        if (imgIndex < images.length) {
            const img = document.createElement("img");
            img.src = images[imgIndex];
            img.style.display = "block";
            imageContainer.appendChild(img);

            setTimeout(() => showNextImage(imgIndex + 1), 5000);
        } else {
            showNextVideo(0);
        }
    }

    function showNextVideo(videoIndex) {
        if (videoIndex < videos.length) {
            const video = document.createElement("video");
            video.src = videos[videoIndex];
            video.controls = true;
            video.autoplay = false; // Fix: Don't autoplay instantly
            video.style.display = "block";
            imageContainer.appendChild(video);

            video.onended = () => {
                showNextVideo(videoIndex + 1);
            };
        }
    }
}
