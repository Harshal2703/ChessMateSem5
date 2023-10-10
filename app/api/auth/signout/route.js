import { NextResponse } from "next/server";
export async function GET(req) {
    const response = NextResponse.json({'message':'signedout successfully'},{status:200})
    response.cookies.delete('jwt_auth_token')
    return response
}