const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors')

const PORT = process.env.PORT || 5000

const router = require('./router')

const app = express()
const server = http.createServer(app)

let corsOptions={
    cors: true,
    origins:[process.env.FRONTEND_DOMAIN],
}
const io = socketio(server, corsOptions);

let users = []

const addUser = (user_name, socketId) => {
    !users.some((user) => user.user_name === user_name) &&
    users.push({user_name, socketId})
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
}

//Find user
const getUser = (user_name) => {
    return users.find(user => user.user_name === user_name)
}


io.on('connection', (socket) => {
    console.log('new connection')

    socket.on("addUser", (user_name) => {
        addUser(user_name, socket.id)
        io.emit("getUsers",users)
    })

    //send and get message
    socket.on('sendMessage', ({senderId, receiverId, text}) => {

        const user = getUser(receiverId)
        io.to(user.socketId).emit('getMessage', {senderId, text})
    })

    socket.on('disconnect', ()=> {
        console.log('user disconnected')
        removeUser(socket.id)
    })
})

app.use(router)

server.listen(PORT, () => console.log(`server is listening on ${PORT}`))