const io = require('socket.io')(8001, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const users = {};

io.on('connection', socket => {
    console.log('New client connected');
    
    // Update all clients with new user count
    const updateUserCount = () => {
        io.emit('user-count', Object.keys(users).length);
    };

    socket.on('new-user-joined', name => {
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
        updateUserCount();
    });

    socket.on('send', message => {
        socket.broadcast.emit('receive', { 
            message: message, 
            name: users[socket.id]
        });
    });

    socket.on('disconnect', () => {
        if (users[socket.id]) {
            socket.broadcast.emit('user-left', users[socket.id]);
            delete users[socket.id];
            updateUserCount();
            console.log('User disconnected');
        }
    });
});

console.log('Server is running on http://localhost:8001');