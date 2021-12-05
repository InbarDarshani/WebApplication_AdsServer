//Server setup
const express = require("express");                                                 //Node server using express
var app = express();
const port = 8080;
//Paths setup
const path = require("path");
const staticSourcesFolder = path.join(process.cwd(), "Server", "static");           //absolute path for static folder
const dataFolder = path.join(process.cwd(), "Server", "data");                      //absolute path for data folder
//Database setup
const { MongoClient } = require("mongodb");
const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "ads";
const client = new MongoClient(connectionURL);
var db;

//___________________________________________________________________________________________

//Functions to handle the screen's main page
//Set static files - js and css
app.use("/:screen",express.static(staticSourcesFolder));
//Send main page
app.get("/:screen", (request, response) => {
    response.sendFile(path.join(staticSourcesFolder, "index.html"));
});

//Function to handle screen's messages fetch request - json
app.get("/:screen/data.json", async (request, response) => {
    var data = await db.collection("messages").find({ screens: parseInt(request.params.screen) }).toArray();
    response.send(data);
});

//Function to handle data files requests - templates and images 
app.get("/:screen/:folder/:srcFile", (request, response) => {
    response.sendFile(path.join(dataFolder,request.params.folder, request.params.srcFile));
});
   
async function connectToDatabase() {
    try {
        // Connect the client to the server      
        await client.connect();
        db = await client.db(databaseName);
        console.log("Connected successfully to db server");
    } catch (error) {
        console.error(`Something went wrong: ${error}`);
    }
}

//Main
connectToDatabase().then(function () {
    app.listen(port);
})



