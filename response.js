async function fetchLecture() {
    const question = document.getElementById("questionInput").value.trim();
    if (!question) {
        alert("❌ Please enter a question!");
        return;
    }

    const LOGIC_APP_URL = "https://prod-30.southindia.logic.azure.com:443/workflows/f6ad47edbaaf42b0a3b6e4816d8fbb73/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=c8sFzIKpt9E-VoiCZ46VuTosaiSZjQL0JkzmrxUWkV0";  // Replace with correct URL

    try {
        const response = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });

        const result = await response.json();
        console.log("🔍 API Response:", result); // Log the response

        const lectureText = result.answer || result.data?.response || "No valid response received.";
        document.getElementById("responseContainer").innerText = lectureText;

    } catch (error) {
        console.error("❌ API Request Failed:", error);
        document.getElementById("responseContainer").innerText = "❌ Failed to fetch lecture.";
    }
}
