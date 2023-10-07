import { SignUpComponent } from "../Components/SignUpComponent"

export const metadata = {
  title: 'ChessMate | Sign up',
  description: 'World\'s First Online Chess Platform with Video chatting feature',
}

export default function SignUpPage() {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white text-black p-8 rounded shadow-md w-96">
            <SignUpComponent/>
        </div>
      </div>
    </>
  )
}