const errors = require('restify-errors')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const auth = require('../auth')
const jwt = require('jsonwebtoken')
const config = require('../config')
const nodemailer = require('nodemailer')
const Otp = require('../models/otp')
const Token = require('../models/token')
const crypto = require('crypto')
const { sendmail } = require('../helpers/index')
const accountSid = config.ACCOUNT_SID
const authToken = config.AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)
const smskey = config.SMS_KEY
const redis = require('redis')
const client_redis = redis.createClient(config.REDIS_PORT)
// const fetch = require('node-fetch')
const axios = require('axios')

function setResponse(username, repos){
    return `<h1>${username} has ${repos} repos in github</h1>`
}
function cache(req, res, next){
    const { username } = req.params
    client_redis.get(username, (err, data) => {
        if(err) throw err
        if(data !== null){
            res.send(setResponse(username, data))
        }else{
            next()
        }
    })
}
 
module.exports = server => {
    server.post('/register', async (req, res, next) => {
        const url = config.URL
        if (!req.is('application/json')) {
            return next(new errors.InvalidContentError("expects application/json"))
        }
        const { email, password, phone } = req.body
        const payload = new User({
            email,
            password,
            phone
        })
        const token = new Token({
            _userId: payload._id,
            token: crypto.randomBytes(16).toString('hex')
        })
        await token.save()
        var mailOptions = {
            from: '<mikaozora08@gmail.com>',
            replyTo: 'noreply.mikaozora08@gmail.com',
            to: payload.email,
            subject: 'Verifikasi Akun Anda',
            text: 'Hello, thanks for registering on our site, please verifikasi akun anda',
            html: `<h1>Hello,</h1>
                   <p>terima kasih sudah mendaftar di website kami,
                      mohon untuk melakukan verifikasi dengan klik link di bawah ini</p> 
                    <a href="${url}/verifikasi/${token.token}">verifikasi akun anda</a>`,
        }
        bcrypt.genSalt(10, async (err, salt) => {
            bcrypt.hash(payload.password, salt, async (err, hash) => {
                //hash password
                payload.password = hash
                //save user
                try {
                    const user = await payload.save()
                    sendmail(mailOptions)
                    res.send({ message: "Link sudah dikirim ke email anda. segera lakukan verifikasi" })
                } catch (err) {
                    return next(new errors.InternalError(err.message))
                }
            })
        })
    })
    server.post('/auth', async (req, res, next) => {
        const { email, password } = req.body
        try {
            const user = await auth.authenticate(email, password, User.isVerified)
            const token = jwt.sign(user.toJSON(), config.JWT_SECREET, {
                expiresIn: '1d'
            })
            if (user.isVerified === false) {
                return res.send({ message: "verifikasi akun anda" })
            } else if (user.isVerified === true) {
                res.send({ message: "Berhasil login", token })
                next()
            }
            // const { iat, exp } = jwt.decode(token)


        } catch (err) {
            return next(new errors.UnauthorizedError(err))
        }
    })
    server.get("/verifikasi/:token", async (req, res, next) => {
        Token.findOne({ token: req.params.token }, function (err, token) {
            if (!token) {
                return res.send({ message: "Your verification link may have expired. Please click on resend for verify your Email." })
            } else {
                User.findOne({ _id: token._userId }, function (err, user) {
                    if (!user) {
                        return res.send({ message: "kami tidak dapat menemukan akun anda" })
                    } else if (user.isVerified === true) {
                        return res.send({ message: "akun anda telah diverifikasi. coba login!" })
                    } else {
                        user.isVerified = true
                        user.save(function (err) {
                            if (err) {
                                throw err
                            } else {
                                return res.send({ message: "akun anda telah berhasil diverifikasi" })
                            }
                        })
                    }
                })
            }
        })

    })
    server.post('/forgetpassword', async(req, res) => {
        const url = config.URL
        const { email } = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.send({message: "email tidak dapat ditemukan"})
        }
        const token = new Token({
            _userId: user._id,
            token: crypto.randomBytes(16).toString('hex')
        })
        await token.save()
        var mailOptions = {
            from: '<mikaozora08@gmail.com>',
            replyTo: 'noreply.mikaozora08@gmail.com',
            to: user.email,
            subject: 'Forgot Password',
            text: 'Hello, you forgot the password. click link dibawah ini',
            html: `<h1>Hello,</h1>
                   <p>Jika ingin mengganti password anda,
                      mohon untuk melakukan penggantian password dengan klik link di bawah ini</p> 
                    <a href="${url}/resetpassword/${token.token}">reset password akun anda</a>`,
        }
        try{
            sendmail(mailOptions)
            res.send({message: "Link reset password telah dikirim ke email anda"})
        }catch(err){
            return res.send({message: err.message})
        }

    })
    server.put('/resetpassword/:token', async(req, res, next) => {
        const {password} = req.body
        Token.findOne({token: req.params.token},async function(err, token){
            if(!token){
                return res.send({message: "token tidak dapat ditemukan"})
            }else{
                const user = await User.findOne({_id: token._userId})
                if(!user){
                    return res.send({message: "user tidak dapat ditemukan"})
                }else{
                    const hashpassword = await bcrypt.hash(password, 10)
                    user.password = hashpassword
                    await user.save()
                    res.send({message: "Password berhasil diupdate"})
                }
            }
        })
    }) 
    server.post('/register/OTP', async(req, res, next) => {
        const { email, password, phone } = req.body
        const payload = new User({
            email,
            password,
            phone
        })
        const ttl = 2*60*1000
        const expires = Date.now() + ttl
        const otp = new Otp({
            _userId: payload._id,
            otp: Math.floor(100000 + Math.random() * 900000),
            expires: expires
        })
        await otp.save()
        bcrypt.genSalt(10, async (err, salt) => {
            bcrypt.hash(payload.password, salt, async (err, hash) => {
                //hash password
                payload.password = hash
                //save user
                try {
                    const user = await payload.save()
                    client.messages.create({
                        body: `Jangan Sebarkan Kode OTP ini, Lakukan login menggunakan kode OTP ini ${otp.otp}`,
                        from: +18649025380,
                        to: phone
                    })
                    console.log("berhasil mengirim sms");
                    res.send({message: "SMS berhasil dikirim, silakan cek handphone anda"})
                } catch (err) {
                    return next(new errors.InternalError(err.message))
                }
            })
        })

        // const data = `${phone}${otp}${expires}`
        // const hash = crypto.createHmac('sha256', smskey).update(data).digest('hex')
        // const fullhash = `${hash}${expires}`

        // .then((messages) => console.log("SMS berhasil dikirim"))
        // .catch((err) => console.log(err))
        // res.send({message: "berhasil dikirim", phone, hash: fullhash})
    })
    server.post('/verifyOTP', async(req, res, next) => {
        const {otp} = req.body
        Otp.findOne({otp}, function(err, otp){
            const now = Date.now()
            if(now > otp.expires){
                return res.send({ message: "OTP sudah kadaluwarsa." })
            }else{
                User.findOne({ _id: otp._userId }, function (err, user) {
                    if (!user) {
                        return res.send({ message: "kami tidak dapat menemukan akun anda" })
                    } else if (user.isVerified === true) {
                        return res.send({ message: "akun anda telah diverifikasi. coba login!" })
                    } else {
                        user.isVerified = true
                        user.save(function (err) {
                            if (err) {
                                throw err
                            } else {
                                return res.send({ message: "akun anda telah berhasil diverifikasi" })
                            }
                        })
                    }
                })
            }
        })
    })
    server.post('/resendlink', async(req, res, next) => {
        const url = config.URL
        const {email} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.send({message: "email tidak dapat ditemukan"})
        }
        const token = new Token({
            _userId: user._id,
            token: crypto.randomBytes(16).toString('hex')
        })
        await token.save()
        var mailOptions = {
            from: '<mikaozora08@gmail.com>',
            replyTo: 'noreply.mikaozora08@gmail.com',
            to: email,
            subject: 'Verifikasi Akun Anda',
            text: 'Hello, thanks for registering on our site, please verifikasi akun anda',
            html: `<h1>Hello,</h1>
                   <p>terima kasih sudah mendaftar di website kami,
                      mohon untuk melakukan verifikasi dengan klik link di bawah ini</p> 
                    <a href="${url}/verifikasi/${token.token}">verifikasi akun anda</a>`,
        }
        try{
            sendmail(mailOptions)
            res.send({message: "Link sudah dikirim ke email anda. segera lakukan verifikasi"})
        }catch(err){
            return res.send({message: err.message})
        }
    })
    server.post('/resendotp', async(req, res, next) => {
        const {email} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.send({message: "no hp tidak dapat ditemukan"})
        }
        const ttl = 2*60*1000
        const expires = Date.now() + ttl
        const otp = new Otp({
            _userId: user._id,
            otp: Math.floor(100000 + Math.random() * 900000),
            expires: expires
        })
        await otp.save()
        try {
            client.messages.create({
                body: `Jangan Sebarkan Kode OTP ini, Lakukan login menggunakan kode OTP ini ${otp.otp}`,
                from: +18649025380,
                to: user.phone
            })
            res.send({message: "SMS berhasil dikirim, silakan cek handphone anda"})
        } catch (err) {
            return next(new errors.InternalError(err.message))
        }
    })
    server.get('/repos/:username', cache, async(req, res, next) => {
        try {
            console.log("Fetching data...");
            const { username } = req.params
            const response = await axios.get(`https://api.github.com/users/${username}`)
            // console.log(response);
            const data = await response.data
            const repos = data.public_repos
            client_redis.setex(username, 3600, repos)

            res.send(setResponse(username, repos))
        } catch (err) {
            console.log(err);
            res.status(500)
        } 
    }) 
}


 