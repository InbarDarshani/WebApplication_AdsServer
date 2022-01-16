//____
//Server and Socket setup
const express = require("express");                                                 //Node server using express
const app = express();
const port = 8080;
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);

//Paths setup
const path = require("path");
const fs = require('fs');
const viewsFolder = path.join(process.cwd(), "views");                  //absolute path for html pages
const publicFolder = path.join(process.cwd(), "public");                //absolute path for public folder
const dataFolder = path.join(process.cwd(), "database", "data");        //absolute path for data files folder

//Database setup
const db = require("./db");

//Forms setup
const multer = require('multer');
const upload = multer({ dest: path.join(dataFolder, "images") });
var bodyParser = require('body-parser');

//____

//Exspress server setup
app.set('view engine', 'ejs');                          //templating language
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());                             //for parsing the JSON object from POST

//--- Screen \ Manager Socket ---
//Function to handle a client's connection and disconnection
io.on("connection", (socket) => {
    if (socket.handshake.query.clientType == "screen")
        screenConnection(socket.handshake.query.screenNumber, socket);

    if (socket.handshake.query.clientType == "manager")
        managerConnection(socket);

    socket.on('disconnect', () => {
        if (socket.handshake.query.clientType == "screen")
            screenDisconnection(socket.handshake.query.screenNumber, socket);

        if (socket.handshake.query.clientType == "manager")
            managerDisconnection(socket);
    });
});

function screenConnection(screenNumber, socket) {
    //Ignore the connection if its only for peeking the screen content 
    if (socket.handshake.query.connectionType == "peek") return;
    console.log("Screen Client connected, screen number: " + screenNumber + ", socket id: " + socket.client.id);
    //handle screen in db
    db.handleScreen(screenNumber, true);
}
function screenDisconnection(screenNumber, socket) {
    if (socket.handshake.query.connectionType == "peek") return;
    console.log("Screen Client disconnected, screen number: " + screenNumber + ", socket id: " + socket.client.id);
    //handle client in db
    db.handleScreen(screenNumber, false);
}
function managerConnection(socket) {
    console.log("Manager Client connected, socket id: " + socket.client.id);
}
function managerDisconnection(socket) {
    console.log("Manager Client disconnected, socket id: " + socket.client.id);
}

//___
//---API---
//Function to handle root/any
app.get("/", async (request, response) => {
    response.sendFile(path.join(viewsFolder, "home.html"));
});
app.get("/:any", async (request, response) => {
    var pathCheck = path.join(publicFolder, request.params.any);
    if (fs.existsSync(pathCheck))
        response.sendFile(pathCheck);
    else
        response.sendFile(path.join(viewsFolder, "home.html"));
});

//Function to handle file requests
app.get("/file/:type/:filename", (request, response, next) => {
    if (request.params.type == "templates" || request.params.type == "images")
        response.sendFile(path.join(dataFolder, request.params.type, request.params.filename));
});

//____
//---Screen Responses---
//Function to handle screen's page
app.use("/screen/:screenNumber", express.static(path.join(viewsFolder, "screen", "static")));
app.get("/screen/:screenNumber", async (request, response) => {
    if (! await db.isActive(request.params.screenNumber))
        response.render("./screen/screen");
    else
        response.render("./partials/error", { error: "This Screen is already connected elsewhere" });
});

//Function to handle screen's messages fetch request - json
app.get("/screen/:screenNumber/data.json", async (request, response) => {
    var data = await db.getScreenData(request.params.screenNumber);
    response.json(data);
});

//___
//---Manager Responses---
//Function to handle manager's first page
app.get("/manager/panel/", async (request, response) => {
    response.render("./manager/login", { error: "" });
});
//Function to handle manager's admin user authentication
app.post("/manager/panel/", upload.none(), async (request, response) => {
    try {
        var user = await db.authenticateUser(request.body.username, request.body.password);
        app.use("/manager/panel/", express.static(path.join(viewsFolder, "manager", "static")));
        response.render("./manager/panel", { fullname: user.fullName });
    } catch (error) {
        response.render("./manager/login", { error: error });
    }
});

//Functions to handle screen's manager data fetch
app.get("/manager/allScreens.json", async (request, response) => {
    var data = await db.getAllScreens();
    response.json(data);
});
app.get("/manager/allMessages.json", async (request, response) => {
    var data = await db.getAllMessages();
    response.json(data);
});

app.post("/manager/messageForm/", upload.any(), async (request, response) => {
    //Receives a message object
    if (request.query.method == "create")
        await db.addMessage(request.body);
    if (request.query.method == "update")
        await db.updateMessage(request.body);

    response.sendStatus(200);
});
app.post("/manager/messageDelete/", upload.none(), async (request, response) => {
    //Receives messages names array
    await db.deleteMessages(request.body["messages[]"]);
    response.sendStatus(200);
});

//___
//---Main---
main();
async function main() {
    await db.connectToDB();
    httpServer.listen(port);
    console.log("Waiting for clients");
}



