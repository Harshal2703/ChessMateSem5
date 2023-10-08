import { SignUpComponent } from "../Components/SignUpComponent"
import Image from 'next/image'


export const metadata = {
  title: 'ChessMate | Sign up',
  description: 'World\'s First Online Chess Platform with Video chatting feature',
}

export default function SignUpPage() {
  return (
    <>
      <div className="min-h-screen py-10 px-16 items-center flex justify-between" style={{
        backgroundColor: '#00188e',
        backgroundImage: 'linear-gradient(45deg, #00188e 0%, #000000 32%)',

      }}>

        <div>
          <Image className="cursor-pointer" src="/logo3.png"
            width={400}
            height={130}
            alt="Picture of the author" />
          <div className=" text-white p-8 rounded-2xl shadow-md w-96 " style={{
            WebkitBackdropFilter: 'blur(118px)',
            backdropFilter: 'blur(118px)',
            boxShadow: '0px 10px 15px 10px rgba(0, 0, 0, 0.15)',
            backgroundColor: 'rgba(250, 250, 250, 0.15)',
          }}>
            <SignUpComponent />
          </div>
        </div>
        <div className="text-[60px] font-bold w-[50%] text-center">
          {"World's First Online Chess Platform with Video Chatting Feature"}
        </div>
      </div>
    </>
  )
}