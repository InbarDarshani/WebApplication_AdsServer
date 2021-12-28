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

//Schemas and Data
var { messagesSchema, screensSchema, clientsSchema } = require("./schemas.js");
var { messagesData, screensData } = require("./data_init.js");
var MessagesSchema = new Schema(messagesSchema);
MessagesSchema.options.toJSON = {
    transform: (doc, ret) => {
        delete ret._id;
    }
};
var ScreensSchema = new Schema(screensSchema);
ScreensSchema.options.toJSON = {
    transform: (doc, ret) => {
        delete ret._id;
    }
};
var ClientsSchema = new Schema(clientsSchema);
ClientsSchema.options.toJSON = {
    transform: (doc, ret) => {
        delete ret._id;
    }
};

//DB methods
exports.connectToDB = async () => {
    try {
        await mongoose.connect(connectionURL + databaseName);
        console.log("Connected successfully to db server");
        Message = mongoose.model('Message', MessagesSchema);
        Screen = mongoose.model('Screen', new Schema(ScreensSchema));
        Client = mongoose.model('Client', new Schema(ClientsSchema));

        exports.messages = Message;
        exports.screens = Screen;
        exports.clients = Client;
    } catch (error) { console.error(`Something went wrong: ${error}`); }
}

exports.initializeDB = async () => {
    //Add messages data  
    result = await Message.insertMany(messagesData);
    console.log(`Messages data added:\n ${result}`);

    //Add screens data  
    result = await Screen.insertMany(screensData);
    console.log(`Screens data added:\n ${result}`);
}

exports.handleScreen = async (screenNumber) => {
    var exists = await Screen.exists({ screenNumber: screenNumber });

    //Create screen
    if (!exists) {
        Screen.create({ screenNumber: screenNumber });
        console.log("New Screen added");
        return ({ ok: false, info: "New Screen Added" });
    }

    //Get screen's messages
    var quary = await Message.find({ screens: screenNumber });
    var data = quary.map(doc => doc.toJSON());

    if (data.length == 0) {
        return ({ ok: false, info: "No Messages found for this Screen" });
    }

    return { ok: true, info: data };
}

exports.handleClient = async (screenNumber) => {
    var exists = await Client.exists({ screenNumber: screenNumber });

    //Create client
    if (!exists) {
        Client.create({ screenNumber: screenNumber, status: "Connected" });
        console.log("New Client added");
        return;
        //return ({ ok: false, info: "New Client Added" });
    }

    //Change existing client's status
    await Client.findOneAndUpdate({ screenNumber: screenNumber }, { status: "Connected", timeOfLastConnection: new Date() });
    return;
}


