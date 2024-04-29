function socketHandler(socket) {
    // Al conectarse se envía mensaje a todos los usuarios
    console.log('New client connected:', socket.id);
    socket.broadcast.emit("textit", {
        status: "ok",
        text: "Nuevo usuario conectado: " + socket.id
    });

    // Queda a la espera de recibir mensajes para reenviarlos a todos los usuarios
    socket.on('textit', (msg) => {
        socket.broadcast.emit('textit', msg);
    });

    // Al desconectarse, hacer console.log
    socket.on('disconnect', () => console.log('Client disconnected'));
}

export default socketHandler;





