const nodemailer = require('nodemailer');
export const transporter = nodemailer.createTransport({
    service: 'outlook',
    auth: {
        user: process.env.OUTLOOK_ID,
        pass: process.env.OUTLOOK_PASSWORD
    }
});
