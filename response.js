<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Tutor</title>
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: black;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
        }
        input, button {
            padding: 10px;
            font-size: 16px;
            margin-bottom: 10px;
        }
        #preloader {
            display: none;
            font-size: 20px;
            color: yellow;
            font-weight: bold;
        }
        #canvasContainer {
            width: 100%;
            height: 80vh;
            display: none;
            position: relative;
        }
        canvas {
            width: 100%;
            height: 100%;
            background: black;
        }
        #pauseBtn {
            margin-top: 10px;
            padding: 10px;
            font-size: 18px;
            background: red;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        #pauseBtn:hover {
            background: darkred;
        }
    </style>
</head>
<body>

    <div class="container">
        <input type="text" id="question" placeholder="Enter your question">
        <button onclick="fetchLecture()">Ask AI</button>
        <div id="preloader">⏳ Generating Lecture...</div>
        <button id="pauseBtn" onclick="togglePause()">Pause</button>
    </div>

    <div id="canvasContainer">
        <canvas id="lectureCanvas"></canvas>
    </div>

    <script defer src="response.js"></script>

</body>
</html>
