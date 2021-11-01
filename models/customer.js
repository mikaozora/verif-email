const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

const customerSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    balance: {
        type: Number,
        trim: true,
        required: true
    },
    telepon: {
        type: String,
        trim: true,
        required: true
    }
})

customerSchema.plugin(timestamp)
const Customer = mongoose.model('Customer', customerSchema)

module.exports = Customer