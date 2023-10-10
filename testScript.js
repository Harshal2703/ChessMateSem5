// import { MongoClient } from 'mongodb';

// const mongoClient = new MongoClient("mongodb+srv://harshal:miniprojectsem5@chessmate.2sgrpg4.mongodb.net/");
// const db = mongoClient.db('ChessMateMain');
// const collection = db.collection('Users');
// mongoClient.connect().then(async () => {
//     console.log("connected successfully")
//     const data = await collection.find({ 'username': { $regex: 'Ha' } }).toArray()
//     console.log(data)
//     mongoClient.close()
// }).catch((err) => {
//     console.log("failed")
// });



// const secret = new TextEncoder().encode(
//     'cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2',
// )
// console.log(secret)
// const alg = 'HS256'
// const test = async () => {

//     const jwt = await new jose.SignJWT({ 'urn:example:claim': true })
//         .setProtectedHeader({ alg })
//         .setIssuedAt()
//         .setExpirationTime('2h')
//         .sign(secret)
//     console.log(jwt)
// }
// test()

// const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ1cm46ZXhhbXBsZTpjbGFpbSI6dHJ1ZSwiaWF0IjoxNjk2NjY1MDE5LCJpc3MiOm51bGwsImF1ZCI6bnVsbCwiZXhwIjoxNjk2NjcyMjE5fQ.F8PL_hHwlRktrvmpuXAXzyYO3ZOypM04zLAXwQNBXoA'



// const { createSecretKey } = require('crypto');

// (async () => {
//     const jose = require('jose')
//     const secret = new TextEncoder().encode(
//         'cc7e0d44fd473002f1c42167459001140ec6389b7353f8088f4d9a95f2f596f2'
//     )
//     const token = await new jose.SignJWT({ id: '12345' }) // details to  encode in the token
//         .setProtectedHeader({ alg: 'HS256' }) // algorithm
//         .setIssuedAt()
//         .setExpirationTime('2h') // token expiration time, e.g., "1 day"
//         .sign(secret); // secretKey generated from previous step
//     console.log(token); // log token to console
// })();


(async () => {
    const jose = require('jose')
    const secret = new TextEncoder().encode(
        'eij3dffkedfd93vd392dkwsd923mskw'
    )
    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImhhcnNoYWxjaGF1ZGhhcmkyMDcwQGdtYWlsLmNvbSIsInBhc3N3b3JkIjoidGVzdHBhc3MxIiwiaWF0IjoxNjk2OTYwNTA3LCJleHAiOjE2OTc1NjUzMDd9.r9Fo4ffGOiw6wPJfErY98yBCcZWNnd6EsPzE3UQ0gso'
    try {
        const { payload, protectedHeader } = await jose.jwtVerify(token, secret);
        console.log(payload);
        console.log(protectedHeader);
    } catch (e) {
        console.log("Token is invalid");
    }
})()