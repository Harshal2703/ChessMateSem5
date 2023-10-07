import { mongoClient } from '../../dbaccess'
import { NextResponse } from 'next/server'
// const jwt = require('jsonwebtoken');
const jose = require('jose') // alt to jwt
const validateEmail = (unverifiedEmail) => {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(unverifiedEmail)
}


export async function POST(req) {
    const data = await req.json()
    if (data.email &&
        validateEmail(data.email) &&
        data.otp &&
        data.otp.length === 7) {
        await mongoClient.connect()
        const db = mongoClient.db('Authentication');
        const collection = db.collection('UsersCredentials');
        const info = await collection.find({ email: data.email }).toArray()
        if (info.length !== 0 && info[0].verifiedEmail === false) {
            const currentTimeStamp = Date.now()
            if (data.email === info[0].email && data.username === info[0].username && data.password === info[0].password && (info[0].otpGenTime <= currentTimeStamp <= info[0].otpExpiryTime) && data.otp === info[0].otp) {
                // const token = jwt.sign({ email: data.email, password: data.password }, process.env.JWT_SECRET_KEY, { algorithm: 'HS256' })
                const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
                const token = await new jose.SignJWT({ email: data.email, password: data.password })
                    .setProtectedHeader({ alg: 'HS256' })
                    .setIssuedAt()
                    .setExpirationTime('168h')
                    .sign(secretKey);
                const filter = { email: data.email }
                const updateDoc = {
                    $set: {
                        verifiedEmail: true,
                        jwtToken: token,
                        tokenGenTime: Date.now()
                    }
                }
                const ack = await collection.updateOne(filter, updateDoc)
                if (ack.acknowledged) {
<<<<<<< HEAD:app/api/auth/verifyotp/route.js
                    const response = NextResponse.json({ message: 'Successfully Registered' }, { status: 200 })
                    response.cookies.set({
                        name: 'jwt_auth_token',
                        value: token,
                        httpOnly: true,
                        maxAge: 7 * (60 * 60),
                    })
                    return response
                } else {
                    return NextResponse.json({ reason: 'Invalid OTP or OTP Timeout , Try Again!', tryAgain: true }, { status: 400 })
                }
            } else {
                return NextResponse.json({ reason: 'Invalid OTP or OTP Timeout , Try Again!', tryAgain: true }, { status: 400 })
            }
        } else {
            return NextResponse.json({ reason: 'Invalid OTP', tryAgain: true }, { status: 400 })
=======
                    return NextResponse.json({ message: 'Email Verified , Registration Completed', token }, { status: 200 })
                } else {
                    return NextResponse.json({ reason: 'Invalid OTP or OTP Timeout , Try Again!' ,tryAgain:true}, { status: 400 })
                }
            } else {
                return NextResponse.json({ reason: 'Invalid OTP or OTP Timeout , Try Again!',tryAgain:true }, { status: 400 })
            }
        } else {
            return NextResponse.json({ reason: 'Invalid OTP',tryAgain:true}, { status: 400 })
>>>>>>> a74497a3aefb21d43ddc5d11e82a42f139dba69a:app/api/authentication/verify-otp/route.js
        }
    }
}