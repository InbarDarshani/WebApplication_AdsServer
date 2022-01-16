//Database wrapper module

//MongoDB setup
const mongoose = require('mongoose');
const connectionURL = "mongodb://127.0.0.1:27017/";
const databaseName = "ads";
const mongoose_delete = require('mongoose-delete');

//Models
var Message;
var Screen;
var File;
var User;

//Schemas and Data
var { messageSchema, screenSchema, fileSchema, userSchema } = require("./db_schemas");
var { messagesData, screensData, filesData, usersData } = require("./db_init");

//DB methods
exports.connectToDB = async () => {
    try {
        await mongoose.connect(connectionURL + databaseName);
        console.log("Connected successfully to db server");

        Message = mongoose.model('Message', messageSchema);
        Screen = mongoose.model('Screen', screenSchema);
        File = mongoose.model('File', fileSchema);          //TODO:Save files in db
        User = mongoose.model('User', userSchema);

        exports.messages = Message;
        exports.screens = Screen;
        exports.files = File;
        exports.users = User;

        if ((await mongoose.connection.db.listCollections().toArray()).length === 0)
            initializeDB();

    } catch (error) { console.error(`Something went wrong: ${error}`); }
}

async function initializeDB() {
    try {
        //Add messages data  
        await Message.insertMany(messagesData);
        console.log("Messages data added");

        //Add screens data  
        await Screen.insertMany(screensData);
        console.log("Screens data added");

        //Add files data  
        await File.insertMany(filesData);
        console.log("Files data added");

        //Add users data  
        await User.insertMany(usersData);
        console.log("User data added");

    } catch (error) { console.error(`Something went wrong: ${error}`); }
}

exports.isActive = async (screenNumber) => {
    var exists = await Screen.exists({ screenNumber: screenNumber });
    if (!exists) return false;

    var screen = await Screen.findOne({ screenNumber: screenNumber }).exec();
    return screen.active;
}

exports.handleScreen = async (screenNumber, active) => {
    var exists = await Screen.exists({ screenNumber: screenNumber });

    //Create screen
    if (!exists) {
        Screen.create({ screenNumber: screenNumber, lastConnection: new Date() });
        console.log("New Screen added " + screenNumber);
        return [];
    }

    //Update screen's status
    await Screen.findOneAndUpdate({ screenNumber: screenNumber }, { active: active });
    if (!active) return;

    //Update screen's last connection
    if (active) await Screen.findOneAndUpdate({ screenNumber: screenNumber }, { lastConnection: new Date() });
}

exports.getScreenData = async (screenNumber) => {
    //Get screen's messages
    var query = await Message.find({ screens: screenNumber });
    var data = query.map(doc => doc.toJSON());
    return data;
}

exports.authenticateUser = async (username, password) => {
    var user = await User.findOne({ username: username }).exec();
    if (!user)
        throw new Error("User does not exist");

    var isMatch = await user.validatePassword(password);
    if (!isMatch)
        throw new Error("Wrong Password");

    return user;
}

exports.getAllScreens = async () => {
    var query = await Screen.find({});
    var data = query.map(doc => doc.toJSON());

    //Add messages name for each screen
    for (s of data) {
        var query2 = await Message.find({ screens: s.screenNumber }).exec();
        s.messagesNames = query2.map(m => m.messageName);
    }
    return data;
}

exports.getAllMessages = async () => {
    var query = await Message.find({ active: true });
    var data = query.map(doc => doc.toJSON());
    return data;
}

exports.addMessage = async (message) => {
    var newMessage = new Message(message);
    await newMessage.save()
}

exports.updateMessage = async (message) => {
    await Message.findOneAndUpdate(message.messageName, message);
}

exports.deleteMessages = async (messages) => {
    if (typeof messages == 'string') {
        await Message.delete({ messageName: messages }).exec();
        return;
    }
    for (m of messages)
        await Message.delete({ messageName: m }).exec();               //await Message.findOneAndUpdate(m , { deleted: true });
}

