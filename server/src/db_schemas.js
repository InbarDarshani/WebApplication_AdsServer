//--- Database schemes structures module ---
//MongoDB setup
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const mongoose_delete = require('mongoose-delete');
bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

//--- Schemas Structures ---
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
                from: { type: Date, transform: d => { return (d != null ? d.toLocaleDateString() : '') } },
                to: { type: Date, transform: d => { return (d != null ? d.toLocaleDateString() : '') } }
            }
        }
    ]
};

var screenStructure = {
    screenNumber: { type: Number, unique: true },
    active: { type: Boolean, default: false },
    lastConnection: { type: Date, default: '', transform: d => { return (d != null ? d.toLocaleString() : '') } },
};

var userStructure = {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: { type: String, default: function () { return this.firstName + " " + this.lastName; } },
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true }
}

//--- Schemas Options ---
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

//--- Mongoos Schemas ---
var messageSchema = new Schema(messageStructure, schemasOptions);
var screenSchema = new Schema(screenStructure, schemasOptions);
var userSchema = new Schema(userStructure, schemasOptions);
messageSchema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all' });
userSchema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all' });

//--- User schemas setup ---
userSchema.pre(['save'], async function (next) {
    try {
        // only hash the password if it has been modified (or is new)
        if (!this.isModified('password'))
            return next();

        // generate a salt
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        // hash the password along with our new salt
        // override the cleartext password with the hashed one
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) { throw new Error("DB ERROR - cant hash password " + error); }
});
userSchema.pre(['update', 'updateOne', 'findOneAndUpdate'], async function (next) {
    try {
        var modifiedField = this.getUpdate().$set.password;
        if (!modifiedField)
            return next();

        // generate a salt
        const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
        // hash the password along with our new salt
        // override the cleartext password with the hashed one
        this.getUpdate().$set.password = await bcrypt.hash(modifiedField, salt);
        next();
    } catch (error) { throw new Error("DB ERROR - cant hash password " + error); }
})

userSchema.methods.validatePassword = async function (pass) {
    try { return bcrypt.compare(pass, this.password); }
    catch (error) { throw new Error("DB ERROR - cant authenticate user " + error); }
};

//--- Export schemas ---
exports.messageSchema = messageSchema;
exports.screenSchema = screenSchema;
exports.userSchema = userSchema; 