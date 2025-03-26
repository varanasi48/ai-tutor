async function generateVideo() {
    const text = document.getElementById("response")?.innerText;
    if (!text) {
        alert("No AI response available to generate video.");
        return;
    }

    const preloader = document.getElementById("preloader");
    if (preloader) {
        preloader.style.display = 'block';
        preloader.innerText = "⏳ Sending to Function App...";
    }

    try {
        // Fetch Function App URL and Key from GitHub Secrets
        const FUNCTION_APP_URL = "https://ai-tutor-video.azurewebsites.net/api/generate";
        const FUNCTION_KEY = process.env.FUNCTION_APP_KEY; // 🔹 Secret from GitHub

        if (!FUNCTION_KEY) {
            throw new Error("❌ Function key not found. Ensure it's set in GitHub Secrets.");
        }

        const response = await fetch(`${FUNCTION_APP_URL}?code=${FUNCTION_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error("❌ Failed to send data to Function App");
        }

        const result = await response.json();
        if (preloader) preloader.innerText = "⏳ Waiting for video from Function App...";

        await checkVideoStatus(result.videoRequestId);
    } catch (error) {
        console.error("❌ Error in Function App request:", error);
        if (preloader) preloader.innerText = "❌ Error processing request.";
    }
}
