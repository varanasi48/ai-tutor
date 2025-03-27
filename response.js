async function fetchLecture() {
    const question = document.getElementById("questionInput").value.trim();
    if (!question) {
        alert("❌ Please enter a question!");
        return;
    }

    const LOGIC_APP_URL = "https://prod-30.southindia.logic.azure.com:443/workflows/f6ad47edbaaf42b0a3b6e4816d8fbb73/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=c8sFzIKpt9E-VoiCZ46VuTosaiSZjQL0JkzmrxUWkV0"; // Replace with your Logic App trigger URL

    try {
        // Step 1: Trigger the Logic App
        const triggerResponse = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });

        const triggerResult = await triggerResponse.json();
        console.log("🔍 Logic App Triggered:", triggerResult);

        if (!triggerResult.id) {
            throw new Error("❌ Failed to start Logic App");
        }

        // Step 2: Poll the Workflow Run Status
        const RUN_STATUS_URL = `https://management.azure.com${triggerResult.id}/workflowRunActions?api-version=2016-10-01`;
        let lectureText = "Generating response...";

        for (let i = 0; i < 10; i++) {  // Try polling for ~10 seconds
            await new Promise(res => setTimeout(res, 2000));  // Wait 2 seconds

            const statusResponse = await fetch(RUN_STATUS_URL, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${YOUR_AZURE_BEARER_TOKEN}`
                }
            });

            const statusResult = await statusResponse.json();
            console.log("🔄 Checking Status:", statusResult);

            if (statusResult.status === "Succeeded" && statusResult.output) {
                lectureText = statusResult.output.answer;
                break;
            }
        }

        document.getElementById("responseContainer").innerText = lectureText;

    } catch (error) {
        console.error("❌ API Request Failed:", error);
        document.getElementById("responseContainer").innerText = "❌ Failed to fetch lecture.";
    }
}
