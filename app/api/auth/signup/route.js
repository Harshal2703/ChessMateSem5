import { mongoClient } from '../../dbaccess'
import { NextResponse } from 'next/server'
import { transporter } from '../../mailops';

const randomStr = (arr) => {
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
export async function POST(req) {
    const data = await req.json()
    if (
        data.email &&
        validateEmail(data.email) &&
        data.username &&
        data.username.length >= 5 &&
        data.password &&
        data.password.length >= 5
    ) {
        const db = mongoClient.db('Authentication');
        const collection = db.collection('UsersCredentials');
        await mongoClient.connect()
        const info = await collection.find({ email: data.email }).toArray()
        const usernameInfo = await collection.find({ username: data.username }).toArray()
        if (usernameInfo.length !== 0) {
            return NextResponse.json({ reason: 'Username Already Taken' }, { status: 400 })
        }
        if (info.length !== 0 && info[0].verifiedEmail) {
            mongoClient.close()
            return NextResponse.json({ reason: 'Email Already Exist , try Sign-In' }, { status: 400 })
        } else if (info.length == 0 || (info.length !== 0 && info[0].verifiedEmail == false)) {
            if (info.length !== 0) {
                await collection.deleteOne({ email: data.email }).then(() => { }).catch(() => {
                    mongoClient.close()
                    return NextResponse.json({ reason: 'some error occured try again' }, { status: 500 })
                })
            }
            const timestamp = Date.now()
            const otp = randomStr(process.env.OTPCONFIG)
            const mailOptions = {
                from: process.env.OUTLOOK_ID,
                to: data.email,
                subject: 'OTP for Verification of Email',
                text: 'OTP : ' + otp
            };
            let mailAck = null
            try {
                mailAck = await transporter.sendMail(mailOptions)
            } catch (error) {
                return NextResponse.json({ reason: 'unable to send email try again' }, { status: 500 })
            }
            const ack = await collection.insertOne({
                "email": data.email,
                "username": data.username,
                "password": data.password,
                "verifiedEmail": false,
                "otpGenTime": timestamp,
                "otpExpiryTime": timestamp + 900000,
                "otp": otp,
                "mailAck": mailAck
            })
            if (ack.acknowledged) {
                mongoClient.close()
                return NextResponse.json({ message: 'verify credentials using otp' }, { status: 200 })
            } else {
                mongoClient.close()
                return NextResponse.json({ reason: 'some error occured try again' }, { status: 500 })
            }
        }
    } else {
        return NextResponse.json({ reason: 'Invalid Credentials' }, { status: 400 })
    }
}