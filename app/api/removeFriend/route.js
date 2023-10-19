import { NextResponse } from "next/server"
import { mongoClient } from '../dbaccess'
import { cookies } from "next/headers"
const jose = require('jose')

export async function POST(req) {
    const friendDetails = await req.json()
    const cookieStore = cookies()
    const token = cookieStore.get('jwt_auth_token')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
    const { payload, protectedHeader } = await jose.jwtVerify(token.value, secret);
    const db = mongoClient.db('ChessMateMain');
    const collection = db.collection('Users');
    await mongoClient.connect()
    const serverInfoOfUser = (await collection.find({ 'email': payload.email }).toArray())[0]
    const check = serverInfoOfUser.friends.find((friend) => {
        return friend.reqId === friendDetails.reqId
    })
    if (check) {
        let filter = { email: serverInfoOfUser.email }
        let updateDoc = { $pull: { "friends": { 'reqId': check.reqId } } }
        let ack1 = await collection.updateOne(filter, updateDoc)
        filter = { email: check.email }
        updateDoc = { $pull: { "friends": { 'reqId': check.reqId } } }
        let ack2 = await collection.updateOne(filter, updateDoc)

        if (ack1.acknowledged && ack2.acknowledged) {
            mongoClient.close()
            return NextResponse.json('removed', { status: 200 })
        }
    }
    mongoClient.close()
    return NextResponse.json('failed to remove', { status: 400 })
}