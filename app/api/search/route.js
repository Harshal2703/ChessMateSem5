import { NextResponse } from "next/server"
import { mongoClient } from '../dbaccess'
import { cookies } from "next/headers"
const jose = require('jose')

export async function POST(req) {
    const data = await req.json()
    const cookieStore = cookies()
    const token = cookieStore.get('jwt_auth_token')


    if (data && data.toSearch && token) {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
        const { payload, protectedHeader } = await jose.jwtVerify(token.value, secret);
        const db = mongoClient.db('ChessMateMain');
        const collection = db.collection('Users');
        await mongoClient.connect()
        const info = await collection.find({ 'username': { $regex: data.toSearch } }).toArray()
        mongoClient.close()
        const searchResult = info.filter((users) => {
            return users.username !== payload.username
        })
        return NextResponse.json({ message: 'success', searchResult }, { status: 200 })
    } else {
        mongoClient.close()
        return NextResponse.json({ reason: 'Invalid Search' }, { status: 400 })
    }
}