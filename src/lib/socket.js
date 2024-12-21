// import { Server } from "socket.io";

// import { createServer } from 'node:http';



// const server = createServer(app);
// const io = new Server(server
//     // ,{
//     // cors : {
//     //     origin : ["http://localhost:5173"],
//     //     credentials : true
//     // }}
// );

// export function getReceiverSocketId(userId) {
//     return usersSocketMap[userId];
//   }
// const usersSocketMap = {}

// io.on('connection', (socket) => {
//     console.log('a user connected',socket.id);

//     const userId = socket.handshake.query.userId ;
//     if(userId) usersSocketMap[userId] = socket.id ;

//     io.emit("getUsers", Object.keys(usersSocketMap))


//     socket.on("disconnected",() => {
//         console.log("A user disconnected", socket.id)
//         delete usersSocketMap[userId];
//         io.emit("getOnlineUsers", Object.keys(usersSocketMap));
//     })
//   });




  