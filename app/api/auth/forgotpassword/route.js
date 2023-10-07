import { mongoClient } from '../../dbaccess'
import { NextResponse } from 'next/server'
import { transporter } from '../../mailops';


export async function POST(req) {
    const data = await req.json()
    const generateRandomOtp = (arr) => {
        let ans = '';
        for (let i = 7; i > 0; i--) {
            ans +=
                arr[(Math.floor(Math.random() * arr.length))];
        }
        return ans
    }
    const validateEmail = (unverifiedEmail) => {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return re.test(unverifiedEmail)
    }
    if (data.email && validateEmail(data.email)) {
        const db = mongoClient.db('Authentication');
        const collection = db.collection('UsersCredentials');
        await mongoClient.connect()
        const info = await collection.find({ email: data.email }).toArray()
        if (info.length === 0) {
            return NextResponse.json({ reason: 'Email does not exist , Sign up!' }, { status: 400 })
        } else {
            if (info[0].email === data.email && info[0].verifiedEmail) {
                const timestamp = Date.now()
                const otp = generateRandomOtp(process.env.OTPCONFIG)
                const mailOptions = {
                    from: process.env.OUTLOOK_ID,
                    to: data.email,
                    subject: 'OTP for Verification of Email',
                    text: 'Forgot Password \n OTP : ' + otp
                };
                let mailAck = null
                try {
                    mailAck = await transporter.sendMail(mailOptions)
                } catch (error) {
                    return NextResponse.json({ reason: 'unable to send email try again' }, { status: 500 })
                }
                const filter = { email: data.email }
                const updateDoc = {
                    $set: {
                        passwordReseted:false,
                        forgotpassOtp: otp,
                        forgotpassOtpGenTime: timestamp,
                        forgotpassOtpExpTime: timestamp + 900,
                        forgotpasswordMailAck: mailAck
                    }
                }
                const ack = await collection.updateOne(filter, updateDoc)
                if (ack.acknowledged) {
                    mongoClient.close()
                    return NextResponse.json({ message: 'verify email using otp' }, { status: 200 })
                } else {
                    mongoClient.close()
                    return NextResponse.json({ reason: 'some error occured try again' }, { status: 500 })
                }
            }
        }
    } else {
        return NextResponse.json({ reason: 'Invalid Credentials' }, { status: 400 })
    }
}