async function fetchLecture() {
    const question = document.getElementById("question").value;
    if (!question) {
        alert("Please enter a question");
        return;
    }

    const LOGIC_APP_URL = "https://prod-30.southindia.logic.azure.com:443/workflows/f6ad47edbaaf42b0a3b6e4816d8fbb73/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=c8sFzIKpt9E-VoiCZ46VuTosaiSZjQL0JkzmrxUWkV0";

    document.getElementById("response").innerText = "⏳ Processing...";

    try {
        const response = await fetch(LOGIC_APP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question })
        });

        if (response.status === 202) {
            document.getElementById("response").innerText = "⏳ AI is thinking...";
            const location = response.headers.get("Location");
            if (location) {
                checkStatus(location);
            } else {
                document.getElementById("response").innerText = "❌ No result URL provided.";
            }
        } else if (response.status === 200) {
            const result = await response.json();
            console.log("✅ Received Response:", result);
            displayLecture(result);
        } else {
            document.getElementById("response").innerText = "❌ Error connecting to AI Tutor.";
        }
    } catch (error) {
        console.error("Fetch error:", error);
        document.getElementById("response").innerText = "❌ Request failed.";
    }
}

async function checkStatus(url) {
    try {
        const response = await fetch(url);
        if (response.status === 200) {
            const result = await response.json();
            displayLecture(result);
        } else {
            setTimeout(() => checkStatus(url), 3000);
        }
    } catch (error) {
        console.error("Polling error:", error);
        setTimeout(() => checkStatus(url), 3000);
    }
}

function displayLecture(result) {
    const responseContainer = document.getElementById("response");
    responseContainer.innerHTML = "";  

    if (!result?.answer) {
        responseContainer.innerText = "❌ No lecture content available.";
        return;
    }

    responseContainer.innerText = result.answer;
    console.log("✅ Lecture Content:", result.answer);
}
