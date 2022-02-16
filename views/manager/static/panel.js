//--- Socket setup ---
const url = window.location.origin;
const socket = io(url, { query: { "clientType": "manager" } });
socket.on('refresh data', () => refresh());

//------ SCREENS DASHBOARD ------
//--- Bootstrap Table Setup ---
//Style row according to connection status
function rowStyle(row, index) {
    if (row.active == true)
        return { css: { color: 'green' } }
    else
        return { css: { color: 'red' } }
}
//Table operate column formatter
function operateScreensFormatter(value, row, index) {
    return [
        '<a class="removeScreenRow" href="javascript:void(0)" title="Remove">',
        '<i class="fas fa-power-off"></i>',
        '</a>'
    ].join('');
}
//Table row details formatter
function screenView(index, row) {
    return ('<iframe class="container-fluid" height="400" src="' + url + "/screen/" + row.screenNumber + '/?connectionType=peek"></iframe>');
}
//Table operate column event handlers
window.operateScreensEvents = {
    'click .removeScreenRow': function (e, value, row, index) {
        $.ajax({
            url: '/manager/screenDelete/',
            type: 'POST',
            method: "POST",
            data: { screen: row.screenNumber },
            error: function (request, status, error) { alert(request.responseText) },
            success: function () { refresh(); },
        });
    }
}

//------ MESSAGES ACTIONS ------
//--- Bootstrap Table Setup ---
//Table row details formatter
function detailFormatter(index, row) {
    var html = []
    $.each(row, function (key, value) {
        if (value == undefined) return;
        if (key == "visableInTimeFrames") {
            if (value.length == 0)
                return ('<p><b>timeFrames:</b> Any </p>');
            for (tf of value) {
                html.push('<p>' + '<b>timeFrames:</b> ' + 'weekDays' + ': ' + tf.weekDays);
                html.push(' dateRange' + ': ' + tf.dateRange.from + ' - ' + tf.dateRange.to + '</p> <br>');
            }
        }
        else if (key == "images") {
            html.push('<div><b>' + 'images' + ':</b> ');
            for (img of value)
                html.push("<img width='auto' height='100' src=/file/images/" + img + "/>");
            html.push('</div>');
        }
        else
            html.push('<p><b>' + key + ':</b> ' + value + '</p>');
    })
    return html.join('');
}

//Table time frames formatter
function timeFramesFormatter(value, row, index) {
    var html = [];
    if (value.length == 0) {
        return ('<p> Any </p>');
    }
    for (tf of value) {
        html.push('<p>' + 'WeekDays' + ': ' + tf.weekDays + '</p>');
        html.push('<p>' + 'DateRange' + ': ' + tf.dateRange.from + ' - ' + tf.dateRange.to + '</p>');
    }
    return html.join('');
}

//Table operate column formatter
function operateFormatter(value, row, index) {
    return [
        '<a class="editRow" href="javascript:void(0)" title="Edit">',
        '<i class="fa fa-edit fa-lg"></i>',
        '</a>  ',
        '<a class="removeRow" href="javascript:void(0)" title="Remove">',
        '<i class="fa fa-trash fa-lg"></i>',
        '</a>'
    ].join('');
};

//Table operate column event handlers
window.operateEvents = {
    'click .editRow': function (e, value, row, index) { editMessageModal(row); },
    'click .removeRow': function (e, value, row, index) { deleteMessageModal([row]); }
}

//--- Global Varaiables and functions ---
var screensNumbers = [];
function getScreensNumbers() { screensNumbers = ($("#screensTable").bootstrapTable('getData')).map(s => s.screenNumber); }
var messagesNames = [];
function getMessagesNames() { messagesNames = ($("#messagesTable").bootstrapTable('getData')).map(m => m.messageName); }
function refresh() {
    $("#screensTable").bootstrapTable('refresh');
    $("#messagesTable").bootstrapTable('refresh');
    console.log("Data Refreshed");
}

//--- Json Form Setup ---

var jsonFormSchema = {
    messageName: { required: true, type: 'string', title: "Message Name", description: "Set a unique name for your management" },
    title: { type: 'string', title: "Title", description: "Set the title appears on the top of the message content" },
    template: { type: 'string', title: "Template", enum: ["templateA.html", "templateB.html", "templateC.html"] },
    textFields: { type: 'array', title: "Text Fields", items: { type: 'string' }, description: "Enter the message content" },
    images: { type: 'array', title: "Images", items: { type: 'file' } },
    visableFor: { required: true, type: 'integer', title: "Visability time in seconds (5 - 120)", description: "Set how log will the message be displayed in the messages loop, 5 seconds - 2 minutes" },
    visableInTimeFrames: {
        title: "Time Frames", description: "Construct the time frames of the message visability",
        type: 'array', items: {
            type: 'object', properties: {
                weekDays: { type: 'array', title: "WeekDays", items: { type: 'string', enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] } },
                dateRange: { type: 'object', notitle: true, properties: { from: { title: "Starting", type: 'date' }, to: { title: "Ending", type: 'date' } } }
            }
        }
    },
}
var jsonFormSettings = [
    "*",
    {
        "type": "actions",
        "htmlClass": "modal-footer",
        "items": [
            {
                "type": "submit",
                "title": "Submit",
                "htmlClass": "btn btn-primary",
            },
            {
                "type": "button",
                "title": "Cancel",
                "htmlClass": 'btn btn-secondary" data-dismiss="modal"',
                "onClick": function (event) { $('.modal').modal('hide'); $('form').empty(); }
            }
        ]
    }
]
var jsonFormValues = {}

function jsonFormOnSubmitAdd(errors, values) {
    //Validate message name is unique 
    if (messagesNames.includes(values.messageName)) {
        $("#resultAdd").html('Message with this name already exists');
        return false;
    }
    if (errors) {
        $("#resultEdit").html(errors);
        return false;
    }

    //Submit form
    var formData = new FormData($("#addMessageJsonForm")[0]);
    $.ajax({
        url: '/manager/messageForm/?method=create',
        type: 'POST',
        method: "POST",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        error: function (request, status, error) { $("#resultAdd").html(request.responseText); },
        success: function () {
            refresh();
            $("#addMessageModal").modal('hide');
            $("#addMessageJsonForm").empty();
        }
    });
}

function jsonFormOnSubmitEdit(errors, values) {
    if (errors) {
        $("#resultEdit").html(errors);
        return false;
    }

    //Submit form
    var formData = new FormData($("#editMessageJsonForm")[0]);
    $.ajax({
        url: '/manager/messageForm/?method=update',
        type: 'POST',
        method: "POST",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        error: function (request, status, error) { $("#resultEdit").html(request.responseText); },
        success: function () {
            refresh();
            $("#editMessageModal").modal('hide');
            $("#editMessageJsonForm").empty();
            $("#edit").prop('disabled', true);
        }
    });
}

//--- Modals setup ---
var tobeDeleted = []
function deleteMessageModal(rows) {
    for (r of rows) { tobeDeleted.push(r.messageName); }
    $('#deleteMessageModal').modal();
}
function addMessageModal() {
    jsonFormValues = {}
    jsonFormSchema.messageName.readOnly = false;
    //create a json form
    $("#addMessageJsonForm").jsonForm({
        schema: jsonFormSchema,
        form: jsonFormSettings,
        value: jsonFormValues,
        onSubmit: jsonFormOnSubmitAdd
    });
    $("[name=visableFor]")[0].min = 5;
    $("[name=visableFor]")[0].max = 120;

    //open modal
    $('#addMessageModal').modal('show');
}
function editMessageModal(row) {
    jsonFormValues = row;
    jsonFormSchema.messageName.readOnly = true;

    //format dates to match the editing form
    for (var tf of row.visableInTimeFrames) {
        var from = tf.dateRange.from.split('/').reverse().join('-');
        var to = tf.dateRange.to.split('/').reverse().join('-');
        tf.dateRange.from = from;
        tf.dateRange.to = to;
    }
    //create a json form
    $("#editMessageJsonForm").jsonForm({
        schema: jsonFormSchema,
        form: jsonFormSettings,
        value: jsonFormValues,
        onSubmit: jsonFormOnSubmitEdit
    });
    $("[name=visableFor]")[0].min = 5;
    $("[name=visableFor]")[0].max = 120;

    //open modal
    $('#editMessageModal').modal();
}

//--- Bootstrap multiple select setup ---
$("#screensSelect").multiselect({
    nonSelectedText: () => "Select Screens",
    includeSelectAllOption: true,
    enableResetButton: true,
});

$(document).ready(function () {
    //Update global varaiables after tables loads
    //Set multiple select after screen data loads successfuly
    $("#screensTable").on('load-success.bs.table', function () {
        getScreensNumbers();
        //Set screen assign selection options from table
        var screensOptions = screensNumbers.map(s => { return { label: "Screen " + s, value: s } });
        $("#screensSelect").multiselect('dataprovider', screensOptions);
    })
    $("#messagesTable").on('load-success.bs.table', function () { getMessagesNames(); })

    //--- Buttons listeners setup ---
    //Add screen button
    $("#newScreenNumber").change(function () {
        $("#addScreen").prop('disabled', ($("#newScreenNumber")[0].value == ""));
        $("#newScreenError").prop('hidden', true);
    })
    $("#addScreen").click(function () {
        var newScreenNumber = $("#newScreenNumber")[0].valueAsNumber;
        if (screensNumbers.includes(newScreenNumber)) {
            $("#newScreenError").html("Screen Number is taken!");
            $("#newScreenError").prop('hidden', false);
        }
        else {
            $.ajax({
                url: '/manager/screenAdd/',
                type: 'POST',
                method: 'POST',
                data: { screen: newScreenNumber },
                error: function (request, status, error) { alert(request.responseText) },
                success: function () { refresh(); },
            });
        }
    })

    //Messages table Checkboxes events
    $("#messagesTable").on('check.bs.table uncheck.bs.table ' + 'check-all.bs.table uncheck-all.bs.table', function () {
        var numOfSelected = $("#messagesTable").bootstrapTable('getSelections').length;
        $("#removeMessage").prop('disabled', !(numOfSelected > 0));
        $("#editMessage").prop('disabled', !(numOfSelected == 1));
        $("#screensAssign").prop('disabled', !(numOfSelected > 0));
    })

    //--- Toolbar Butttons ---
    //Add message button
    $("#addMessage").click(function () { addMessageModal(); })

    //Edit message button
    $("#editMessage").click(function () {
        var row = $("#messagesTable").bootstrapTable('getSelections')[0];
        editMessageModal(row);
    })

    //Remove message button
    $("#removeMessage").click(function () {
        var rows = $("#messagesTable").bootstrapTable('getSelections');
        deleteMessageModal(rows);
    });

    //Assign screens button
    $("#screensAssign").click(function () {
        var selectedMessagesNames = $("#messagesTable").bootstrapTable('getSelections').map(m => m.messageName);
        var selectedScreensNumbers = $('#screensSelect option:selected').toArray().map(s => s.value);
        $.ajax({
            url: '/manager/assignMessages/',
            type: 'POST',
            method: "POST",
            data: { messages: selectedMessagesNames, screens: selectedScreensNumbers },
            error: function (request, status, error) { alert(request.responseText) },
            success: function () { refresh(); $("#screensAssign").prop('disabled', true); }
        });
    });

    //--- Modals Butttons ---
    //Confirm button on message delete modal
    $("#confirmDelete").click(function () {
        $.ajax({
            url: '/manager/messageDelete/',
            type: 'POST',
            method: 'POST',
            data: { "messages": tobeDeleted },
            success: function () {
                refresh();
                $("#remove").prop('disabled', true);
                $("#deleteMessageModal").modal('hide');
            },
        });
    });
    //Cancel button on message delete modal
    $("#cancelDelete").click(function () {
        tobeDeleted = [];
    });
});

