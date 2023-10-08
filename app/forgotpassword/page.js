import Image from "next/image"
import { ForgotPassword } from "../Components/ForgotPassword"

export const metadata = {
    title: 'ChessMate | Forgot Password',
    description: 'World\'s First Online Chess Platform with Video chatting feature',
}

export default function ForgotPasswordPage() {
    return (<>
        <div className="min-h-screen flex flex-col items-center justify-center">
        <Image className="cursor-pointer" src="/logo3.png"
            width={400}
            height={130}
            alt="Picture of the author" />
            <div className="bg-white text-black p-8 rounded shadow-md w-96">
                <ForgotPassword />
            </div>
        </div>
    </>)
}

