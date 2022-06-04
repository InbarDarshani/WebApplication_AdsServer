//--- Database module ---

//MongoDB setup
const mongoose = require('mongoose');
const connectionURL = "mongodb://127.0.0.1:27017/";
const databaseName = "ads";

//Models
var Message;
var Screen;
var User;

//Schemas and Data
var { messageSchema, screenSchema, userSchema } = require("./db_schemas");
var { messagesData, screensData, usersData } = require("./db_init");

//DB methods
exports.connectToDB = async () => {
    try {
        await mongoose.connect(connectionURL + databaseName);
        console.log("Connected successfully to db server");

        Message = mongoose.model('Message', messageSchema);
        Screen = mongoose.model('Screen', screenSchema);
        User = mongoose.model('User', userSchema);

        exports.messages = Message;
        exports.screens = Screen;
        exports.users = User;

        if ((await mongoose.connection.db.listCollections().toArray()).length === 0)
            initializeDB();

        initializeScreensStatus();

    } catch (error) { console.error(`Something went wrong: ${error}`); }
}

async function initializeDB() {
    try {
        //Add messages data  
        await Message.insertMany(messagesData);
        console.log("Messages initial data added");

        //Add screens data  
        await Screen.insertMany(screensData);
        console.log("Screens initial data added");

        //Add users data  
        await User.insertMany(usersData);
        console.log("Users initial data added");

    } catch (error) { console.error(`Something went wrong: ${error}`); }
}

async function initializeScreensStatus() {
    await Screen.updateMany({}, { active: false });
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
    if (!exists && active) {
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
    try {
        //Get screen's messages
        var query = await Message.find({ screens: screenNumber });
        var data = query.map(doc => doc.toJSON());
        return data;
    } catch (error) { throw new Error("DB ERROR - cant get data of screen " + screenNumber + " " + error); }
}

exports.authenticateUser = async (username, password) => {
    try {
        var user = await User.findOne({ username: username }).exec();
    } catch (error) { throw new Error("DB ERROR - cant get user" + username + " " + error); }

    if (!user)
        throw new Error("User does not exist");

    var isMatch = await user.validatePassword(password);
    if (!isMatch)
        throw new Error("Wrong Password");

    return user;
}

exports.addUser = async (user) => {
    var exists = await User.exists({ username: user.username });
    if (exists)
        throw new Error("Username " + user.username + " already exists");
    try {
        var newUser = new User(user);
        await newUser.save();
    } catch (error) { throw new Error("DB ERROR - cant add user " + user + " " + error); }
}

exports.editUser = async (user, updatedUser) => {
    try {
        //In case there was no password changing attempt
        if (updatedUser.password == "")
            delete updatedUser.password;

        //In case there was username changing attempt
        if (user.username != updatedUser.username) {
            var exists = await User.exists({ username: updatedUser.username });
            if (exists)
                throw new Error("Username " + updatedUser.username + " already exists");
        }

        await User.findOneAndUpdate({ username: user.username }, { $set: updatedUser }).exec('update');
    } catch (error) { throw new Error("DB ERROR - cant edit user " + user + " " + error); }
}

exports.getAllScreens = async () => {
    try {
        var query = await Screen.find({});
        var data = query.map(doc => doc.toJSON());

        //Add messages name for each screen
        for (let s of data) {
            var query2 = await Message.find({ screens: s.screenNumber }).exec();
            s.messagesNames = query2.map(m => m.messageName);
        }
        return data;
    } catch (error) { throw new Error("DB ERROR - cant get screens" + " " + error); }
}

exports.getAllMessages = async () => {
    try {
        var query = await Message.find({ active: true });
        var data = query.map(doc => doc.toJSON());
        return data;
    } catch (error) { throw new Error("DB ERROR - cant get messages" + " " + error); }
}

exports.addMessage = async (message) => {
    try {
        var newMessage = new Message(message);
        await newMessage.save();
        console.log("New Message added " + message.messageName);
    } catch (error) { throw new Error("DB ERROR - cant add message " + message.messageName + " " + error); }
}

exports.updateMessage = async (message) => {
    var messageName = message.messageName;
    delete message.messageName;
    try {
        await Message.findOneAndUpdate({ messageName: messageName }, message);
    } catch (error) { throw new Error("DB ERROR - cant update message " + message.messageName + " " + error); }
}

exports.deleteMessages = async (messagesNames) => {
    try {
        //Safe delete one message
        if (typeof messagesNames == 'string') {
            await Message.delete({ messageName: messagesNames }).exec();
            await Message.findOneAndUpdateDeleted({ messageName: messagesNames }, { messageName: messagesNames + "_DELETED" });
            console.log("Message " + message.messageName + " safely deleted");
            return;
        }
        //Safe delete few message
        for (let m of messagesNames) {
            await Message.delete({ messageName: m }).exec();
            await Message.findOneAndUpdateDeleted({ messageName: m }, { messageName: m + "_DELETED" });
        }
    } catch (error) { throw new Error("DB ERROR - cant delete message\\s " + messagesNames + " " + error); }
}

exports.assignScreensToMessages = async (screens, messages) => {
    try {
        if (!screens) screens = [];
        //Update one message
        if (typeof messages == 'string') {
            await Message.findOneAndUpdate({ messageName: messages }, { screens: screens });
            return;
        }
        //Update multiple message
        for (m of messages)
            await Message.findOneAndUpdate({ messageName: m }, { screens: screens });
    } catch (error) { throw new Error("DB ERROR - cant assign screens " + screens + " to messages " + messages + " " + error); }
}

exports.addScreen = async (screenNumber) => {
    var exists = await Screen.exists({ screenNumber: screenNumber });
    if (exists)
        throw new Error("Screen " + screenNumber + " already exists");
    try {
        Screen.create({ screenNumber: screenNumber });
        console.log("New Screen added " + screenNumber);
    } catch (error) { throw new Error("DB ERROR - cant add screen " + screenNumber + " " + error); }
}

exports.deleteScreen = async (screenNumber) => {
    try {
        //Remove one screen from db
        await Screen.deleteOne({ screenNumber: screenNumber }).exec();
        //Remove screen from all messages
        await Message.updateMany({ screens: screenNumber }, { $pull: { screens: screenNumber } });
        console.log("Screen " + screenNumber + " completely deleted");
    } catch (error) { throw new Error("DB ERROR - cant delete screen " + screenNumber + " " + error); }
}