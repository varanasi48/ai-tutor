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
        
        if (!response.ok) {
            throw new Error("Failed to fetch AI response");
        }
        
        const result = await response.json();
        if (!result.answer) {async function fetchAiResponse() {
    const question = document.getElementById("questionInput").value.trim();
    const responseContainer = document.getElementById("responseContainer");
    const loadingIndicator = document.getElementById("loading");

    if (!question) {
        responseContainer.innerHTML = "❌ Please enter a question!";
        return;
    }

    loadingIndicator.style.display = "block";
    responseContainer.innerHTML = ""; // Clear previous response

    const LOGIC_APP_URL = "https://prod-30.southindia.logic.azure.com:443/workflows/f6ad47edbaaf42b0a3b6e4816d8fbb73/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=c8sFzIKpt9E-VoiCZ46VuTosaiSZjQL0JkzmrxUWkV0";

    try {
        const response = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: question })
        });

        if (!response.ok) throw new Error("Failed to fetch AI response");

        const result = await response.json();

        // 🔥 Fix: Check if 'answer' key exists, otherwise log response
        if (!result.answer) {
            console.error("Invalid response:", result);
            throw new Error("Invalid response format: Missing 'answer' key");
        }

        displayAiResponse(result);
    } catch (error) {
        console.error("Error fetching response:", error);
        responseContainer.innerHTML = "❌ Error: AI response invalid!";
    } finally {
        loadingIndicator.style.display = "none";
    }
}

            throw new Error("Invalid response format: Missing 'answer' key");
        }
        processLectureResponse(result.answer, result.media);
    } catch (error) {
        console.error("Error fetching lecture:", error);
    }
}

function processLectureResponse(text, mediaData) {
    localStorage.setItem("lectureText", text);
    localStorage.setItem("lectureMedia", JSON.stringify(mediaData));
    generateLectureVideo();
}
