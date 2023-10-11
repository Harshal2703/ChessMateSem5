import { cookies } from 'next/headers'
const jose = require('jose')
import { mongoClient } from '../dbaccess'
import { NextResponse } from 'next/server.js'

export async function GET(req) {
    await mongoClient.connect()
    const cookieStore = cookies()
    const token = cookieStore.get('jwt_auth_token')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
    if (token) {
        const { payload, protectedHeader } = await jose.jwtVerify(token.value, secret);
        const db = mongoClient.db('ChessMateMain');
        const collection = db.collection('Users');
        const data = (await collection.find({ 'email': payload.email }).toArray())[0]
        await mongoClient.close()
        return NextResponse.json({ message: 'success', data }, { status: 200 })
    } else {
        return NextResponse.json({ message: 'some error occured', data }, { status: 400 })
    }
}
