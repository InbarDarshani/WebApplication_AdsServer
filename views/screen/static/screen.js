const screenNumber = window.location.pathname.split("/")[2];
const url = window.location.origin;
const params = new URLSearchParams(window.location.search);
const socket = io(url, {
    query: {
        "clientType": "screen",
        "screenNumber": screenNumber,
        "connectionType": params.get("connectionType")      
    }
});

//---Page setup and styling---
$('#datePicker').datetimepicker({
    format: 'dddd DD/MM/YYYY',
    defaultDate: new Date(),
    showTodayButton: true
});
$("#navbarTitle").html("Screen " + screenNumber);
$("title").html("Screen " + screenNumber);

//---Message content loading---
var messagesFromServer = [];
var messagesInterval;
var currentDate = new Date();
var currentWeekDay = currentDate.toLocaleDateString("en-GB", { weekday: 'long' });

$(document).ready(function () {
    refresh();
    $("#setFakeDate").click(function () {
        currentDate = $('#datePicker').data("DateTimePicker").date()._d;
        currentWeekDay = currentDate.toLocaleDateString("en-US", { weekday: 'long' });
        $("#setFakeDate").prop('disabled', true);      
        refresh();
    })
})

async function refresh() {
    clearInterval(messagesInterval);
    await refreshMessages();
    await refreshDisplay();
    $("#setFakeDate").prop('disabled', false);
}

async function refreshMessages() {
    //Fetch messages info json file
    const response = await fetch("/screen/" + screenNumber + "/data.json");
    var responseToJson = await response.json();

    //filter according to date
    messagesFromServer = responseToJson.filter(function (message) {
        for (tf of message.visableInTimeFrames) {
            if (!tf.weekDays.includes(currentWeekDay))
                return false;
            var from = new Date(tf.dateRange.from.split('/').reverse().join('/'));
            var to = new Date(tf.dateRange.to.split('/').reverse().join('/'));
            if (!(from <= currentDate && currentDate <= to))
                return false;
        }
        return true;
    })

    //Debug log
    console.log(responseToJson);
    console.log(messagesFromServer);
}

async function refreshDisplay() {
    //Calc interval out of total messages time in seconds
    let interval = 0;
    for (const message of messagesFromServer) {
        interval += message.visableFor;
    }
    if (messagesFromServer.length == 1) interval = 60;

    //Set nav items
    $("#interval-number").html(interval);
    $("#messages-number").html(messagesFromServer.length);

    //Start loop
    await messsagesLoop();
    messagesInterval = setInterval(messsagesLoop, interval * 1000);
}

async function messsagesLoop() {
    if (messagesFromServer.length === 0) {
        $(".header").html("No Messages found for this Screen");
    }
    else {
        for (const message of messagesFromServer) {
            await displayMessage(message);
            //await sleep(message.visableFor);
            await countdown(message.visableFor);
        }
    }
}

async function displayMessage(message) {
    resetScreen();
    $("#title").html(message.title);
    $("#textFields").html(message.textFields);
    // $("#template").append("<div class='lazy' data-loader='ajax' data-src=/file/templates/" + message.template + "></div>");     //Lazy loading not working    
    $("#template").load("/file/templates/" + message.template);
    for (const imgName of message.images) {
        $("#images").append("<img class='lazy' data-src=/file/images/" + imgName + "/>");
    }
    $('.lazy').Lazy();

    for (const tf of message.visableInTimeFrames) {
        $("#timeFrames").append("Visable between " + tf.dateRange.from + " to " + tf.dateRange.to)
            .append(" On weekdays - " + tf.weekDays);
    }
}

function resetScreen() {
    $(".header").hide();
    $("#template").html("");
    $("#images").empty();
    $("#timeFrames").empty();
}

const sleep = (seconds) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

async function countdown(seconds){
    $("#countdown-number").html(seconds);
    for (let i = seconds; i >=0; i--){
        $("#countdown-number").html(i);
        await sleep(1.1);
    }
}
