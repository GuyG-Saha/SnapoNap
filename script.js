const socket = io('http://localhost:8080');
const onStartButton = document.getElementById('onStart');
const roomContainer = document.getElementById('room-container');

const playersPerRoom = {};

/* The following condition is to check if user is on game page */
if (onStartButton != null) {
    const name = prompt('Please enter your name');
    socket.emit('new-user-name', roomName, name);

    onStartButton.addEventListener('click', e => {
        e.preventDefault();
        socket.emit('get-room-status', roomName);

        let message = '';
        if (name == null || name === "") {
            message = `User with socket id ${socket.id} started their game at ${roomName}!`;
        } else {
            message = `User ${name} started their game at ${roomName}!`;
        }
        socket.emit('game-started', roomName, message);
    });

    function emitEndGame() {
        if (name == null || name === "") {
            const message = `User with socket id ${socket.id} ended their game at ${roomName} 
            with ${displayScore.innerText} points!`;
            socket.emit('game-ended', roomName, message, socket.id)
        } else {
            const message = `User ${name} ended their game at ${roomName} with ${displayScore.innerText} points!`;
            socket.emit('game-ended', roomName, message, socket.id)
        }
    }
} else {
    socket.on('room-created', roomName => {
        const roomElement = document.createElement('div');
        roomElement.innerText = roomName;
        const roomLink = document.createElement('a');
        roomLink.href = `/${roomName}`;
        roomLink.innerText = 'Join';
        roomContainer.append(roomElement);
        roomContainer.append(roomLink);
    });
}

socket.on('welcome-message', data => {
    console.log(data);
    if (onStartButton != null) {
        closeNotifications();
    }
});

socket.on('user-connected', user => {
    console.log(`${user['name']} connected to room ${roomName}!`);
    showAlertOfUserStatuses(true, user['name']);
});

socket.on('user-disconnected', name => {
    console.log(`${name} has left the room`);
    showAlertOfUserStatuses(false, name);
});

socket.on('game-started', message => {
    console.log(message);
    startGame();
});

socket.on('game-ended', message => {
    console.log(message);
});