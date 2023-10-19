import { NextResponse } from "next/server"
import { mongoClient } from '../dbaccess'
import { cookies } from "next/headers"
const jose = require('jose')
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, ref, set } from "firebase/database";
import { } from '../../../firbaseConfig'
async function writeGameData(gameId, gameObj) {
    const db = getDatabase();
    const res = await set(ref(db, 'games/' + gameId), gameObj);
}

export async function POST(req) {
    const request = await req.json()
    const cookieStore = cookies()
    const token = cookieStore.get('jwt_auth_token')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
    const { payload, protectedHeader } = await jose.jwtVerify(token.value, secret);
    const db = mongoClient.db('ChessMateMain');
    let collection = db.collection('Users');
    await mongoClient.connect()
    const serverInfoOfUser = (await collection.find({ 'email': payload.email }).toArray())[0]
    const unacceptedReqUser = serverInfoOfUser.challenges.find((challenge) => {
        return challenge.reqId === request.reqId
    })
    const serverInfoOfOpponent = (await collection.find({ 'email': unacceptedReqUser.email }).toArray())[0]
    const unacceptedReqOpponent = serverInfoOfOpponent.challenges.find((challenge) => {
        return challenge.reqId === request.reqId
    })
    if (unacceptedReqUser && unacceptedReqOpponent && request.rej) {
        let filter = { email: serverInfoOfUser.email }
        let updateDoc = { $pull: { "challenges": { 'reqId': request.reqId } } }
        let ack1 = await collection.updateOne(filter, updateDoc)
        filter = { email: serverInfoOfOpponent.email }
        updateDoc = { $pull: { "challenges": { 'reqId': request.reqId } } }
        let ack2 = await collection.updateOne(filter, updateDoc)
        if (ack1.acknowledged && ack2.acknowledged) {
            mongoClient.close()
            return NextResponse.json('challenge rejected ', { status: 200 })
        }
    }
    if (unacceptedReqUser && unacceptedReqOpponent && request.acc) {
        let filter = { email: serverInfoOfUser.email }
        let updateDoc = { $pull: { "challenges": { 'reqId': request.reqId } } }
        let ack1 = await collection.updateOne(filter, updateDoc)
        filter = { email: serverInfoOfOpponent.email }
        updateDoc = { $pull: { "challenges": { 'reqId': request.reqId } } }
        let ack2 = await collection.updateOne(filter, updateDoc)
        const gameId = uuidv4()
        const gameObj = {
            gameId,
            challengerInfo: {
                "email": serverInfoOfOpponent.email,
                "username": serverInfoOfOpponent.username,
                "rating": serverInfoOfOpponent.rating,
                "profilePicUrl": serverInfoOfOpponent.profilePicUrl
            },
            acceptorInfo: {
                "email": serverInfoOfUser.email,
                "username": serverInfoOfUser.username,
                "rating": serverInfoOfUser.rating,
                "profilePicUrl": serverInfoOfUser.profilePicUrl
            },
            challengerReady: false,
            acceptorReady: false,
            black: null,
            white: null,
            gameOn: false,
            gameOver: false,
            aborted: false,
            abortedFrom: null,
            draw: false,
            drawOfferedFrom: null,
            drawAccepted: false,
            whoWon: null,
            resigned: false,
            resignedBy: null,
            gameOverReason: null,
            textChats: [{ 'whoIm': 'ts', "message": 'test' }], // {"from":"abc" , "message":"hi"}
            videoChat: {}, // to be decided
            moves: [],  // fen strings
        }
        updateDoc = {
            $set: {
                "active-game": gameId
            }
        }
        filter = { email: serverInfoOfUser.email }
        let ack3 = await collection.updateOne(filter, updateDoc)
        filter = { email: serverInfoOfOpponent.email }
        let ack4 = await collection.updateOne(filter, updateDoc)
        await writeGameData(gameId, gameObj)
        // collection = db.collection('Games');
        // let ack5 = await collection.insertOne(gameObj)

        if (ack1.acknowledged && ack2.acknowledged && ack3.acknowledged && ack4.acknowledged) {
            mongoClient.close()
            return NextResponse.json('challenge accepted ', { status: 200 })
        }
    }
    mongoClient.close()
    return NextResponse.json('err', { status: 400 })
}