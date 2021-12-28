//Server and Socket setup
const express = require("express");                                                 //Node server using express
const app = express();
const port = 8080;
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);

//Paths setup
const path = require("path");
const staticSourcesFolder = path.join(process.cwd(), "Server", "static");           //absolute path for static folder
const dataFolder = path.join(process.cwd(), "Database", "data");                    //absolute path for data folder
//Database setup
const db = require("../Database/db.js");
const { messagesSchema } = require("../Database/schemas.js");


//___________________________________________________________________________________________

//Function to handle a client's connection ans disconnection
io.on("connection", (socket) => {
    console.log("Client connected at screen " + socket.handshake.query.screenNumber + " with socket id " + socket.client.id);
    //handle client in db
    db.handleClient(socket.handshake.query.screenNumber);

    socket.on('disconnect', () => {
        console.log("Client disconnect at screen " + socket.handshake.query.screenNumber + " with socket id " + socket.client.id);
        //handle client in db
        db.handleClient(socket.handshake.query.screenNumber);
    });
});


//Functions to handle a screen's first request
app.get("/:screen/", async (request, response) => {
    
    //Ignore favicon request
    if(request.url == '/favicon.ico') return;

    //handle screen in db
    var result = await db.handleScreen(request.params.screen);
    if (!result.ok) {
        response.send(result.info);
        return;
    }
    response.sendFile(path.join(staticSourcesFolder, "index.html"));
});

//Function to handle static files requests - js and css
app.get("/:screen/static/:folder/:srcFile", (request, response) => {
    response.sendFile(path.join(staticSourcesFolder, request.params.folder, request.params.srcFile));
});

//Function to handle screen's messages fetch request - json
app.get("/:screen/data.json", async (request, response) => {
    var result = await db.handleScreen(request.params.screen);
    response.send(result.info);
});

//Function to handle data files requests - templates and images 
app.get("/:screen/data/:folder/:dataFile", (request, response) => {
    response.sendFile(path.join(dataFolder, request.params.folder, request.params.dataFile));
});

//Main
main();
async function main() {
    await db.connectToDB();
    await db.initializeDB();
    httpServer.listen(port);
    console.log("Waiting for clients");
}



