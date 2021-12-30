//Database wrapper module

//MongoDB setup
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const connectionURL = "mongodb://127.0.0.1:27017/";
const databaseName = "ads";

//Models
var Message;
var Screen;
var File;

//Schemas and Data
var { messagesSchema, screensSchema, filesSchema, schemasOptions } = require("./schemas.js");
var { messagesData, screensData, filesData } = require("./data_init.js");
var MessagesSchema = new Schema(messagesSchema, schemasOptions);
var ScreensSchema = new Schema(screensSchema, schemasOptions);
var FilesSchema = new Schema(filesSchema, schemasOptions);

//DB methods
exports.connectToDB = async () => {
    try {
        await mongoose.connect(connectionURL + databaseName);
        console.log("Connected successfully to db server");
        Message = mongoose.model('Message', MessagesSchema);
        Screen = mongoose.model('Screen', ScreensSchema);
        File = mongoose.model('File', FilesSchema);
        exports.messages = Message;
        exports.screens = Screen;
        exports.files = File;

        if ((await mongoose.connection.db.listCollections().toArray()).length === 0)
            initializeDB();

    } catch (error) { console.error(`Something went wrong: ${error}`); }
}

async function initializeDB() {
    //Add messages data  
    result = await Message.insertMany(messagesData);
    console.log("Messages data added");

    //Add screens data  
    result = await Screen.insertMany(screensData);
    console.log("Screens data added");

    //Add files data  
    result = await File.insertMany(filesData);
    console.log("Files data added");
}

exports.handleScreen = async (screenNumber, active = true) => {
    var exists = await Screen.exists({ screenNumber: screenNumber });

    //Create screen
    if (!exists) {
        Screen.create({ screenNumber: screenNumber });
        console.log("New Screen added");
        return [];
    }

    //Set inactive
    if (!active) {
        await Screen.findOneAndUpdate({ screenNumber: screenNumber }, { active: false });
        return;
    }

    //Get screen's messages
    var quary = await Message.find({ screens: screenNumber });
    var data = quary.map(doc => doc.toJSON());

    return data;
}



