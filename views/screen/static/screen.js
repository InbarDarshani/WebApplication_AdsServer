const screenNumber = window.location.pathname.split("/")[2];
const url = window.location.origin;
const params = new URLSearchParams(window.location.search);

//--- Socket setup ---
//Ignore the connection if its only for peeking the screen content 
if (params.get("connectionType") != "peek") {
    const socket = io(url, {
        query: {
            "clientType": "screen",
            "screenNumber": screenNumber,
        }
    });
    socket.on('refresh display', () => refresh());
    socket.on('deleted screen', () => {
        alert("This screen was turned off by the manager");
        window.location = '/';
        socket.disconnect();
    });
}

//--- Page setup and styling ---
$('#datePicker').datetimepicker({
    format: 'dddd DD/MM/YYYY',
    defaultDate: new Date(),
    showTodayButton: true
});
$("#navbarTitle").html("Screen " + screenNumber);
$("title").html("Screen " + screenNumber);

//--- Message content loading ---
var messagesFromServer = [];
var htmlTemplates = {};
var messagesInterval;
var timeOut;
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
    var response = await fetch("/screen/" + screenNumber + "/data.json");
    var responseToJson = await response.json();

    //Filter messages according to date
    messagesFromServer = responseToJson.filter(function (message) {
        if (message.visableInTimeFrames.length == 0) return true;

        var flags = [];
        for (tf of message.visableInTimeFrames) {
            if (tf.dateRange.from == "" && tf.dateRange.to == "") {
                flags.push(tf.weekDays.includes(currentWeekDay));
                continue;
            }

            var from = new Date(tf.dateRange.from.split('/').reverse().join('/'));
            var to = new Date(tf.dateRange.to.split('/').reverse().join('/'));

            if (tf.dateRange.from == "") {
                flags.push(tf.weekDays.includes(currentWeekDay) && currentDate <= to);
                continue;
            }
            if (tf.dateRange.to == "") {
                flags.push(tf.weekDays.includes(currentWeekDay) && from <= currentDate);
                continue;
            }

            flags.push(tf.weekDays.includes(currentWeekDay) && (from <= currentDate && currentDate <= to));
        }
        return flags.includes(true);
    })

    //Fetch current messages templates in advance
    for (m of messagesFromServer) {
        var response = await fetch("/file/templates/" + m.template);
        var responseToText = await response.text();
        htmlTemplates["" + m.template] = responseToText;
    }

    //Debug log
    //console.log("Messages before filter\n", responseToJson);
    //console.log("Messages after filter\n", messagesFromServer);
    //console.log("Templates after filter\n", htmlTemplates);
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
    $("#template").html(htmlTemplates[message.template]);
    for (const imgName of message.images) {
        $("#images").append("<img class='lazy' data-src=/file/images/" + imgName + "/>");
    }
    $('.lazy').Lazy();

    for (const tf of message.visableInTimeFrames) {
        $("#timeFrames").append("Visable ");
        if (tf.dateRange.from != "")
            $("#timeFrames").append("since " + tf.dateRange.from);
        if (tf.dateRange.to != "")
            $("#timeFrames").append(" until " + tf.dateRange.to)
        $("#timeFrames").append(" On weekdays - " + tf.weekDays + '<br>');
    }
}

function resetScreen() {
    $(".header").hide();
    $("#template").html("");
    $("#images").empty();
    $("#timeFrames").empty();
}

const sleep = (seconds) => new Promise(resolve => timeOut = setTimeout(resolve, seconds * 1000));
async function countdown(seconds) {
    clearTimeout(timeOut);
    $("#countdown-number").html(seconds);
    for (let i = seconds; i >= 0; i--) {
        $("#countdown-number").html(i);
        await sleep(1);
    }
}
