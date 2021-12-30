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

//___________________________________________________________________________________________

//Function to handle a screen's first request
app.get("/:screen", async (request, response) => {
    //Ignore favicon request
    if (request.url == '/favicon.ico') return;
    //handle screen in db
    await db.handleScreen(request.params.screen);
    //send main page
    response.sendFile(path.join(staticSourcesFolder, "screen.html"));
});

//Function to handle a client's connection and disconnection
io.on("connection", (socket) => {
    console.log("Client connected with screen " + socket.handshake.query.screenNumber + " and socket id " + socket.client.id);
    //handle client in db
    db.handleScreen(socket.handshake.query.screenNumber);

    socket.on('disconnect', () => {
        console.log("Client disconnect with screen " + socket.handshake.query.screenNumber + " and socket id " + socket.client.id);
        //handle client in db
        db.handleScreen(socket.handshake.query.screenNumber, false);
    });
});

//Function to handle static files requests - js and css
app.get("*/static/:folder/:srcFile", (request, response) => {
    response.sendFile(path.join(staticSourcesFolder, request.params.folder, request.params.srcFile));
});
//Function to handle data files requests - templates and images
app.get("*/data/:folder/:dataFile", (request, response) => {
    response.sendFile(path.join(dataFolder, request.params.folder, request.params.dataFile));
});

//Function to handle screen's messages fetch request - json
app.get("/:screen/data.json", async (request, response) => {
    var data = await db.handleScreen(request.params.screen);
    response.json(data);
});

//Function to main page request
app.get("/", async (request, response) => {
    response.sendFile(path.join(staticSourcesFolder, "manage.html"));
});

//Main
main();
async function main() {
    await db.connectToDB(); 
    httpServer.listen(port);
    console.log("Waiting for clients");
}



