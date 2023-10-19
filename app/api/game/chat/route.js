import { NextResponse } from "next/server"
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
            if (gameObj && !gameObj["gameOver"]) {
                gameObj["textChats"].push({ "from": request["whoIm"], "message": request["chat"] })
                await writeGameData(gameObj["gameId"], gameObj)
                return NextResponse.json('done', { status: 200 })
            }
        }
    })
    return NextResponse.json('failed', { status: 400 })
}