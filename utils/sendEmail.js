const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1) Create Transporter (servise that will send Email like "gmail")
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT, // if secure true port = 465, if false port = 587
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        }
    });
    // 2) Define email options (like from , to and subject ,email content)
    const mailOpts = {
        from: 'E-shop App <engineerahmed413@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };
    // 3) send email

    await transporter.sendMail(mailOpts);
}

module.exports = sendEmail;