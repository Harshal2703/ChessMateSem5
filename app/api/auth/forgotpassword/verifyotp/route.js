import { mongoClient } from '../../../dbaccess'
import { NextResponse } from 'next/server'

// check that email has requested for reset if yes then verify otp and reset then remove old cookie

export async function POST(req) {
    const data = await req.json()
    const validateEmail = (unverifiedEmail) => {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return re.test(unverifiedEmail)
    }
    if (data.email &&
        validateEmail(data.email) &&
        data.OTP &&
        data.OTP.length === 7 && data.password && data.password.length >= 5) {
        const db = mongoClient.db('Authentication');
        const collection = db.collection('UsersCredentials');
        await mongoClient.connect()
        const info = await collection.find({ email: data.email }).toArray()
        if (info.length === 0) {
            return NextResponse.json({ reason: 'Email does not exist , sign up!', tryAgain: true }, { status: 400 })
        } else {
            const currentTimeStamp = Date.now()
            if (info[0].email === data.email && info[0].verifiedEmail && info[0].forgotpassOtp === data.OTP && info[0].tokenGenTime <= currentTimeStamp <= info[0].forgotpassOtpExpTime && !info[0].passwordReseted) {
                const filter = { email: data.email }
                const updateDoc = {
                    $set: {
                        passwordReseted: true,
                        passwordResetTimestamp: currentTimeStamp,
                        password: data.password
                    }
                }
                const ack = await collection.updateOne(filter, updateDoc)
                if (ack.acknowledged) {
                    mongoClient.close()
                    let response = NextResponse.json({ message: 'successfully reseted password try sign in!' }, { status: 200 })
                    response.cookies.delete('jwt_auth_token')
                    return response
                } else {
                    mongoClient.close()
                    return NextResponse.json({ reason: 'some error occured try again' }, { status: 500 })
                }
            } else {
                return NextResponse.json({ reason: 'Invalid Request or OTP', tryAgain: true }, { status: 400 })
            }
        }
    } else {
        return NextResponse.json({ reason: 'Invalid OTP', tryAgain: true }, { status: 400 })
    }

}