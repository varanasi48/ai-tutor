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
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        const text = await response.text();
        console.log("Raw Response:", text); // Debugging

        let result;
        try {
            result = JSON.parse(text);
        } catch (error) {
            throw new Error("Response is not valid JSON");
        }

        if (!result || !result.text) {
            throw new Error("Invalid response format: Missing 'text' key");
        }

        console.log("Parsed Response:", result); // Debugging

        localStorage.setItem("lectureText", result.text);
        localStorage.setItem("lectureMedia", JSON.stringify(result.media || { images: [], videos: [] }));

        generateLectureVideo(); // Start generating video immediately
    } catch (error) {
        console.error("Error fetching lecture:", error);
    }
}
