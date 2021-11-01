const nodemailer = require('nodemailer')

const sendmail = (data) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'emailmu',
            pass: 'password'
        }
    })
    transporter.sendMail(data, (err, info) => {
        if (err) throw err;
        console.log('email berhasil dikirim' + info.response);
    })
}
module.exports = {
    sendmail
}
