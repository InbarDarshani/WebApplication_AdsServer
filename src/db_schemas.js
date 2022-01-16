//Database schemes structures module

//MongoDB setup
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const mongoose_delete = require('mongoose-delete');
bcrypt = require('bcrypt');
SALT_WORK_FACTOR = 10;

//---Schemas Structures---
var messageStructure = {
    messageName: { type: String, required: true, unique: true },
    screens: [{ type: Number }],
    template: { type: String, required: true },
    title: { type: String },
    textFields: [{ type: String }],
    images: [{ type: String }],
    visableFor: { type: Number, required: true },
    visableInTimeFrames: [
        {
            weekDays: [{ type: String, enum: { values: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], message: '{VALUE} must be a string of weekday' } }],
            dateRange: {
                from: { type: Date, transform: d => d.toLocaleDateString() },
                to: { type: Date, transform: d => d.toLocaleDateString() }
            },
            // dayTimeRange: {
            //     from: { type: String, match: [/([0-1]?\d|2[0-3]):([0-5]?\d):?([0-5]?\d)/, '{VALUE} must match hh:mm or hh:mm:ss'] },
            //     to: { type: String, match: [/([0-1]?\d|2[0-3]):([0-5]?\d):?([0-5]?\d)/, '{VALUE} must match hh:mm or hh:mm:ss'] },
            // }
        }
    ]
};

var screenStructure = {
    screenNumber: { type: Number, unique: true },
    active: { type: Boolean, default: false },
    lastConnection: { type: Date, transform: d => d.toLocaleString() },
};

var fileStructure = {
    fileName: { type: String, unique: true, required: true },
    folder: { type: String, required: true, enum: { values: ["images", "templates"] } }
}

var userStructure = {
    firstName: { type: String, unique: true, required: true },
    lastName: { type: String, unique: true, required: true },
    fullName: {
        type: String, default: function () {
            return this.firstName + " " + this.lastName;
        }
    },
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true }
}

//---Schemas Options---
var schemasOptions = {
    toJSON: {
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.__v;
            delete ret.deleted;
            ret.createdAt = doc.createdAt.toLocaleString();
            ret.updatedAt = doc.createdAt.toLocaleString();
        }
    },
    timestamps: true
};

//---Mongoos Schemas---
var messageSchema = new Schema(messageStructure, schemasOptions);
var screenSchema = new Schema(screenStructure, schemasOptions);
var fileSchema = new Schema(fileStructure, schemasOptions);
var userSchema = new Schema(userStructure, schemasOptions);
messageSchema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all' });
screenSchema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all' });
fileSchema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all' });
userSchema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all' });

//---User schemas setup---
userSchema.pre(['save', 'validate', 'update'], async function (next) {
    // only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // generate a salt
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        // hash the password along with our new salt
        // override the cleartext password with the hashed one
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) { return next(err); }
});
userSchema.methods.validatePassword = async function (pass) {
    return bcrypt.compare(pass, this.password);
};

//---Exports schemas---
exports.messageSchema = messageSchema;
exports.screenSchema = screenSchema;
exports.fileSchema = fileSchema;
exports.userSchema = userSchema; 