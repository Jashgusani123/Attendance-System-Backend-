"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var ClassSchema = new mongoose_1.Schema({
    subjectName: {
        type: String,
        required: true,
        trim: true,
    },
    collegeName: {
        type: String,
        required: true,
        trim: true,
    },
    departmentName: {
        type: String,
        required: true,
        trim: true,
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
    },
    starting: {
        type: String,
        required: true,
    },
    ending: {
        type: String,
        required: true,
    },
    allStudent: {
        type: [String], // Store Enrollment Numbers (Er. No) as Strings
        required: true,
    },
    absentStudent: {
        type: [String], // Store Enrollment Numbers (Er. No) as Strings
        default: [],
    },
    presentStudent: {
        type: [String], // Store Enrollment Numbers (Er. No) as Strings
        default: [],
    },
    location: {
        type: String
    },
    createdBy: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Teacher",
        required: true
    },
    role: {
        type: String,
        enum: ['teacher'],
        default: 'teacher',
    },
}, { timestamps: true });
var Class = mongoose_1.default.model('Class', ClassSchema);
exports.default = Class;
