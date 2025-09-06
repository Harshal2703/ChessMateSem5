import Image from "next/image"
import { ForgotPassword } from "../Components/ForgotPassword"

export const metadata = {
    title: 'ChessMate | Forgot Password',
    description: 'World\'s First Online Chess Platform with Video chatting feature',
}

export default function ForgotPasswordPage() {
    return (<>
        <div className="min-h-screen py-10 px-16 items-center flex justify-between" style={{
            backgroundColor: '#00188e',
            backgroundImage: 'linear-gradient(45deg, #00188e 0%, #000000 32%)',

        }}>

            <div>
                <Image className="cursor-pointer" src="/logo3.png"
                    width={400}
                    height={130}
                    alt="Picture of the author" />
                <div className=" text-white p-8 rounded-2xl w-96 ">
                    <ForgotPassword />
                </div>
            </div>
            <div className="text-[60px] font-bold w-[50%] text-center">
                {"Online Chess Platform with Video Chatting"}
            </div>
        </div>
    </>
    )
}

