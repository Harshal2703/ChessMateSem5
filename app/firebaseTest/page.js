'use client'
import React from 'react'
import { v4 as uuidv4 } from 'uuid';
import { } from '../../firbaseConfig'
import { getDatabase, ref, set, onValue, get, child } from "firebase/database";

const Page = () => {
    async function writeUserData(userId, name, email) {
        console.log(userId, name, email)
        const db = getDatabase();
        const res = await set(ref(db, 'users/' + userId), {
            username: name,
            email: email
        });
        console.log("res : ", res)
    }

    // const db = getDatabase();
    // onValue(ref(db, 'games/' + '12764910-01c8-4e34-a0f0-852ea84ad105'), (snapshot) => {
    //     const data = snapshot.val();
    //     console.log('data : ', data)
    // });
    const dbRef = ref(getDatabase());
    get(child(dbRef, `/games/12764910-01c8-4e34-a0f0-852ea84ad105`)).then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
    return (
        <div>Page</div>
    )
}
export default Page