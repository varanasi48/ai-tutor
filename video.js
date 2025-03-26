// Load FFmpeg from WebAssembly (WASM)
async function loadFFmpeg() {
    // Ensure FFmpeg is available globally
    if (typeof FFmpeg.createFFmpeg === "undefined") {
        console.error("❌ FFmpeg.js not loaded! Check if it's included in index.html.");
        return null;
    }

    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });

    try {
        console.log("⏳ Loading FFmpeg...");
        await ffmpeg.load();
        console.log("✅ FFmpeg.js loaded successfully!");
        return ffmpeg;
    } catch (error) {
        console.error("❌ Failed to load FFmpeg.js:", error);
        return null;
    }
}

// Function to Generate Video with Scrolling Text
async function generateVideo() {
    const ffmpeg = await loadFFmpeg();
    if (!ffmpeg) return; // Stop if FFmpeg failed to load

    document.getElementById("response").innerText = "🎥 Generating video...";

    // Sample text overlay
    const lectureText = "Welcome to AI Tutor! This is a sample scrolling text for your lecture.";

    // Convert text to a file for FFmpeg processing
    ffmpeg.FS("writeFile", "lecture.txt", new TextEncoder().encode(lectureText));

    // Run FFmpeg to create a video with scrolling text
    await ffmpeg.run(
        "-f", "lavfi",
        "-i", "color=c=black:s=640x360:d=10", // Black background for 10 seconds
        "-vf", "drawtext=textfile=lecture.txt:fontcolor=white:fontsize=24:x=(w-text_w)/2:y=h-(t*20)", 
        "-t", "10", "-r", "30", "-preset", "fast", "-y", "output.mp4"
    );

    // Read generated video and create a downloadable URL
    const data = ffmpeg.FS("readFile", "output.mp4");
    const videoBlob = new Blob([data.buffer], { type: "video/mp4" });
    const videoUrl = URL.createObjectURL(videoBlob);

    // Display video on the webpage
    document.getElementById("response").innerHTML = `<video controls src="${videoUrl}" width="640"></video>`;
    console.log("🎬 Video generated successfully!");
}

// Attach event listener to button
document.getElementById("generateVideoBtn").addEventListener("click", generateVideo);
