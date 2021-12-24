//Server setup
const express = require("express");                                                 //Node server using express
var app = express();
const port = 8080;
//Paths setup
const path = require("path");
const staticSourcesFolder = path.join(process.cwd(), "Server", "static");           //absolute path for static folder
const dataFolder = path.join(process.cwd(), "Database", "data");                    //absolute path for data folder
//Database setup
const db = require("../Database/db.js");

//___________________________________________________________________________________________

//Functions to handle the screen's main page
//Set static files - js and css
app.use("/:screen", express.static(staticSourcesFolder));
//Send main page
app.get("/:screen", (request, response) => {
    response.sendFile(path.join(staticSourcesFolder, "index.html"));
});

//Function to handle screen's messages fetch request - json
app.get("/:screen/data.json", async (request, response) => {
    var data = await db.messages.find({ screens: parseInt(request.params.screen) });
    response.send(data);
});

//Function to handle data files requests - templates and images 
app.get("/:screen/:folder/:srcFile", (request, response) => {
    response.sendFile(path.join(dataFolder, request.params.folder, request.params.srcFile));
});

//Main
main();
async function main() {
    await db.connectToDB();
    //await db.initializeDB();
    app.listen(port);
}



