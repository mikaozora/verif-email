const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

const otpSchema = mongoose.Schema({
    _userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'User' 
    },
    otp: { 
        type: String, 
        required: true 
    },
    expires: {
        type: String,
        required: true
    }
    
})
otpSchema.plugin(timestamp)
const OTP = mongoose.model('Otp', otpSchema)
module.exports = OTP