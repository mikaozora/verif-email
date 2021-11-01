const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.authenticate = (email, password, isVerified) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get user by email
      const user = await User.findOne({ email });
      // Match Password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if(err) throw err
        if(isMatch){
            resolve(user)
        }else{
            reject('Authenticate failed')
        }
    })
    } catch (err) {
      // Email not found or password did not match
      reject('Authentication Failed');
    }
  });
};
// bcrypt.compare(password, user.password, (err, isMatch) => {
//     if(err) throw err
//     if(isMatch){
//         resolve(user)
//     }else{
//         reject('Authenticate failed')
//     }
// })
// const user = await User.findOne({email}, (err, user) => {
//     if(err){
//         return err
//     }else if(!user){
//         return resolve({message: "email tidak ditemukan"})
//     }else if(!bcrypt.compareSync(password, user.password)){
//         return resolve({message: "password salah"})
//     }else if(!user.isVerified){
//         return resolve({message: "akun anda belum terverifikasi"})
//     }else{
//         return resolve({message: "berhasil login"})
//     }
// })