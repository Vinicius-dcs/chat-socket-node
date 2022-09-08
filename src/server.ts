import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);

server.listen(process.env.PORT);

app.use(express.static(path.join(__dirname, '../public')));

interface users {
    userName: string;
}

let connectedUsers: Array<users> = [];

io.on('connection', (socket: any) => {
    console.log('Conexão detectada...');

    socket.on('join-request', (userName: users ) => {
        socket.userName = userName;
        connectedUsers.push(userName);
        console.log(connectedUsers);

        socket.emit('user-ok', connectedUsers);

        socket.broadcast.emit('list-update', {
            joined: userName,
            list: connectedUsers
        });
    });

    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(user => user != socket.userName);
        console.log(connectedUsers);

        socket.broadcast.emit('list-update', {
            left: socket.userName,
            list: connectedUsers
        })
    });

    socket.on('send-msg', (text: string) => {
        let data = {
            userName : socket.userName,
            message: text
        };

        socket.emit('show-msg', data);
        socket.broadcast.emit('show-msg', data);

    })

});