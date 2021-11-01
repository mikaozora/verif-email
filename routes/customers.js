const errors = require('restify-errors')
const Customer = require('../models/customer')
const config = require('../config')
const rjwt = require('restify-jwt-community')
module.exports = server => {
    server.get('/customers', rjwt({secret: config.JWT_SECREET}), async(req, res, next) => {
        try {
            const customer = await Customer.find({})
            res.send(customer)
            next()
        } catch (err) {
            return next(new errors.InvalidContentError(err))
        }   
    })
    server.get('/customers/:id', rjwt({secret: config.JWT_SECREET}), async(req, res, next) => {
        try {
            const customer = await Customer.findById(req.params.id)
            res.send(200, customer)
            next()
        } catch (err) {
            return next(new errors.ResourceNotFoundError('Data tidak ditemukan'))
        }   
    })
    server.post('/customers', rjwt({secret: config.JWT_SECREET}), async(req, res, next) => {
        //check
        if(!req.is('application/json')){
            return next(new errors.InvalidContentError("expects application/json"))
        }
        const { name, email, balance, telepon } = req.body
        const payload = new Customer({
            name,
            email,
            balance,
            telepon
        })
        try{
            const customer = await payload.save()
            res.send(201, 'berhasil ditambahkan')
            next()
        }catch(err){
            return next(new errors.InternalError(err.message))
        }
        
    })
    server.put('/customers/:id', rjwt({secret: config.JWT_SECREET}), async(req, res, next) => {
        //check
        if(!req.is('application/json')){
            return next(new errors.InvalidContentError("expects application/json"))
        }
        try{
            const customer = await Customer.findOneAndUpdate({_id: req.params.id}, req.body)
            res.send(201, 'berhasil diupdate')
            next()
        }catch(err){
            return next(new errors.InternalError('Data not found'))
        }
         
    })
    server.del('/customers/:id', rjwt({secret: config.JWT_SECREET}), async(req, res, next) => {
        if(!req.is('application/json')){
            return next(new errors.InvalidContentError("expects application/json"))
        }
        try{
            const customer = await Customer.findOneAndDelete({_id: req.params.id})
            res.send(204, "data berhasil dihapus")
            next()
        }catch(err){
            return next(new errors.InternalError('Data not found'))
        }
    })
}