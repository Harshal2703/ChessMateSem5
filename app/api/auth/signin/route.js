import { mongoClient } from '../../dbaccess'
import { NextResponse } from 'next/server'
const jose = require('jose')

export async function POST(req) {
    const validateEmail = (unverifiedEmail) => {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return re.test(unverifiedEmail)
    }
    const data = await req.json()
    if (
        data.email &&
        validateEmail(data.email) &&
        data.password &&
        data.password.length >= 5
    ) {
        const db = mongoClient.db('Authentication');
        const collection = db.collection('UsersCredentials');
        await mongoClient.connect()
        const info = await collection.find({ email: data.email }).toArray()
        if (info.length !== 0 && info[0].email === data.email && info[0].password === data.password && info[0].verifiedEmail) {
            const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
            const token = await new jose.SignJWT({ email: data.email, username: info[0].username, password: data.password })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('168h')
                .sign(secretKey);
            const filter = { email: data.email }
            const updateDoc = {
                $set: {
                    jwtToken: token,
                    tokenGenTime: Date.now()
                }
            }
            const ack = await collection.updateOne(filter, updateDoc)
            if (ack.acknowledged) {
                const response = NextResponse.json({ message: 'Successfully Signed In' }, { status: 200 })
                response.cookies.set({
                    name: 'jwt_auth_token',
                    value: token,
                    httpOnly: true,
                    maxAge: 60 * 60 * 24 * 7, // 1 week
                })
                return response
            } else {
                return NextResponse.json({ reason: 'Something went wrong try again' }, { status: 500 })
            }
        } else {
            mongoClient.close()
            return NextResponse.json({ reason: 'Invalid Credentials' }, { status: 400 })
        }

    } else {
        return NextResponse.json({ reason: 'Invalid Credentials' }, { status: 400 })
    }
}