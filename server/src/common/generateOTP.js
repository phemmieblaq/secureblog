const crypto = require('crypto');

const generateOTP =() =>{
    const otpLength = 6;
    const otpDigits = '0123456789';
    let otp = '';

    while (otp.length < otpLength) {
        const randomBytes = crypto.randomBytes(1);
        const randomNumber = randomBytes[0] % otpDigits.length;

        if (randomNumber < otpDigits.length) {
            otp += otpDigits[randomNumber];
        }
    }

    return otp;
}

module.exports = generateOTP;