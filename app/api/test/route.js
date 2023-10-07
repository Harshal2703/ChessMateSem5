import { NextResponse } from "next/server";

export async function GET(req) {
    const response = NextResponse.json({'etete':'ww'},{status:200})
    response.cookies.delete('abcxyz')
    return response
}