document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("askAIButton").addEventListener("click", fetchLecture);
});

async function fetchLecture() {
    const question = document.getElementById("questionInput").value.trim();
    if (!question) {
        alert("❌ Please enter a question!");
        return;
    }

    const LOGIC_APP_URL = "https://prod-30.southindia.logic.azure.com:443/workflows/f6ad47edbaaf42b0a3b6e4816d8fbb73/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=c8sFzIKpt9E-VoiCZ46VuTosaiSZjQL0JkzmrxUWkV0"; // Replace with your Logic App URL
    const responseContainer = document.getElementById("responseContainer");
    responseContainer.innerHTML = "⏳ Fetching AI lecture...";

    try {
        const response = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });

        const result = await response.json();
        console.log("🔍 API Response:", result);

        if (!result.answer) {
            throw new Error("Missing 'answer' in API response");
        }

        responseContainer.innerHTML = `<p>${result.answer}</p>`;
        localStorage.setItem("lectureText", result.answer);

        // Show the video button
        document.getElementById("generateVideoButton").style.display = "block";
    } catch (error) {
        console.error("❌ Error:", error);
        responseContainer.innerHTML = "❌ Failed to fetch lecture!";
    }
}
