import { cookies } from 'next/headers';
const jose = require('jose');
import { mongoClient } from '../dbaccess';
import { NextResponse } from 'next/server.js';

// Create a reusable database connection
const db = mongoClient.db('ChessMateMain');
const collection = db.collection('Users');

export async function GET(req) {
    try {
        await mongoClient.connect();
        const cookieStore = cookies();
        const token = cookieStore.get('jwt_auth_token');
        const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
        
        if (token) {
            const { payload, protectedHeader } = await jose.jwtVerify(token.value, secret);
            let data = (await collection.find({ 'email': payload.email }).toArray())[0];
            return NextResponse.json({ message: 'success', data }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'some error occurred' }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ message: 'some error occurred' }, { status: 400 });
    } finally {
        // Ensure the client is always closed
        await mongoClient.close();
    }
}
