let isPaused = false;
let slides = [];
let currentSlideIndex = 0;
let slideInterval;

// Fetch lecture text and split it into slides
function structureLecture(text) {
    slides = text.split(/\n\n|\.\s/); // Split at double line breaks or full stops
    currentSlideIndex = 0;
    updateSlide();
}

// Display the current slide with transition
function updateSlide() {
    if (slides.length === 0) return;
    
    let lectureContainer = document.getElementById("lectureContainer");
    lectureContainer.style.opacity = 0; // Start fade effect
    
    setTimeout(() => {
        lectureContainer.innerHTML = slides[currentSlideIndex];
        lectureContainer.style.opacity = 1; // Fade in text
    }, 500);
}

// Move to next slide
function nextSlide() {
    if (currentSlideIndex < slides.length - 1) {
        currentSlideIndex++;
        updateSlide();
    }
}

// Move to previous slide
function prevSlide() {
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
        updateSlide();
    }
}

// Auto-slide every 3 seconds
function startAutoSlide() {
    if (!isPaused) {
        slideInterval = setInterval(() => {
            if (currentSlideIndex < slides.length - 1) {
                nextSlide();
            } else {
                clearInterval(slideInterval);
            }
        }, 3000);
    }
}

// Toggle pause/resume
function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(slideInterval);
    } else {
        startAutoSlide();
    }
}
