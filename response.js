document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("generateVideoButton").addEventListener("click", fetchLecture);
});

async function fetchLecture() {
    const question = document.getElementById("questionInput").value.trim();
    if (!question) {
        alert("Please enter a question");
        return;
    }

    const LOGIC_APP_URL = "https://prod-30.southindia.logic.azure.com:443/workflows/f6ad47edbaaf42b0a3b6e4816d8fbb73/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=c8sFzIKpt9E-VoiCZ46VuTosaiSZjQL0JkzmrxUWkV0";

    try {
        const response = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });

        if (!response.ok) {
            throw new Error("Failed to fetch AI response");
        }

        const result = await response.json();
        if (!result || typeof result !== "object") {
            throw new Error("Invalid response format from AI");
        }

        localStorage.setItem("lectureText", result.text || "No response text.");
        localStorage.setItem("lectureMedia", JSON.stringify(result.media || {}));

        generateLectureVideo();
    } catch (error) {
        console.error("Error fetching lecture:", error);
    }
}
