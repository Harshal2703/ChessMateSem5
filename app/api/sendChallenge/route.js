import { cookies } from 'next/headers'
const jose = require('jose')
import { mongoClient } from '../dbaccess'
import { NextResponse } from 'next/server.js'
import { v4 as uuidv4 } from 'uuid';
export async function POST(req) {
    try {
        const opponentInfo = (await req.json()).opponentInfo
        const cookieStore = cookies()
        const token = cookieStore.get('jwt_auth_token')
        const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
        const { payload, protectedHeader } = await jose.jwtVerify(token.value, secret);
        const db = mongoClient.db('ChessMateMain');
        const collection = db.collection('Users');
        await mongoClient.connect()
        const serverInfoOfUser = (await collection.find({ 'email': payload.email }).toArray())[0]
        const serverInfoOfOpponent = (await collection.find({ 'email': opponentInfo.email }).toArray())[0]
        if (serverInfoOfUser.email && serverInfoOfOpponent.email) {
            const requestsOut = serverInfoOfUser["requests-out"]
            function checkRequest(request) {
                return (request.reqType === 'challenge' && !request.ack && request.email === serverInfoOfOpponent.email)
            }
            const result = requestsOut.find(checkRequest)
            if (!result) {
                const reqId = uuidv4()
                let email = serverInfoOfOpponent.email
                let username = serverInfoOfOpponent.username
                let profilePicUrl = serverInfoOfOpponent.profilePicUrl
                let filter = { email: serverInfoOfUser.email }
                let updateDoc = { $push: { "requests-out": { reqId, 'reqType': 'challenge', email, username, profilePicUrl, "accepted": false, "rejected": false, "ack": false } } }
                const ack1 = await collection.updateOne(filter, updateDoc)
                email = serverInfoOfUser.email
                username = serverInfoOfUser.username
                profilePicUrl = serverInfoOfUser.profilePicUrl
                filter = { email: serverInfoOfOpponent.email }
                updateDoc = { $push: { "requests-in": { reqId, 'reqType': 'challenge', email, username, profilePicUrl, "accepted": false, "rejected": false, "ack": false } } }
                const ack2 = await collection.updateOne(filter, updateDoc)
                if (ack1.acknowledged && ack2.acknowledged) {
                    mongoClient.close()
                    return NextResponse.json({ message: 'request sent successfully' }, { status: 200 })
                } else {
                    mongoClient.close()
                    return NextResponse.json({ message: 'some error occured' }, { status: 400 })
                }
            } else {
                mongoClient.close()
                return NextResponse.json({ message: 'challenge already exist' }, { status: 400 })
            }
        } else {
            mongoClient.close()
            return NextResponse.json({ message: 'some error occured' }, { status: 400 })
        }
    } catch (error) {
        mongoClient.close()
        return NextResponse.json({ message: 'some error occured' }, { status: 400 })
    }
}