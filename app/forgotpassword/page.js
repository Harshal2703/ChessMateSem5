import { ForgotPassword } from "../Components/ForgotPassword"

export const metadata = {
    title: 'ChessMate | Forgot Password',
    description: 'World\'s First Online Chess Platform with Video chatting feature',
}

export default function ForgotPasswordPage() {
    return (<>
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white text-black p-8 rounded shadow-md w-96">
                <ForgotPassword />
            </div>
        </div>
    </>)
}

