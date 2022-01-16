//--- Socket setup ---
const url = window.location.origin;
const socket = io(url, {
    query: {
        "clientType": "manager"
    }
});

//___

//------ SCREENS DASHBOARD ------
//--- Bootstrap Table Setup ---
//Style row according to connection status
function rowStyle(row, index) {
    if (row.active == true) return { css: { color: 'green' } }
    else return { css: { color: 'red' } }
}
//Url column formatter
function screenUrlFormatter(value, row, index) {
    return [
        '<a id="viewScreen" href="' + url + "/screen/" + row.screenNumber + '/?connectionType=peek" target="_blank">',
        '<i class="fa fa-eye fa-lg"></i>',
        '</a>  '
    ].join('');
}
//Table row details formatter
function screenView(index, row) {
    return ('<iframe class="container-fluid" height="400" src="' + url + "/screen/" + row.screenNumber + '/?connectionType=peek"></iframe>');
}

//___

//------ MESSAGES ACTIONS ------
//--- Bootstrap Table Setup ---
//Table row details formatter
function detailFormatter(index, row) {
    var html = []
    $.each(row, function (key, value) {
        if (value == undefined) return;
        if (key == "visableInTimeFrames") {
            for (tf of value) {
                html.push('<p><b>' + 'weekDays' + ':</b> ' + tf.weekDays + '</p>');
                html.push('<p><b>' + 'dateRange' + ':</b> ' + tf.dateRange.from + ' - ' + tf.dateRange.to + '</p>');
            }
        }
        else if (key == "images") {
            for (img of value) {
                html.push('<div><b>' + 'images' + ':</b> ' + "<img width='auto' height='100' src=/file/images/" + img + "/>" + '</div>');
            }
        }
        else
            html.push('<p><b>' + key + ':</b> ' + value + '</p>');
    })
    return html.join('');
}

//Table time frames formatter
function timeFramesFormatter(value, row, index) {
    var html = [];
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
    'click .editRow': function (e, value, row, index) { editMessageForm(row); },
    'click .removeRow': function (e, value, row, index) { deleteMessageForm([row]); }
}

//Get ids of selected rows in table
function getIdSelections() {
    return $.map($("#messagesTable").bootstrapTable('getSelections'), function (row) {
        return row.messageName;
    });
}

//--- Json Form Setup ---
var jsonFormSchema = {
    messageName: { type: 'string', title: "Message Name", required: true },
    screens: { type: 'array', title: "Screens", items: { type: 'number', title: "Screen Number" } },
    template: { type: 'string', title: "Template", required: true, default: "", enum: ["templateA.html", "templateB.html", "templateC.html"] },
    title: { type: 'string', title: "Title" },
    textFields: { type: 'array', title: "Text Fields", items: { type: 'string' } },
    images: { type: 'array', title: "Images", items: { type: 'file' } },
    visableFor: { type: 'number', title: "Visability time in seconds", required: true },
    visableInTimeFrames: {
        title: "Time Frames",
        type: 'array', items: {
            type: 'object', properties: {
                weekDays: { type: 'array', items: { type: 'string', enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] } },
                dateRange: { type: 'object', properties: { from: { type: 'date' }, to: { type: 'date' } } }
            }
        }
    },
}
var jsonFormSettings = [
    "*",
    {
        "type": "actions",
        "items": [
            {
                "type": "submit",
                "title": "Submit"
            },
            {
                "type": "button",
                "title": "Cancel",
                "onClick": function (evt) { $('.modal').modal('hide'); }
            }
        ]
    }
]
var jsonFormValues = {}

function validate(values) {
    var messages = ($("#messagesTable").bootstrapTable('getData')).map(m => m.messageName);
    if (messages.includes(values.messageName)) {
        $('#resultAdd').html('<p>Message with this name already exists</p>');
        return false;
    }
    return true;
}

//--- Modals setup ---
var tobeDeleted = []
function deleteMessageForm(rows) {
    for (r of rows) { tobeDeleted.push(r.messageName); }
    $('#deleteMessageForm').modal();
}
function addMessageForm() {
    jsonFormValues = {}
    jsonFormSchema.messageName.readOnly = false;
    //create a json form
    $("#addMessageJsonForm").jsonForm({
        schema: jsonFormSchema,
        form: jsonFormSettings,
        value: jsonFormValues,
        onSubmit: (errors, values) => {
            if (errors) {
                console.log(errors);
                $('#resultAdd').html('<p>I beg your pardon?</p>');
            }
            else {
                if (!validate(values)) return;
                var formData = new FormData($("#addMessageJsonForm")[0]);
                $.ajax({
                    url: '/manager/messageForm/?method=create"',
                    type: 'POST',
                    method: "POST",
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function () {
                        $("#messagesTable").bootstrapTable('refresh');
                        $("#addMessageForm").modal('hide');
                        $("#addMessageJsonForm").empty();
                    },
                });
            }
        }
    });
    $("#jsonform-1-elt-visableFor")[0].min = 5;
    //open modal
    $('#addMessageForm').modal();
}
function editMessageForm(row) {
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
        onSubmit: (errors, values) => {
            if (errors) {
                console.log(errors);
                $('#resultEdit').html('<p>I beg your pardon?</p>');
            }
            else {
                var formData = new FormData($("#editMessageJsonForm")[0]);
                $.ajax({
                    url: '/manager/messageForm/?method=update',
                    type: 'POST',
                    method: "POST",
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function () {
                        $("#messagesTable").bootstrapTable('refresh');
                        $("#editMessageForm").modal('hide');
                        $("#editMessageJsonForm").empty();
                        $("#edit").prop('disabled', true);
                    },
                });
            }
        }
    });
    $("#jsonform-1-elt-visableFor")[0].min = 5;
    //open modal
    $('#editMessageForm').modal();
}

//--- Buttons listeners setup ---
$(document).ready(function () {
    $("#messagesTable").on('check.bs.table uncheck.bs.table ' + 'check-all.bs.table uncheck-all.bs.table', function () {
            var numOfSelected = getIdSelections().length;
            $("#remove").prop('disabled', !(numOfSelected > 0));
            $("#edit").prop('disabled', !(numOfSelected == 1));
        })

    $("#add").click(function () { addMessageForm(); })

    $("#edit").click(function () {
        var row = $("#messagesTable").bootstrapTable('getSelections')[0];
        editMessageForm(row);
    })

    $("#remove").click(function () {
        var rows = $("#messagesTable").bootstrapTable('getSelections');
        deleteMessageForm(rows);
    });

    $("#confirmDelete").click(function () {
        $.ajax({
            url: '/manager/messageDelete/',
            type: 'POST',
            method: 'POST',
            data: { "messages": tobeDeleted },
            success: function () {
                $("#messagesTable").bootstrapTable('refresh');
                $("#remove").prop('disabled', true);
                $("#deleteMessageForm").modal('hide');
            },
        });
    });

    $("#cancelDelete").click(function () {
        tobeDeleted = [];
    });


});

//___

//TODO: on screen connection