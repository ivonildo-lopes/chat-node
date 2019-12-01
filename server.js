const express = require('express');
const path = require('path')
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname,'public')));

app.get('/',(req,res) => {
    res.render('/index.html')
})

let mensagens = [];
let usuarios = [];

io.on('connection', socket => {

    // Método de resposta ao evento de entrar
	socket.on("entrar", function(apelido, callback){
        console.log('apelido '+ apelido)
        // console.log('call ' + callback)
		if(!(apelido in usuarios)){
			socket.apelido = apelido;
			usuarios[apelido] = socket; // Adicionadno o nome de usuário a lista armazenada no servidor

			// Enviar para o usuário ingressante as ultimas mensagens armazenadas.
			for(indice in mensagens){
				socket.emit("atualizar mensagens", mensagens[indice]);
			}

            let obj_mensagem = montaMensagem(apelido, " tou na Area", 'sistema' )

			io.sockets.emit("atualizar usuarios", Object.keys(usuarios)); // Enviando a nova lista de usuários
			io.sockets.emit("atualizar mensagens", obj_mensagem); // Enviando mensagem anunciando entrada do novo usuário

			armazenaMensagem(obj_mensagem); // Guardando a mensagem na lista de histórico

			callback(true);
		}else{
			callback(false);
		}
	});

	socket.on("enviar mensagem", function(dados, callback){
		let mensagem_enviada = dados.msg;
		let usuario = dados.usu;
		if(usuario == null)
			usuario = ''; // Caso não tenha um usuário, a mensagem será enviada para todos da sala
        
        let obj_mensagem = montaMensagem(socket.apelido, mensagem_enviada, '')

		if(usuario == ''){
			io.sockets.emit("atualizar mensagens", obj_mensagem);
			armazenaMensagem(obj_mensagem); // Armazenando a mensagem
		}else{
			obj_mensagem.tipo = 'privada';
			socket.emit("atualizar mensagens", obj_mensagem); // Emitindo a mensagem para o usuário que a enviou
			usuarios[usuario].emit("atualizar mensagens", obj_mensagem); // Emitindo a mensagem para o usuário escolhido
		}
		
		callback();
	});

	// socket.on("disconnect", function(){
	// 	delete usuarios[socket.apelido];
	// 	let mensagem =  socket.apelido + " saiu da sala";
	// 	let obj_mensagem = {msg: mensagem, tipo: 'sistema'};


	// 	// No caso da saída de um usuário, a lista de usuários é atualizada
	// 	// junto de um aviso em mensagem para os participantes da sala		
	// 	io.sockets.emit("atualizar usuarios", Object.keys(usuarios));
	// 	io.sockets.emit("atualizar mensagens", obj_mensagem);

	// 	armazenaMensagem(obj_mensagem);
	// });
   
})

// Função para guardar as mensagens e seu tipo na variável de ultimas mensagens
function armazenaMensagem(mensagem){
	if(mensagens.length > 5){
		mensagens.shift();
	}
	mensagens.push(mensagem);
}

function montaMensagem(apelido,mensagem,tipo) {
    mensagem_enviada =  apelido + " diz: " + mensagem;
    let obj_mensagem = {msg: mensagem_enviada, tipo: tipo};
    
    return obj_mensagem;
}

// escultando a porta
server.listen(3000, ()=> {
    console.log("Listening port 3000")
});