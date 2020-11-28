const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const PORT = process.env.PORT || 8080;
const MAX_ROOMS = 3;


app.use('/js', express.static(__dirname + '/js'));
app.use('/style', express.static(__dirname + '/style'));
app.use('/public', express.static(__dirname + '/public'));
app.use('/root', express.static(__dirname + '/'));
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('view options', { layout: true } );


// const players = {};
const rooms = {};
let scores = {};


server.listen(PORT, () => {
    console.log(`Server is running on Port ${PORT}`)
});

app.get('/', (request, response) => {
    response.render('index', {rooms: rooms});
});

app.get('/:room', (request, response) => {
    if (rooms[request.params.room] != null)
        response.render('room', { roomName: request.params.room })
    else
        response.redirect('/')
});

app.post('/room', (request, response) => {
    if (request.body.room !== "" && request.body.room != null) {
        if (rooms[request.body.room] != null || rooms.length >= MAX_ROOMS) {
            return response.redirect('/')
        }
        rooms[request.body.room] = { players: {}, pivotSocketId: null, isBusy: false, countFinished: 0 };
        response.redirect(request.body.room);
        // Emit new message that a new room was created
        io.emit('room-created', request.body.room)
    } else {
        return response.redirect('/')
    }
});

io.on('connection', socket => {
    console.log(`New user connected with socket id ${socket.id}`);
    socket.emit('welcome-message', `Welcome to SnapONap!`);

    socket.on('game-started', (room, message) => {
        console.log(`Message from client: ${message}`);
        socket.join(room);
        const game_starts_message = `Game starts at ${room}!`;
        rooms[room].isBusy = true;
        socket.to(room).broadcast.emit('game-started', game_starts_message);
        scores[room] = [];
        rooms[room].countFinished = 0;
    });

    socket.on('get-room-status', roomName => {
       console.log(`Get room status for room ${roomName}: ${rooms[roomName].isBusy}`);
    });

    socket.on('game-ended', (room, message, socket_id) => {
        console.log(`Message from client at ${room}: ${message}`);
        scores[room].push({ Score: getScoreByMessage(message), Socket_Id: socket_id });
        console.log(scores[room]);
        socket.join(room);
        rooms[room].isBusy = false;
        socket.to(room).broadcast.emit('game-ended', message);
        rooms[room].countFinished++;
        let n = Object.keys(rooms[room].players).length;
        if (rooms[room].countFinished === n && n > 1) {
            let winningSocketId = getWinningSocketId(scores[room]);
            io.to(winningSocketId).emit('winner-message', 'You won!');
            socket.to(room).broadcast.emit('the-winner-is', rooms[room].players[winningSocketId]);
        }
    });

    socket.on('disconnect', () => {
        getUserRooms(socket).forEach(room => {
            socket.to(room).broadcast.emit('user-disconnected', rooms[room].players[socket.id]);
            delete rooms[room].players[socket.id];
        });
        console.log(`User with socket id ${socket.id} disconnected`);
    });

    socket.on('new-user-name', (room, name) => {
        let isPivot = false;
        socket.join(room);
        rooms[room].players[socket.id] = name;
        if (Object.keys(rooms[room].players).length === 1) {
            isPivot = true;
            console.log(`${name} is the pivot in room ${room}`);
            rooms[room].pivotSocketId = socket.id;
            io.to(socket.id).emit('pivot-message', `You are the Pivot of room ${room}! Set the speed and version for games in this room`);
            console.log(rooms[room]);
        }

        socket.to(room).emit('user-connected', name, isPivot)
    });

    socket.on('is-pivot-player', (room, playerSocket) => {
        if (rooms[room].pivotSocketId === playerSocket.id)
            console.log(`This is the pivot user of room ${room}`);
        else
            console.log(`Not the pivot`);
    });

});

function getUserRooms(socket) {
    return Object.entries(rooms).reduce((names, [name, room]) => {
        if (room.players[socket.id] != null)
            names.push(name);
        return names
    }, [])
}


function getScoreByMessage(message) {
    return message.split(" ").slice(-2)[0];
}

function getWinningSocketId(scores) {
    let max = 0;
    let socket_id = null;
    scores.forEach( scoreObject => {
        if (scoreObject['Score'] > max) {
            max = scoreObject['Score'];
            socket_id = scoreObject['Socket_Id'];
        }
    });
    return socket_id
}

