import { NextResponse } from "next/server"
import { mongoClient } from '../dbaccess'
import { cookies } from "next/headers"
const jose = require('jose')

export async function POST(req) {
    const request = await req.json()
    const cookieStore = cookies()
    const token = cookieStore.get('jwt_auth_token')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
    const { payload, protectedHeader } = await jose.jwtVerify(token.value, secret);
    const db = mongoClient.db('ChessMateMain');
    const collection = db.collection('Users');
    await mongoClient.connect()
    const serverInfoOfUser = (await collection.find({ 'email': payload.email }).toArray())[0]
    const unacceptedReq = serverInfoOfUser.friends.find((friend) => {
        return friend.reqId === request.reqId
    })
    if (unacceptedReq && request.acc) {
        let acceptedReq = unacceptedReq
        acceptedReq['accepted'] = true
        let filter = { email: serverInfoOfUser.email }
        let updateDoc = { $pull: { "friends": { 'reqId': request.reqId } } }
        let ack1 = await collection.updateOne(filter, updateDoc)
        filter = { email: serverInfoOfUser.email }
        updateDoc = { $push: { "friends": acceptedReq } }
        let ack2 = await collection.updateOne(filter, updateDoc)
        let myObj = {
            "reqId": request.reqId,
            "email": serverInfoOfUser.email,
            "username": serverInfoOfUser.username,
            "profilePicUrl": serverInfoOfUser.profilePicUrl,
            "rating": serverInfoOfUser.rating,
            "reqGenTime": 1697047975392,
            "reqExpTime": 1697048875392,
            "accepted": true
        }
        filter = { email: acceptedReq.email }
        updateDoc = { $push: { "friends": myObj } }
        let ack3 = await collection.updateOne(filter, updateDoc)
        if (ack1.acknowledged && ack2.acknowledged && ack3.acknowledged) {
            await mongoClient.close()
            return NextResponse.json('friend added successfully', { status: 200 })
        }
    }
    if (unacceptedReq && request.rej) {
        let filter = { email: serverInfoOfUser.email }
        let updateDoc = { $pull: { "friends": { 'reqId': request.reqId } } }
        let ack1 = await collection.updateOne(filter, updateDoc)
        if (ack1.acknowledged) {
            await mongoClient.close()
            return NextResponse.json('request rejected', { status: 200 })
        }
    }
    return NextResponse.json('err', { status: 400 })
}



// try {

//     await mongoClient.connect()
//     const cookieStore = cookies()
//     const token = cookieStore.get('jwt_auth_token')
//     const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
//     const { payload, protectedHeader } = await jose.jwtVerify(token.value, secret);
//     const db = mongoClient.db('ChessMateMain');
//     const collection = db.collection('Users');
//     const serverInfoOfUser = (await collection.find({ 'email': payload.email }).toArray())[0]

//     const requestsIn = serverInfoOfUser["requests-in"]
//     function checkRequest(reque) {
//         return (reque.reqId === request.reqId)
//     }
//     const result = requestsIn.find(checkRequest)
//     if (result) {
//         if (result.reqType === 'friend') {
//             if (!result.ack) {
//                 let filter = { email: serverInfoOfUser.email }
//                 let updateDoc = { $push: { "friends": { 'email': result.email, 'username': result.username, 'profilePicUrl': result.profilePicUrl, 'rating': result.rating } } }
//                 const ack1 = await collection.updateOne(filter, updateDoc)
//                 filter = { email: result.email }
//                 updateDoc = { $push: { "friends": { 'email': serverInfoOfUser.email, 'username': serverInfoOfUser.username, 'profilePicUrl': serverInfoOfUser.profilePicUrl, 'rating': serverInfoOfUser.rating } } }
//                 const ack2 = await collection.updateOne(filter, updateDoc)
//                 if (ack1 && ack2) {
//                     filter = { email: serverInfoOfUser.email }
//                     updateDoc = { $pull: { "requests-in": { 'email': request.email } } }
//                     const ack3 = await collection.updateOne(filter, updateDoc)
//                     filter = { email: request.email }
//                     updateDoc = { $pull: { "requests-out": { 'email': serverInfoOfUser.email } } }
//                     const ack4 = await collection.updateOne(filter, updateDoc)
//                     if (ack3 && ack4) {
//                         await mongoClient.close()
//                         return NextResponse.json('friend added successfully', { status: 200 })
//                     } else {
//                         await mongoClient.close()
//                         return NextResponse.json({ 'message': 'result not found' }, { status: 400 })
//                     }

//                 } else {
//                     await mongoClient.close()
//                     return NextResponse.json({ 'message': 'result not found' }, { status: 400 })

//                 }
//             } else {
//                 await mongoClient.close()
//                 return NextResponse.json({ 'message': 'result not found' }, { status: 400 })
//             }
//         } else if (result.reqType === 'challenge') {
//             if (!result.ack) {

//             } else {
//                 return NextResponse.json({ 'message': 'result not found' }, { status: 400 })
//             }
//         } else {
//             return NextResponse.json({ 'message': 'result not found' }, { status: 400 })
//         }
//     } else {
//         await mongoClient.close()
//         return NextResponse.json({ 'message': 'result not found' }, { status: 400 })
//     }
// } catch (error) {

// }