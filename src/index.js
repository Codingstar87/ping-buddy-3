

import {app, server} from "./app.js";

import dotenv from "dotenv" ;
dotenv.config()

import connectDatabase from "./lib/db.js";
connectDatabase()







const port = process.env.PORT || 5432

server.listen(port,() => {
    console.log(`Server is listening on ${port}`)
})

