import { MainPageComp } from './Components/MainPage/MainPageComp.jsx'


export default async function Home() {
  
  const inlineStyles = {
    backgroundImage: 'repeating-conic-gradient(#161616 0% 25%, #000000 0% 50%)',
    backgroundPosition: '0 0, 25px 25px',
    backgroundSize: '50px 50px',
    backgroundColor: '#000000',
  };
  
  return (
    <div style={inlineStyles}>
      <MainPageComp />
    </div>
  )
}
