const screenNumber = window.location.pathname.split("/")[1];
const url = window.location.origin;
const socket = io(url, {
    query: {
        "screenNumber": screenNumber
    }
});

var messagesFromServer;
var templateElements = [];
var imageElements = [];
main();

async function main() {
    //Fetch messages info json file
    const jsonResponse = await fetch("/" + screenNumber + "/data.json");
    messagesFromServer = await jsonResponse.json();

    //Calc interval out of total messages time in seconds
    let interval = 0;
    for (const message of messagesFromServer) {
        interval += message.visableFor;
    }

    //Display messages loop
    if (messagesFromServer.length === 0) {
        $(".header").html("No Messages found for this Screen");
    }
    else {
        //Start loop
        messsagesLoop();
        setInterval(messsagesLoop, interval * 1000);
    }
}

async function messsagesLoop() {
    for (const message of messagesFromServer) {
        await displayMessage(message);
        await sleep(message.visableFor);
    }
}

async function displayMessage(message) {
    resetScreen();
    $("#title").html(message.title);
    $("#textFields").html(message.textFields);
    $("#template").append("<div class='lazy' data-loader='ajax' data-src=/data/templates/" + message.template + "></div>");     //Lazy loading not working    
    for (const imgName of message.images) {
        $("#images").append("<img class='lazy' data-src=/data/images/" + imgName + "/>");
    }
    $('.lazy').Lazy();
}

function resetScreen() {
    $(".header").hide();
    $("#template").html("");
    $("#images").empty();
}

const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

//socket.on("update",)