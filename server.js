<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View Flashcards</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        .container {
            max-width: 800px;
            width: 100%;
            margin: 0 auto;
            text-align: center;
            position: relative;
        }
        h1 {
            text-align: center;
        }
        .flashcard {
            width: 100%;
            max-width: 800px;
            height: 200px;
            background-color: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            margin: 20px 0;
            position: relative;
            perspective: 1000px;
            display: none;
        }
        .flashcard-inner {
            position: absolute;
            width: 100%;
            height: 100%;
            transition: transform 0.6s;
            transform-style: preserve-3d;
        }
        .flashcard.correct .flashcard-inner {
            transform: rotateY(180deg);
        }
        .flashcard-front, .flashcard-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
            text-align: center;
        }
        .flashcard-front {
            background-color: #fff;
            font-size: 24px;
            font-weight: bold;
        }
        .flashcard-back {
            background-color: green;
            color: white;
            transform: rotateY(180deg);
            font-size: 24px;
            font-weight: bold;
        }
        .options button {
            width: auto;
            margin: 5px;
            padding: 10px 15px;
            font-size: 16px;
        }
        .navigation {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
        }
        .score {
            margin-top: 20px;
            font-size: 20px;
        }
        .correct {
            background-color: green !important;
            color: white;
        }
        .incorrect {
            background-color: red !important;
            color: white;
        }
        .hide {
            display: none;
        }
    </style>
</head>
<body>

<div class="container">
    <h1>Flashcard Viewer</h1>
    <div id="flashcard" class="flashcard">
        <div class="flashcard-inner">
            <div class="flashcard-front" id="flashcard-front">
                <!-- Question will be displayed here -->
            </div>
            <div class="flashcard-back" id="flashcard-back">
                <!-- Correct message will be displayed here -->
                Correct!
            </div>
        </div>
    </div>
    <div class="options" id="options">
        <!-- Answer options will be generated here -->
    </div>
    <div class="navigation hide" id="navigation">
        <button onclick="previousFlashcard()" id="prevBtn" disabled>Previous</button>
        <button onclick="nextFlashcard()" id="nextBtn">Next</button>
    </div>
    <div class="score hide" id="scoreContainer">
        <span id="score">Score: 0/0</span>
    </div>
</div>

<script>
    let questions = [];
    let answers = [];
    let currentFlashcardIndex = 0;
    let score = 0;
    let attemptedQuestions = 0;
    let userSelections = {}; // Store user selections for each flashcard

    const flashcardId = window.location.pathname.split('/').pop();

    function fetchFlashcardSet() {
        fetch(`/flashcards/${flashcardId}`)
            .then(response => response.json())
            .then(data => {
                questions = data.questions;
                answers = data.answers;
                currentFlashcardIndex = 0;
                score = 0;
                attemptedQuestions = 0;
                userSelections = {}; // Reset user selections
                updateFlashcard();
                document.getElementById('score').innerText = `Score: ${score}/${attemptedQuestions}`;
                document.getElementById('flashcard').style.display = 'block';
                document.getElementById('navigation').classList.remove('hide');
                document.getElementById('scoreContainer').classList.remove('hide');
            })
            .catch(error => {
                console.error('Error fetching flashcard set:', error);
            });
    }

    function updateFlashcard() {
        const question = questions[currentFlashcardIndex];
        const answer = answers[currentFlashcardIndex].split('. ')[1].trim();

        const mainQuestion = question.split('\n')[0];
        document.getElementById('flashcard-front').innerHTML = mainQuestion;

        const optionsContainer = document.getElementById('options');
        optionsContainer.innerHTML = '';

        const options = question.split('\n').slice(1);
        options.forEach((option, index) => {
            const button = document.createElement('button');
            button.innerText = option;

            // Check if this option was previously selected by the user
            if (userSelections[currentFlashcardIndex] && userSelections[currentFlashcardIndex].selectedOption === option) {
                button.classList.add(userSelections[currentFlashcardIndex].isCorrect ? 'correct' : 'incorrect');
                button.disabled = true;
            }

            button.onclick = () => checkAnswer(button, option[0] === answer, option);
            optionsContainer.appendChild(button);
        });

        const flashcard = document.getElementById('flashcard');
        flashcard.classList.remove('correct', 'incorrect');
        if (userSelections[currentFlashcardIndex] && userSelections[currentFlashcardIndex].isCorrect) {
            flashcard.classList.add('correct');
        }
    }

    function checkAnswer(button, isCorrect, option) {
        if (!userSelections[currentFlashcardIndex]) {
            attemptedQuestions++;
        }

        userSelections[currentFlashcardIndex] = {
            selectedOption: option,
            isCorrect: isCorrect
        };

        if (isCorrect) {
            button.classList.add('correct');
            document.getElementById('flashcard').classList.add('correct');
            score++;
            disableOptions();
        } else {
            button.classList.add('incorrect');
        }

        document.getElementById('score').innerText = `Score: ${score}/${attemptedQuestions}`;
    }

    function disableOptions() {
        const buttons = document.querySelectorAll('.options button');
        buttons.forEach(button => button.disabled = true);
    }

    function nextFlashcard() {
        if (currentFlashcardIndex < questions.length - 1) {
            currentFlashcardIndex++;
            updateFlashcard();
            document.getElementById('prevBtn').disabled = false;

            if (currentFlashcardIndex === questions.length - 1) {
                document.getElementById('nextBtn').disabled = true;
            }
        }
    }

    function previousFlashcard() {
        if (currentFlashcardIndex > 0) {
            currentFlashcardIndex--;
            updateFlashcard();
            document.getElementById('nextBtn').disabled = false;

            if (currentFlashcardIndex === 0) {
                document.getElementById('prevBtn').disabled = true;
            }
        }
    }

    document.addEventListener('DOMContentLoaded', fetchFlashcardSet);
</script>

</body>
</html>
