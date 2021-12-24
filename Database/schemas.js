//MongoDB setup
var Schema =  require('mongoose').Schema;

exports.messagesSchema = {
    messageName: { type: String, required: true, unique: true },
    dateCreated: { type: Date, default: Date.now, immutable: true },
    screens: [{ type: Number }],
    //screens: [{ type: Schema.Types.ObjectId, ref: 'Screen' }],  //to work with populate
    template: { type: String, required: true, set: (fileName) => { return "./templates/" + fileName }},
    title: { type: String, required: true },
    textFields: [{ type: String }],
    images: [{ type: String, set: (fileName) => { return "./images/" + fileName }}],
    visableFor: { type: Number, required: true },
    visableInTimeFrames: [
        {
            weekDays: [{ type: String, enum: { values: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], message: '{VALUE} is not supported, must be a string of weekday' } }],
            dateRange: {
                from: { type: Date },
                to: { type: Date }
            },
            hhmmssRange: {
                from: { type: String, match: [/([0-1]?\d|2[0-3]):([0-5]?\d):?([0-5]?\d)/, '{VALUE} is not supported, must match hh:mm or hh:mm:ss'] },
                to: { type: String, match: [/([0-1]?\d|2[0-3]):([0-5]?\d):?([0-5]?\d)/, '{VALUE} is not supported, must match hh:mm or hh:mm:ss'] },
            }
        }
    ]
};

exports.screensSchema = {
    screenNumber: { type: Number, unique: true },
    dateCreated: { type: Date, default: Date.now, immutable: true },
    active: { type: Boolean, default: true },
    lastUpdate: { type: Date, default: Date.now }
};

exports.clientsSchema = {
    screenNumber: { type: Number, unique: true },
    //screenNumber: { type: Schema.Types.ObjectId, ref: 'Screen' },  //to work with populate
    status: { type: String, enum: { values: ["Connected", "Disconnected"], message: '{VALUE} is not supported, must be Connected or Disconnected' } },
    timeOfLastConnection: { type: Date, default: Date.now },
    timeOfLastDisconnection: { type: Date, default: Date.now }
};

// const imageFileSchema = {
//     name: { type: String },
//     folder: { type: String, default: "./images/", immutable: true },
//     path: { type: String, default: () => { return this.folder + this.name } }
// };

// const templateFileSchema = {
//     name: { type: String },
//     folder: { type: String, default: "./templates/", immutable: true },
//     path: { type: String, default: () => { return this.folder + this.name } }
// };