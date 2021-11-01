const mongoose = require('mongoose')
const timestamp = require('mongoose-timestamp')

const tokenSchema = mongoose.Schema({
    _userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: 'User' 
    },
    token: { 
        type: String, 
        required: true 
    },
    
})
tokenSchema.plugin(timestamp)
const Token = mongoose.model('Token', tokenSchema)
module.exports = Token