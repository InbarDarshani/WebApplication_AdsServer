//--- Moduls and varaiables setup ---
//Server and Socket setup
const express = require("express");                                     //Node server using express
const app = express();
const port = 8080;
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);

//Paths setup
const path = require("path");
const fs = require('fs');
const viewsFolder = path.join(process.cwd(), "views");                  //Absolute path for html pages
const publicFolder = path.join(process.cwd(), "public");                //Absolute path for public folder
const dataFolder = path.join(process.cwd(), "database");                //Absolute path for data files folder

//Database setup
const db = require("./db");

//Post requests setup
const multer = require('multer');
const storage = multer.diskStorage({
    destination: path.join(dataFolder, "images"),
    filename: function (req, file, cb) { cb(null, file.originalname.replace(/\s+/g, '')); }
})
const upload = multer({ storage: storage });
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

//Exspress server setup
app.use(express.static(publicFolder));                                  //serving public file
app.set('view engine', 'ejs');                                          //templating language
app.use(bodyParser.urlencoded({ extended: false }));                    //for parsing the incoming data
app.use(bodyParser.json());                                             //for parsing the JSON object from POST
app.use(cookieParser());
app.use(session({ secret: "Your secret key" }));        //TODO: secret key?

//--- Screen \ Manager Sockets ---
var connectedScreensSockets = {}
//Function for a client's connection and disconnection
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
//Socket connection and disconnection handlers
function screenConnection(screenNumber, socket) {
    console.log("Screen Client connected, screen number: " + screenNumber + ", socket id: " + socket.id);
    socket.join("screens");
    //handle screen in db
    db.handleScreen(screenNumber, true);
    connectedScreensSockets["" + screenNumber] = socket.id;
    io.to("managers").emit('refresh data');
}
function screenDisconnection(screenNumber, socket) {
    console.log("Screen Client disconnected, screen number: " + screenNumber + ", socket id: " + socket.id);
    //handle client in db
    db.handleScreen(screenNumber, false);
    delete connectedScreensSockets.screenNumber;
    io.to("managers").emit('refresh data');
}
function managerConnection(socket) { console.log("Manager Client connected, socket id: " + socket.id); socket.join("managers"); }
function managerDisconnection(socket) { console.log("Manager Client disconnected, socket id: " + socket.id); }

//--- API ---
//Function to handle root/any
app.get("/", async (request, response) => { response.sendFile(path.join(viewsFolder, "home.html")); });

//Function to handle file requests
app.get("/file/:type/:filename", (request, response) => {
    if (request.params.type == "templates" || request.params.type == "images")
        response.sendFile(path.join(dataFolder, request.params.type, request.params.filename));
    else
        response.status(500).send("Cannot find file");
});

//--- Screen Responses ---
//Function to handle screen's page
app.use("/screen/:screenNumber", express.static(path.join(viewsFolder, "screen", "static")));
app.get("/screen/:screenNumber", async (request, response) => {
    if (!await db.isActive(request.params.screenNumber) || request.query.connectionType == "peek")
        response.render("./screen/screen");
    else
        response.render("./partials/error", { error: "This Screen is already connected elsewhere" });
});
//Function to handle screen's messages fetch request - json
app.get("/screen/:screenNumber/data.json", async (request, response) => {
    try {
        var data = await db.getScreenData(request.params.screenNumber);
        response.json(data);
    } catch (error) { response.status(500).send(error.message); }
});

//--- Manager authentication Responses ---
app.get("/manager/register/", (request, response) => { response.render("./manager/register", { error: "" }); });
app.get("/manager/login/", (request, response) => { response.render("./manager/login", { error: "" }); });
app.get("/manager/logout/", (request, response) => { request.session.destroy(); response.sendFile(path.join(viewsFolder, "home.html")); });
app.get("/manager/profile/", (request, response) => {
    if (!request.session.user)
        response.redirect("/manager/login");
    else
        response.render("./manager/profile", { error: "", user: request.session.user });
});
app.post("/manager/authenticate/", upload.array(), async (request, response) => {
    if (!request.body.username || !request.body.password)
        response.render("./manager/login", { error: "Please enter both username and password" });

    if (request.query.method == "login") {
        try {
            var user = await db.authenticateUser(request.body.username, request.body.password);
            request.session.user = user;
            response.redirect("/manager/panel");
        } catch (error) { response.render("./manager/login", { error: error.message }); }
    }

    if (request.query.method == "register") {
        var newUser = {
            firstName: request.body.firstName,
            lastName: request.body.lastName,
            username: request.body.username,
            password: request.body.password
        };
        try {
            await db.addUser(newUser);
            request.session.user = newUser;
            response.redirect("/manager/panel");
        } catch (error) { response.render("./manager/register", { error: error.message }); }
    }
});
app.post("/manager/editUser/", upload.array(), async (request, response) => {
    try {
        await db.editUser(request.session.user, request.body);
        request.session.destroy();
        response.redirect("/manager/login");
    } catch (error) { response.render("./manager/profile", { error: error.message, user: request.session.user }); }
});

//--- Manager Responses ---
app.use("/manager/panel/", express.static(path.join(viewsFolder, "manager", "static")));
app.get("/manager/panel/", async (request, response) => {
    //Check the user is signed in
    if (!request.session.user)
        response.redirect("/manager/login");
    else
        response.render("./manager/panel", { fullname: request.session.user.firstName + " " + request.session.user.lastName });
});
//Functions to handle manager's data fetch
app.get("/manager/allScreens.json", async (request, response) => {
    try {
        var data = await db.getAllScreens();
        response.json(data);
    } catch (error) { response.status(500).send(error.message); }
});
app.get("/manager/allMessages.json", async (request, response) => {
    try {
        var data = await db.getAllMessages();
        response.json(data);
    } catch (error) { response.status(500).send(error.message); }
});

//--- Messages Actions ---
app.post("/manager/messageForm/", upload.any(), async (request, response) => {
    try {
        var message = {};
        var timeFrames = {};

        //Setup images names
        if (request.files.length > 0)
            message.images = request.files.map(f => f.originalname.replace(/\s+/g, ''));

        for (const [key, value] of Object.entries(request.body)) {
            if (value) {
                if (key.includes("visableInTimeFrames")) {
                    var tfIndex = key.split('[')[1].split(']')[0];
                    var tf = Object.entries(request.body).filter(([k, v]) => { return k.includes("visableInTimeFrames[" + tfIndex + "]") }).map(([k, v]) => ([k.replace(/visableInTimeFrames\[[0-9]+\]\./, ''), v]));
                    var tfWeekDays = tf.filter(([k, v]) => { return k.includes("weekDays") }).map(([k, v]) => v);
                    var tfDateRange = Object.fromEntries(tf.filter(([k, v]) => { return k.includes("dateRange") }).map(([k, v]) => ([k.replace(/dateRange\./, ''), v])));
                    //message.visableInTimeFrames.push({ weekDays: tfWeekDays, dateRange: tfDateRange });
                    timeFrames[`${tfIndex}`] = { weekDays: tfWeekDays, dateRange: tfDateRange };
                }
                else
                    message[`${key}`] = value;
            }
        }
        message.visableInTimeFrames = Object.values(timeFrames);
        console.log(timeFrames);

        //Receives a message object
        if (request.query.method == "create")
            await db.addMessage(message);
        if (request.query.method == "update")
            await db.updateMessage(message);
        response.sendStatus(200);
        io.to("screens").emit('refresh display');
    } catch (error) { response.status(500).send(error.message); }
});
app.post("/manager/messageDelete/", async (request, response) => {
    try {
        //Receives messages names array
        await db.deleteMessages(request.body["messages[]"]);
        response.sendStatus(200);
        io.to("screens").emit('refresh display');
    } catch (error) { response.status(500).send(error.message); }
});

app.post("/manager/assignMessages/", async (request, response) => {
    try {
        await db.assignScreensToMessages(request.body["screens[]"], request.body["messages[]"]);
        response.sendStatus(200);
        io.to("screens").emit('refresh display');
        io.to("managers").emit('refresh data');
    } catch (error) { response.status(500).send(error.message); }
});
app.post("/manager/screenAdd/", async (request, response) => {
    try {
        await db.addScreen(request.body["screen"]);
        response.sendStatus(200);
    } catch (error) { response.status(500).send(error.message); }
});
app.post("/manager/screenDelete/", async (request, response) => {
    try {
        await db.deleteScreen(request.body["screen"]);
        response.sendStatus(200);
        io.to(connectedScreensSockets[request.body["screen"]]).emit('deleted screen');
        io.to("managers").emit('refresh data');
    } catch (error) { response.status(500).send(error.message); }
});

//--- Main ---
main();
async function main() {
    await db.connectToDB();
    httpServer.listen(port);
    console.log("Waiting for clients");
}



