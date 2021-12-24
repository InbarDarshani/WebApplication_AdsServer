//Database wrapper module

//MongoDB setup
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const connectionURL = "mongodb://127.0.0.1:27017/";
const databaseName = "ads";

//Models
var Message;
var Screen;
var Client;

var { messagesSchema, screensSchema, clientsSchema } = require("./schemas.js");
var { messagesData, screensData } = require("./init_data.js");

//DB methods
exports.connectToDB = async function connectToDB() {
    try {
        await mongoose.connect(connectionURL + databaseName);
        console.log("Connected successfully to db server");

        Message = mongoose.model('Message', new Schema(messagesSchema));
        Screen = mongoose.model('Screen', new Schema(screensSchema));
        Client = mongoose.model('Client', new Schema(clientsSchema));
        exports.messages = Message;
        exports.screens = Screen;
        exports.clients = Client;

    } catch (error) { console.error(`Something went wrong: ${error}`); }
}

exports.initializeDB = async function initializeDB() {
    //Add messages data  
    result = await Message.insertMany(messagesData);
    console.log(`Messages data added:\n ${result}`);

    //Add screens data  
    result = await Screen.insertMany(screensData);
    console.log(`Screens data added:\n ${result}`);
}

//Not Working
// exports = {
//     connectToDB: connectToDB(),
//     initializeDB: initializeDB(),
//     messages: Message,
//     screens: Screen,
//     clients: Client
// }

