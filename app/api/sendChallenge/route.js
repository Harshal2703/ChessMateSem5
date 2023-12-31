import { mongoClient } from '../dbaccess'
import { NextResponse } from 'next/server'
import { cookies } from "next/headers"
const jose = require('jose')
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
    const { opponentInfo } = await req.json()
    const cookieStore = cookies()
    const token = cookieStore.get('jwt_auth_token')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
    const { payload, protectedHeader } = await jose.jwtVerify(token.value, secret);
    const db = mongoClient.db('ChessMateMain');
    const collection = db.collection('Users');
    await mongoClient.connect()
    const serverInfoOfUser = (await collection.find({ 'email': payload.email }).toArray())[0]
    const serverInfoOfOpponent = (await collection.find({ 'email': opponentInfo.email }).toArray())[0]
    if (serverInfoOfOpponent && serverInfoOfUser) {
        const reqId = uuidv4()
        const forMe = {
            reqId,
            challenger: true,
            email: serverInfoOfOpponent.email,
            username: serverInfoOfOpponent.username,
            profilePicUrl: serverInfoOfOpponent.profilePicUrl,
            rating: serverInfoOfOpponent.rating,
            accepted: false,
            rejected: false,
            reqGenTime: Date.now(),
            reqExpTime: Date.now() + (900 * 1000)
        }
        const forOpponent = {
            reqId,
            challenger: false,
            email: serverInfoOfUser.email,
            username: serverInfoOfUser.username,
            profilePicUrl: serverInfoOfUser.profilePicUrl,
            rating: serverInfoOfUser.rating,
            accepted: false,
            rejected: false,
            reqGenTime: Date.now(),
            reqExpTime: Date.now() + (900 * 1000)
        }
        let filter = { email: serverInfoOfUser.email }
        let updateDoc = { $push: { "challenges": forMe } }
        let ack1 = await collection.updateOne(filter, updateDoc)
        filter = { email: serverInfoOfOpponent.email }
        updateDoc = { $push: { "challenges": forOpponent } }
        let ack2 = await collection.updateOne(filter, updateDoc)
        if (ack1.acknowledged && ack2.acknowledged) {
            return NextResponse.json('request sent successfully', { status: 200 })
        }
    }
    mongoClient.close()
    return NextResponse.json('failed to remove', { status: 400 })
}