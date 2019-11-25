const express = require('express');
const path = require('path')
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname,'public')));
// app.set('views',path.join(__dirname,'public'));
// app.engine('html',require('ejs').renderFile);
// app.set('view engine','html')


app.get('/',(req,res) => {
    res.render('/index.html')
})

let mensagens = [];

// app.get('/',(req,res) => {
//     res.sendFile('/index.html')
// })

io.on('connection', socket => {
    // console.log(`socket connectado ${socket.id}`)
    /**
     * 1º ouve a mensagem que vem do frontend
     * 2º add no array de mensagens
     * 3º envia para todo mundo online
     */
    socket.on('sendMessage', data => {
        console.log('autor: ' + data.autor + ' mensagem: ' + data.message);
        mensagens.push(data)
        socket.broadcast.emit('exibiMessage', data)
    })

    // quando entrar mostrará toda a conversa
    socket.emit('mensagensAntigas', mensagens)

    // socket.on('teste', data => {
    //     console.log(data);
    //     socket.emit('tai', "ivonildo Lopes")
    // })

})

// escultando a porta
server.listen(3000, ()=> {
    console.log("Listening port 3000")
});