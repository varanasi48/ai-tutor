document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("generateVideoButton").addEventListener("click", fetchLecture);
});

async function fetchLecture() {
    const LOGIC_APP_URL = "https://prod-30.southindia.logic.azure.com:443/workflows/f6ad47edbaaf42b0a3b6e4816d8fbb73/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=c8sFzIKpt9E-VoiCZ46VuTosaiSZjQL0JkzmrxUWkV0";

    try {
        const response = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: "Generate lecture video" })
        });

        if (response.status === 202) {
            console.log("⏳ Processing... Waiting for completion.");
            const statusUrl = response.headers.get("Location");

            if (!statusUrl) {
                throw new Error("No status URL provided by Logic App.");
            }

            checkStatus(statusUrl);
        } else if (response.status === 206) {
            console.log("⚠️ Partial Content received, retrying...");
            setTimeout(fetchLecture, 5000);
        } else if (response.ok) {
            const result = await response.json();
            processLectureResponse(result.text, result.media);
        } else {
            throw new Error(`Failed to fetch AI response. Status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error fetching lecture:", error);
    }
}

async function checkStatus(url) {
    try {
        const response = await fetch(url);

        if (response.status === 202) {
            console.log("⏳ Still processing... Retrying in 5 seconds.");
            setTimeout(() => checkStatus(url), 5000);
        } else if (response.status === 206) {
            console.log("⚠️ Partial Content received, retrying...");
            setTimeout(() => checkStatus(url), 5000);
        } else if (response.ok) {
            const result = await response.json();
            processLectureResponse(result.text, result.media);
        } else {
            throw new Error(`Unexpected response: ${response.status}`);
        }
    } catch (error) {
        console.error("Polling error:", error);
        setTimeout(() => checkStatus(url), 5000);
    }
}

function processLectureResponse(text, mediaData) {
    localStorage.setItem("lectureText", text);
    localStorage.setItem("lectureMedia", JSON.stringify(mediaData));
    generateLectureVideo();
}
