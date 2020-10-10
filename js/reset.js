function resetGame() {
    numOfWords = 1;
    extraTime = 0;
    resetInput();
    resetScore();
    resetTime();
    hideResultsStartRadio();
    restAlertOfWrittenWords();
}

function resetInput() {
    insertedWord.value = '';
    insertedWord.placeholder = 'Type here...'
    insertedWord.disabled = false;
    insertedWord.focus();
}

function resetScore() {
    score = 0;
    displayScore.innerHTML = score;
}

function resetTime() {
    time = chosenTime + extraTime;
    displayTimeLeft.innerHTML = time;
}

function hideResultsStartRadio() {
    displayResults.style.display = 'none';
    onStart.style.display = 'none';
    settingsRules.style.display = 'block';
    radioVersion.style.display = 'none';
    radioTimes.style.display = 'none';
}


function endGame() {
    disableInput();
    showResultsStartRadio();
    saveResults();
    showAlertOfWrittenWords();
    emitEndGame();
}

function saveResults() {
    const lastResults = { points: score };
    if (localStorage.getItem('lastResults')) {
        const lastPoints = JSON.parse(localStorage.getItem('lastResults')).points;
        if (score > lastPoints) {
            brokeARecord.innerHTML = `YOU BROKE A RECORD! (${version} Version).`;
            localStorage.setItem('lastResults', JSON.stringify(lastResults));
        } else {
            brokeARecord.innerHTML = '';
        }
    } else {
        localStorage.setItem('lastResults', JSON.stringify(lastResults));
    }
}

function disableInput() {
    insertedWord.placeholder = 'Game Over!';
    insertedWord.disabled = true;
}

function showResultsStartRadio() {
    displayResults.innerHTML = insertedArr.length + ' Stages, ' + version + ' Version, ' + chosenTime + ' Sec Speed';
    displayResults.style.display = 'block';
    onStart.innerHTML = 'Again';
    onStart.style.display = 'block';
    settingsRules.style.display = 'none';
    radioVersion.style.display = 'block';
    radioTimes.style.display = 'block';
}

function showAlertOfWrittenWords() {
    if (insertedArr.length) {
        alertWrittenWords.style.display = 'block';
        closeAlert.addEventListener('click', () => {
            alertWrittenWords.style.display = 'none';
        });
        let output = '';
        insertedArr.forEach(word => {
            output += `*${word} `
        });
        writtenWords.innerHTML = output;
    } 
}

function restAlertOfWrittenWords() {
    insertedArr = [];
    writtenWords.innerHTML = '';
    alertWrittenWords.style.display = 'none';
}

 function closeNotifications() {
     closeNotification.addEventListener('click', () => {
         console.log('try to close');
         alertRoomEvents.style.display = 'none';
     });
 }

function showAlertOfUserStatuses(joined, name) {
        alertRoomEvents.style.display = 'block';
        let output = '';

        if (joined === true) {
            output = `User ${name} has joined the room!`;
        } else
            output = `User ${name} has left the room!`;

        alertNotifications.innerHTML = output;
        setTimeout(function () {
            console.log('setTimeout try to close');
            alertRoomEvents.style.display = 'none';
        }, 2800);
}