import { NextResponse } from "next/server"
import { mongoClient } from '../../dbaccess'


export async function POST(req) {
    const request = await req.json()
    if (request["reason"] && request["gameObj"]) {
        const db = mongoClient.db('ChessMateMain');
        let collection = db.collection('Users');
        await mongoClient.connect()
        let updateDoc = {
            $set: {
                "active-game": null,
                "rating": request["ratingOfChallenger"]
            }
        }
        let filter = { email: request["gameObj"]["challengerInfo"]["email"] }
        let ack1 = await collection.updateOne(filter, updateDoc)
        updateDoc = {
            $set: {
                "active-game": null,
                "rating": request["ratingOfAcceptor"]
            }
        }
        filter = { email: request["gameObj"]["acceptorInfo"]["email"] }
        let ack2 = await collection.updateOne(filter, updateDoc)

        updateDoc = { $push: { "gameHistory": { 'gameId': request["gameObj"]["gameId"] } } }
        filter = { email: request["gameObj"]["challengerInfo"]["email"] }
        let ack3 = await collection.updateOne(filter, updateDoc)

        filter = { email: request["gameObj"]["acceptorInfo"]["email"] }
        let ack4 = await collection.updateOne(filter, updateDoc)
        await mongoClient.close()
        return NextResponse.json('done', { status: 200 })
    }
    return NextResponse.json('err', { status: 400 })
}