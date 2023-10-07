import { SignInComponent } from "../Components/SignInComponent"
export const metadata = {
    title: 'ChessMate | Sign in',
    description: 'World\'s First Online Chess Platform with Video chatting feature',
}


export default function SignInPage() {
    return (
        <>
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white text-black p-8 rounded shadow-md w-96">
                    <SignInComponent />
                </div>
            </div>
        </>
    )
}
