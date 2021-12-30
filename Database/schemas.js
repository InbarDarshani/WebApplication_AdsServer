//Database schemes structures module

exports.schemasOptions = {
    toJSON: {
        transform: (doc, ret) => {
            delete ret._id;
        }
    },
    timestamps: true
};

exports.messagesSchema = {
    messageName: { type: String, required: true, unique: true },
    screens: [{ type: Number }],
    template: { type: String, required: true },
    title: { type: String, required: true },
    textFields: [{ type: String }],
    images: [{ type: String }],
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
    active: { type: Boolean, default: true },
};

exports.filesSchema = {
    fileName: { type: String, unique: true, required: true },
    folder: { type: String, required: true, enum: { values: ["images", "templates"] } }
}