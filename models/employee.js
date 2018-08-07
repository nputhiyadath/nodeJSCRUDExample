const mongoose = require('mongoose');

const employeeModel = new mongoose.Schema({
    firstName: String,
    lastName: String,
    department: String
}, {
    versionKey: false
});

module.exports = mongoose.model('employee', employeeModel);