async function fetchLecture() {
    const question = document.getElementById("question").value;
    if (!question) {
        alert("Please enter a question");
        return;
    }

    const LOGIC_APP_URL = "https://prod-30.southindia.logic.azure.com:443/workflows/f6ad47edbaaf42b0a3b6e4816d8fbb73/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=c8sFzIKpt9E-VoiCZ46VuTosaiSZjQL0JkzmrxUWkV0";

    document.getElementById("preloader").style.display = "block"; // Show loader
    console.log("🔄 Sending request to API...");

    try {
        const response = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });

        console.log("✅ Response received:", response);
        
        if (response.status === 202) {
            const location = response.headers.get("Location");
            console.log("🔄 Checking status at:", location);
            checkStatus(location);
        } else if (response.status === 200) {
            const result = await response.json();
            console.log("🎯 API returned result:", result);
            displayLecture(result);
        } else {
            console.error("❌ API Error:", response.status);
            document.getElementById("preloader").innerText = "❌ Error fetching lecture.";
        }
    } catch (error) {
        console.error("❌ Fetch error:", error);
        document.getElementById("preloader").innerText = "❌ Request failed.";
    }
}

async function checkStatus(url) {
    if (!url) {
        console.error("❌ No polling URL provided.");
        document.getElementById("preloader").innerText = "❌ No result URL.";
        return;
    }
    
    try {
        const response = await fetch(url);
        console.log("🔄 Polling response:", response);

        if (response.status === 200) {
            const result = await response.json();
            console.log("✅ Polling Success:", result);
            displayLecture(result);
        } else {
            console.warn("⌛ Polling again in 3s...");
            setTimeout(() => checkStatus(url), 3000);
        }
    } catch (error) {
        console.error("❌ Polling error:", error);
        setTimeout(() => checkStatus(url), 3000);
    }
}

function displayLecture(result) {
    document.getElementById("preloader").style.display = "none"; // Hide loader
    const lectureContainer = document.getElementById("lectureContainer");
    lectureContainer.innerHTML = "";  // Clear previous content

    console.log("📺 Displaying lecture:", result);

    // Show video if available
    if (result?.videoUrl) {
        console.log("🎥 Video URL:", result.videoUrl);

        const videoElement = document.createElement("video");
        videoElement.setAttribute("id", "lectureVideo");
        videoElement.setAttribute("controls", "");
        videoElement.style.width = "100%";  
        videoElement.style.display = "block"; 

        const source = document.createElement("source");
        source.src = result.videoUrl;
        source.type = "video/mp4";

        videoElement.appendChild(source);
        lectureContainer.appendChild(videoElement);
        videoElement.play(); // Auto-play the video
    } else {
        console.warn("❌ No video URL found in response!");
        lectureContainer.innerHTML = "<p>❌ No video content available.</p>";
    }
}
