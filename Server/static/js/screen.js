const screenNumber = window.location.pathname.split("/")[1];
const url = window.location.origin;
const socket = io(url, {
    query: {
        "screenNumber": screenNumber
    }
});

var messagesFromServer;
getFromServerJson();

async function getFromServerJson() {
    const jsonPromise = await fetch("/" + screenNumber + "/data.json");
    messagesFromServer = await jsonPromise.json();

    //Calc interval out of total messages time
    let interval = 0;
    for (const message of messagesFromServer) {
        interval += message.visableFor;
    }

    //Display messages loop
    if (messagesFromServer.length !== 0) {
        messsagesLoop();
        setInterval(messsagesLoop, interval * 100);
    }
    else{
        $(".header").html("No Messages found for this Screen");
    }
}

async function messsagesLoop() {
    for (const message of messagesFromServer) {
        displayMessage(message);
        await sleep(message.visableFor);
    }
}

function displayMessage(message) {
    $(".header").hide();
    $("#template").load(message.template, () => {
        $("#title").html(message.title);
        $("#textFields").html(message.textFields);

        var imagesElements = [];
        for (const imgSrc of message.images) {
            var img = '<img src="' + imgSrc + '">'
            imagesElements.push(img);
        }
        $("#images").html(imagesElements)
    });
}
const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 100));
