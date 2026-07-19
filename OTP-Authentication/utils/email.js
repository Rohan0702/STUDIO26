const nodemailer = require("nodemailer");


const sendOTP = async(email, otp)=>{


const transporter = nodemailer.createTransport({

    service:"gmail",

    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASSWORD
    }

});


await transporter.sendMail({

    from:process.env.EMAIL_USER,

    to:email,

    subject:"OTP Verification Code",

    text:`Your OTP code is ${otp}`

});


};


module.exports = sendOTP;