import { NextResponse } from "next/server"
import { mongoClient } from '../../dbaccess'

export async function POST(req) {
    const request = await req.json()
    try {
        await mongoClient.connect()
        const db = mongoClient.db('ChessMateMain');
        let collection = db.collection('Users');
        let updateDoc = {
            $set: {
                "active-game": null
            }
        }
        let filter = { email: request["challengerInfo"]["email"] }
        let ack1 = await collection.updateOne(filter, updateDoc)
        filter = { email: request["acceptorInfo"]["email"] }
        let ack2 = await collection.updateOne(filter, updateDoc)
        await mongoClient.close()
        return NextResponse.json('aborted', { status: 200 })

    } catch (error) {
        await mongoClient.close()
        return NextResponse.json('err', { status: 400 })

    }
}