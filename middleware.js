import { NextResponse } from 'next/server'
const jose = require('jose')

export async function middleware(request) {
    const path = request.nextUrl.pathname
    if (path === '/' || path === '/profile' || path === '/api/getInfo' || path === '/api/search' || path === '/api/addFriend') {
        const token = request.cookies.get('jwt_auth_token')
        if (token === undefined) {
            return NextResponse.redirect(new URL('/signin', request.nextUrl.origin))
        } else {
            try {
                const secretKey = new TextEncoder().encode(process.env.JWT_SECRET_KEY)
                const { payload, protectedHeader } = await jose.jwtVerify(token.value, secretKey);
                // console.log(payload);
                // console.log(protectedHeader);
                return NextResponse.next()
            } catch (e) {
                console.log("Token is invalid");
                return NextResponse.redirect(new URL('/signin', request.nextUrl.origin))
            }
        }
    }
    return NextResponse.next()
}