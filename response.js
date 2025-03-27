async function fetchAiResponse() {
    const question = document.getElementById("questionInput").value.trim();
    const responseContainer = document.getElementById("responseContainer");
    const loadingIndicator = document.getElementById("loading");

    if (!question) {
        responseContainer.innerHTML = "❌ Please enter a question!";
        return;
    }

    loadingIndicator.style.display = "block";
    responseContainer.innerHTML = ""; // Clear previous response

    const LOGIC_APP_URL = "https://prod-30.southindia.logic.azure.com:443/workflows/f6ad47edbaaf42b0a3b6e4816d8fbb73/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=c8sFzIKpt9E-VoiCZ46VuTosaiSZjQL0JkzmrxUWkV0"; // Replace with actual Logic App URL

    try {
        const response = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: question })
        });

        const result = await response.json();

        console.log("🔍 Full API Response:", result); // ✅ Debugging step

        if (!result.answer) {
            console.error("❌ Invalid Response Format:", result);
            throw new Error("Missing 'answer' key in API response");
        }

        responseContainer.innerHTML = `<p>${result.answer}</p>`;
    } catch (error) {
        console.error("❌ Error Fetching AI Response:", error);
        responseContainer.innerHTML = "❌ Error: Unable to fetch response!";
    } finally {
        loadingIndicator.style.display = "none";
    }
}
