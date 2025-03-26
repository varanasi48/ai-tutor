document.addEventListener("DOMContentLoaded", () => {
    const generateButton = document.getElementById("generateVideoButton");
    if (generateButton) {
        generateButton.addEventListener("click", generateVideo);
    }
});

async function generateVideo() {
    const text = document.getElementById("response")?.innerText;
    if (!text) {
        alert("No AI response available to generate video.");
        return;
    }

    const preloader = document.getElementById("preloader");
    if (preloader) {
        preloader.style.display = 'block';
        preloader.innerText = "⏳ Sending request...";
    }

    try {
        // Fetch Azure Function Key from Environment Variable
        const FUNCTION_KEY = process.env.AZURE_FUNCTION_KEY;  // Injected via GitHub Actions
        const FUNCTION_APP_URL = `https://ai-tutor-video.azurewebsites.net/api/generate?code=${FUNCTION_KEY}`;

        const response = await fetch(FUNCTION_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error("Failed to send data to Function App");
        }

        const result = await response.json();
        await checkVideoStatus(result.videoRequestId);
    } catch (error) {
        console.error("❌ Error in Function App request:", error);
        if (preloader) preloader.innerText = "❌ Error processing request.";
    }
}
