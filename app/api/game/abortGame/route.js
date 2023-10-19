import { NextResponse } from "next/server"
import { mongoClient } from '../../dbaccess'
import { child, get, getDatabase, ref, set } from "firebase/database";
import { } from '../../../../firbaseConfig'
async function writeGameData(gameId, updatePayload) {
    const db = getDatabase();
    await set(ref(db, 'games/' + gameId), updatePayload);
}

export async function POST(req) {
    const request = await req.json()
    const dbRef = ref(getDatabase());
    get(child(dbRef, `games/${request["gameId"]}`)).then(async (snapshot) => {
        if (snapshot.exists()) {
            const gameObj = snapshot.val()
            if (gameObj && !gameObj["gameOn"]) {
                await mongoClient.connect()
                const db = mongoClient.db('ChessMateMain');
                let collection = db.collection('Users');
                let updateDoc = {
                    $set: {
                        "active-game": null
                    }
                }
                let filter = { email: gameObj["challengerInfo"]["email"] }
                let ack1 = await collection.updateOne(filter, updateDoc)
                filter = { email: gameObj["acceptorInfo"]["email"] }
                let ack2 = await collection.updateOne(filter, updateDoc)
                gameObj["aborted"] = true
                gameObj["abortedBy"] = request["abortedBy"]
                gameObj["gameOver"] = true
                await writeGameData(gameObj["gameId"], gameObj)
                await mongoClient.close()
                return NextResponse.json('aborted', { status: 200 })
            }
        }
    })
    return NextResponse.json('err', { status: 400 })
}