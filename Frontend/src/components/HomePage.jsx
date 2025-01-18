import video from "../assets/video.mp4";
import img from "../assets/img.jpg";
import ScrollToTop from "react-scroll-to-top";
import { NavLink } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "../contexts/AuthContext";


const HomePage = () => {

const {isAuthenticated} = useAuth0();
const {userLoggedIn} = useAuth();

  return (
    <div id="home" className="flex flex-col items-center border-b border-neutral-800 mt-16 lg:mt-20">
        <h1 className="title text-4xl sm:text-6xl lg:text-8xl text-center tracking-wide">
            Automatic Number <span className="bg-gradient-to-r from-orange-700 to-red-800 text-transparent bg-clip-text">Plate Recognition</span>
        </h1>
        <p className="mt-10 text-lg text-center text-neutral-600 max-w-4xl text-pretty">Welcome to our Number Plate Detection website. This platform will help you identify and track your vehicles across different cities.Automatic Vehicle Number Plate Detection is an advanced technology that employs Optical Character Recognition (OCR) to accurately read vehicle license plates.The objective of a Automatic Vehicle Number Plate Detection is to automate the identification and recognition of vehicle license plates for improved traffic management, enhanced security, and efficient operational processes in applications like toll collection, parking management, and law enforcement, ensuring real-time data accuracy and regulatory compliance.
        </p>
        <div className="flex justify-center m-10">
        { userLoggedIn || isAuthenticated ? <></> : <NavLink to ="/Register" className="bg-gradient-to-r from-orange-500 to-orange-800 py-3 px-4 mx-3 rounded-md cursor-pointer">Start for free</NavLink>}
        {/* Auth0 authenticated */}
        {isAuthenticated && <NavLink to ="/Search" className="bg-gradient-to-r from-orange-500 to-orange-800 py-3 px-4 mx-3 rounded-md cursor-pointer">Search Using Image</NavLink>}
        {isAuthenticated && <NavLink to ="/SearchText" className="bg-gradient-to-r from-orange-500 to-orange-800 py-3 px-4 mx-3 rounded-md cursor-pointer">Search Using Text</NavLink>}
        {isAuthenticated && <NavLink to ="/SearchCam" className="bg-gradient-to-r from-orange-500 to-orange-800 py-3 px-4 mx-3 rounded-md cursor-pointer">Search Using Camera</NavLink>}

        {/* Firebase authenticated */}
        { userLoggedIn ? <NavLink to ="/Search" className="bg-gradient-to-r from-orange-500 to-orange-800 py-3 px-4 mx-3 rounded-md cursor-pointer">Search Using Image</NavLink> : <></>}
        { userLoggedIn ? <NavLink to ="/SearchText" className="bg-gradient-to-r from-orange-500 to-orange-800 py-3 px-4 mx-3 rounded-md cursor-pointer">Search Using Text</NavLink> : <></>}
        {userLoggedIn && <NavLink to ="/SearchCam" className="bg-gradient-to-r from-orange-500 to-orange-800 py-3 px-4 mx-3 rounded-md cursor-pointer">Search Using Camera</NavLink>}
        

        </div>
        <div className="flex justify-center mb-10">
            <img src={img} alt="Image" className="rounded-lg w-1/2 shadow-orange-400 mx-2 my-4"></img>
            <video autoPlay loop muted className="rounded-lg w-1/2 shadow-orange-400 mx-2 my-4">
            <source src={video} type="video/mp4" />
            Your browser does not support the video format.
            </video>
        </div>
        <ScrollToTop className="px-1 bg-transparent" smooth color="orange"/>
    </div>
  )
}

export default HomePage