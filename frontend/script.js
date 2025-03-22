async function generateLecture() {
    const question = document.getElementById('question').value;
    if (!question) {
        alert('Please enter a question!');
        return;
    }

    document.getElementById('lectureText').innerText = 'Generating...';
    document.getElementById('mediaContent').innerHTML = '';
    document.getElementById('lectureVideo').src = '';

    try {
        const response = await fetch("https://ai-video.azurewebsites.net/api/generateLecture", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ question })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        document.getElementById('lectureText').innerText = data.lecture || 'No lecture generated.';

        if (data.media && data.media.length) {
            data.media.forEach(url => {
                const mediaElement = url.endsWith('.mp4') 
                    ? `<video src="${url}" controls></video>` 
                    : `<img src="${url}" alt="Reference Image">`;
                document.getElementById('mediaContent').innerHTML += mediaElement;
            });
        }

        if (data.video) {
            document.getElementById('lectureVideo').src = data.video;
        }
    } catch (error) {
        document.getElementById('lectureText').innerText = 'Error generating lecture.';
        console.error("Error:", error);
    }
}

// Ensure function is globally accessible
window.generateLecture = generateLecture;
