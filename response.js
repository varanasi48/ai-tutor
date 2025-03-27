async function fetchLecture() {
    const question = document.getElementById("question").value;
    if (!question) {
        alert("Please enter a question");
        return;
    }

    const LOGIC_APP_URL = "https://prod-30.southindia.logic.azure.com:443/workflows/f6ad47edbaaf42b0a3b6e4816d8fbb73/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=c8sFzIKpt9E-VoiCZ46VuTosaiSZjQL0JkzmrxUWkV0";

    document.getElementById("generateVideoButton").style.display = "none";

    try {
        const response = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });

        if (response.ok) {
            const result = await response.json();
            processLecture(result);
        } else {
            alert("Failed to fetch lecture.");
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }
}

function processLecture(result) {
    if (!result?.answer) {
        alert("No lecture content available.");
        return;
    }

    sessionStorage.setItem("lectureContent", JSON.stringify(result));
    generateVideo(); // Auto-trigger video generation
}
