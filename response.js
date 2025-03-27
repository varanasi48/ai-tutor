async function fetchLecture() {
    const question = document.getElementById("question").value;
    if (!question) {
        alert("Please enter a question");
        return;
    }

    const LOGIC_APP_URL = "https://prod-30.southindia.logic.azure.com:443/workflows/f6ad47edbaaf42b0a3b6e4816d8fbb73/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=c8sFzIKpt9E-VoiCZ46VuTosaiSZjQL0JkzmrxUWkV0";

    document.getElementById("response").innerText = "⏳ Processing...";

    try {
        const response = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({ question })
        });

        if (response.status === 202) {
            document.getElementById("response").innerText = "⏳ AI is thinking...";
            const location = response.headers.get("Location");
            if (location) {
                checkStatus(location);
            } else {
                document.getElementById("response").innerText = "❌ No result URL provided.";
            }
        } else if (response.status === 200) {
            const result = await response.json();
            displayLecture(result);
        } else {
            document.getElementById("response").innerText = `❌ Error: ${response.statusText}`;
        }
    } catch (error) {
        console.error("❌ Fetch Error:", error);
        document.getElementById("response").innerText = "❌ Request failed.";
    }
}

async function checkStatus(url) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { "Access-Control-Allow-Origin": "*" }
        });

        if (response.status === 200) {
            const result = await response.json();
            displayLecture(result);
        } else {
            setTimeout(() => checkStatus(url), 3000);
        }
    } catch (error) {
        console.error("❌ Polling Error:", error);
        setTimeout(() => checkStatus(url), 3000);
    }
}

function displayLecture(result) {
    const responseContainer = document.getElementById("response");
    responseContainer.innerHTML = "";  

    if (!result || !result.answer) {
        responseContainer.innerText = "❌ No lecture content received.";
        return;
    }

    // ✅ Display Lecture Text
    const lectureText = document.createElement("p");
    lectureText.textContent = result.answer;
    responseContainer.appendChild(lectureText);

    // ✅ Display Images
    if (Array.isArray(result.images) && result.images.length > 0) {
        result.images.forEach(imgUrl => {
            const img = document.createElement("img");
            img.src = imgUrl;
            img.alt = "Lecture Image";
            img.className = "image-container";
            responseContainer.appendChild(img);
        });
    }

    // ✅ Display Videos
    if (Array.isArray(result.videos) && result.videos.length > 0) {
        result.videos.forEach(videoUrl => {
            const video = document.createElement("video");
            video.setAttribute("controls", "");
            const source = document.createElement("source");
            source.src = videoUrl;
            source.type = "video/mp4";
            video.appendChild(source);
            responseContainer.appendChild(video);
        });
    }

    console.log("✅ Lecture Displayed Successfully:", result);
}
