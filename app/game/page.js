import React from 'react'
import { GamePageComp } from '../Components/GamePage/GamePageComp'

export default function Page() {
    const inlineStyles = {
        backgroundImage: 'repeating-conic-gradient(#161616 0% 25%, #000000 0% 50%)',
        backgroundPosition: '0 0, 25px 25px',
        backgroundSize: '50px 50px',
        backgroundColor: '#000000',
    };
    return (
        <div style={inlineStyles} className='h-screen'>
            <GamePageComp />
        </div>
    )
}
