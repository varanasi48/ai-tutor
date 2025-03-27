async function fetchLecture() {
    const question = document.getElementById("question").value;
    if (!question) {
        alert("Please enter a question");
        return;
    }

    const LOGIC_APP_URL = "https://prod-30.southindia.logic.azure.com/...";
    
    document.getElementById("response").innerText = "⏳ Processing...";

    try {
        const response = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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
            console.log("✅ API Response:", result);  // ✅ Debugging
            displayLecture(result);
        } else {
            document.getElementById("response").innerText = "❌ Error connecting to AI Tutor.";
        }
    } catch (error) {
        console.error("Fetch error:", error);
        document.getElementById("response").innerText = "❌ Request failed.";
    }
}

function displayLecture(result) {
    const responseContainer = document.getElementById("response");
    responseContainer.innerHTML = "";

    if (!result || !result.answer) {
        responseContainer.innerHTML = "❌ No valid response received.";
        return;
    }

    const lectureText = document.createElement("p");
    lectureText.textContent = result.answer;
    responseContainer.appendChild(lectureText);

    if (result.images?.length) {
        result.images.forEach(imgUrl => {
            const img = document.createElement("img");
            img.src = imgUrl;
            img.alt = "Lecture Image";
            responseContainer.appendChild(img);
        });
    }

    if (result.videos?.length) {
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
}
