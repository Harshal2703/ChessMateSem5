import { cookies } from 'next/headers'
const jose = require('jose')
import { mongoClient } from '../dbaccess'
import { NextResponse } from 'next/server.js'
import { v4 as uuidv4 } from 'uuid';


export async function POST(req) {
    const cookieStore = cookies()
    const token = cookieStore.get('jwt_auth_token')
    const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
    const { payload, protectedHeader } = await jose.jwtVerify(token.value, secret);
    const db = mongoClient.db('ChessMateMain');
    const collection = db.collection('Users');
    await mongoClient.connect()
    const serverInfoOfUser = (await collection.find({ 'email': payload.email }).toArray())[0]
    const friendToBeAdded = (await req.json()).friendToBeAdded
    const serverInfoOgFriendToBeAdded = (await collection.find({ 'email': friendToBeAdded.email }).toArray())[0]
    if (serverInfoOfUser && serverInfoOgFriendToBeAdded) {
        const temp = serverInfoOfUser.friends.filter((friend) => {
            return friend.accepted === true
        })
        if (temp.length !== 0) {
            const result = temp.find((friend) => {
                return serverInfoOgFriendToBeAdded.email === friend.email
            })
            if (result) {
                await mongoClient.close()
                return NextResponse.json({ 'message': 'already friend' }, { status: 500 })
            }
        }
        const friendReqObj = {
            reqId: uuidv4(),
            email: serverInfoOfUser.email,
            username: serverInfoOfUser.username,
            profilePicUrl: serverInfoOfUser.profilePicUrl,
            rating: serverInfoOfUser.rating,
            reqGenTime: Date.now(),
            reqExpTime: Date.now() + (900 * 1000),
            accepted: false
        }
        const filter = { email: serverInfoOgFriendToBeAdded.email }
        const updateDoc = { $push: { "friends": friendReqObj } }
        const ack = await collection.updateOne(filter, updateDoc)
        if (ack.acknowledged) {
            await mongoClient.close()
            return NextResponse.json({ 'message': 'request sent' }, { status: 200 })
        } else {
            await mongoClient.close()
            return NextResponse.json({ 'message': 'something went wrong' }, { status: 500 })
        }
    }
    await mongoClient.close()
    return NextResponse.json({ 'message': 'something went wrong' }, { status: 500 })
}


// try {
//     const cookieStore = cookies()
//     const token = cookieStore.get('jwt_auth_token')
//     const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
//     const { payload, protectedHeader } = await jose.jwtVerify(token.value, secret);
//     const db = mongoClient.db('ChessMateMain');
//     const collection = db.collection('Users');
//     await mongoClient.connect()
//     const serverInfoOfUser = (await collection.find({ 'email': payload.email }).toArray())[0]
//     const serverInfoOfFriend = (await collection.find({ 'email': friendToBeAdded.email }).toArray())[0]
//     if (serverInfoOfUser.email && serverInfoOfFriend.email) {
//         const friends = serverInfoOfUser.friends
//         function checkFriend(friend) {
//             return friend.email === serverInfoOfFriend.email;
//         }
//         const result = friends.find(checkFriend)
//         if (!result) {
//             const reqId = uuidv4()
//             let email = serverInfoOfFriend.email
//             let username = serverInfoOfFriend.username
//             let profilePicUrl = serverInfoOfFriend.profilePicUrl
//             let rating = serverInfoOfFriend.rating
//             let requestGenTime = Date.now()
//             let requestExpTime = (Date.now() + (1000 * 60 * 60 * 12))
//             let filter = { email: serverInfoOfUser.email }
//             let updateDoc = { $push: { "requests-out": { reqId, 'reqType': 'friend', email, username, profilePicUrl, rating, requestGenTime, requestExpTime, "accepted": false, "rejected": false, "ack": false } } }
//             const ack1 = await collection.updateOne(filter, updateDoc)
//             email = serverInfoOfUser.email
//             username = serverInfoOfUser.username
//             profilePicUrl = serverInfoOfUser.profilePicUrl
//             rating = serverInfoOfUser.rating
//             filter = { email: serverInfoOfFriend.email }
//             updateDoc = { $push: { "requests-in": { reqId, 'reqType': 'friend', email, username, profilePicUrl, rating, requestGenTime, requestExpTime, "accepted": false, "rejected": false, "ack": false } } }
//             const ack2 = await collection.updateOne(filter, updateDoc)
//             if (ack1.acknowledged && ack2.acknowledged) {
//                 mongoClient.close()
//             } else {
//                 mongoClient.close()
//                 return NextResponse.json({ message: 'some error occured' }, { status: 400 })
//             }
//         } else {
//             mongoClient.close()
//             return NextResponse.json({ message: 'friend already exist' }, { status: 400 })
//         }
//     } else {
//         mongoClient.close()
//         return NextResponse.json({ message: 'some error occured' }, { status: 400 })
//     }
// } catch (error) {
//     mongoClient.close()
//     return NextResponse.json({ message: 'some error occured' }, { status: 400 })
// }