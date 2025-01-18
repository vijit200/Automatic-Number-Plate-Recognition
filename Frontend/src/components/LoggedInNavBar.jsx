// Navbar used when ligged in using Auth0

import { useAuth0 } from "@auth0/auth0-react"
import {Menu, X} from "lucide-react";
import { useState, useEffect } from "react";
import image from "../assets/image.png";
import {NavLink} from "react-router-dom";
import { Link } from "react-scroll";

const LoggedInNavBar = () => {

    const {user, logout} = useAuth0();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const toggleNavbar = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    }

    // code for the theme toggle button
     // Check for the saved theme in localStorage or default to dark mode
     const storedTheme = localStorage.getItem('theme');
     // console.log(storedTheme);
     const [isDarkMode, setIsDarkMode] = useState(storedTheme ? storedTheme === 'dark' : true);
     const toggleMode = () => {
         const newMode = !isDarkMode; // toggle the mode
         setIsDarkMode(newMode);
 
         // Save the selected mode in localStorage
         localStorage.setItem('theme', newMode ? 'dark' : 'light');
     };
    
        // Apply dark/light mode to the document body on mount and when the mode changes
        useEffect(() => {
            const button = document.getElementById('togglemode');
    
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
                button.innerHTML = '&#x1f319;';
    
            } else {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
                button.innerHTML = '&#x2600;';
            }
        }, [isDarkMode]);
    
  return (
    <nav className="fixed w-full top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-700/80">
        <div className="container px-4 mx-auto relative text-sm">
            <div className="flex justify-between items-center">
                <div className="flex items-center flex-shrink-0">
                    <NavLink to = "/"><img src={image}  alt="logo" className="w-16 h-14"></img></NavLink>

                    {/* Button to switch between dark and light modes */}
                    <button onClick={toggleMode} id="togglemode" className="ml-10 w-10 rounded-2xl border-2 border-black bg-white p-1 font-semibold uppercase text-black transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none">
                    </button>
                </div>

                <ul className="hidden lg:flex ml-32 space-x-12">

                    {/* scroll to the component using react-scroll */}
                    <Link to="home" spy={true} smooth={true} duration={500} offset={-80} activeClass="text-orange-400 border-b-2">
                        <li className="cursor-pointer hover:text-orange-400">Home</li>
                    </Link>
                    <Link to="features" spy={true} smooth={true} duration={500} offset={-75} activeClass="text-orange-400 border-b-2">
                        <li className="cursor-pointer hover:text-orange-400">Features</li>
                    </Link>
                    <Link to="about" spy={true} smooth={true} duration={500} offset={-75} activeClass="text-orange-400 border-b-2">
                        <li className="cursor-pointer hover:text-orange-400">About</li>
                    </Link>
                    <Link to="contact" spy={true} smooth={true} duration={500} offset={-75} activeClass="text-orange-400 border-b-2">
                        <li className="cursor-pointer hover:text-orange-400">Contact</li>
                    </Link>

                    {/* <NavLink to = "/" className={(e)=>{return e.isActive ? "text-orange-400" : ""}}><li className="cursor-pointer hover:text-orange-400">Home</li></NavLink>
                    <NavLink to = "/FeaturesSection" className={(e)=>{return e.isActive ? "text-orange-400" : ""}}><li className="cursor-pointer hover:text-orange-400">Features</li></NavLink>
                    <NavLink to = "/About" className={(e)=>{return e.isActive ? "text-orange-400" : ""}}><li className="cursor-pointer hover:text-orange-400">About</li></NavLink>
                    <NavLink to = "/Contact" className={(e)=>{return e.isActive ? "text-orange-400" : ""}}><li className="cursor-pointer hover:text-orange-400">Contact</li></NavLink> */}
                </ul>
                <div className="hidden lg:flex justify-center space-x-12 items-center">
                <h1>Welcome, {user.name}</h1><button onClick={()=> logout()} className="px-3 py-2 border rounded-md hover:translate-y-0.5 duration-200">Logout</button>
                </div>
                <div className="lg:hidden md:flex flex-col justify-end">
                    <button onClick={toggleNavbar}>
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>
            {mobileMenuOpen && (
                <div className="fixed right-0 z-20 bg-neutral-900 w-full p-12 flex flex-col justify-center items-center lg:hidden">
                    <h1>Welcome, {user.name}</h1>
                    <ul>

                    {/* scroll to the component using react-scroll */}
                    {/* <Link to="home" spy={true} smooth={true} duration={500} offset={-80}>
                        <li className="cursor-pointer hover:text-orange-400">Home</li>
                    </Link>
                    <Link to="features" spy={true} smooth={true} duration={500} offset={-80}>
                        <li className="cursor-pointer hover:text-orange-400">Features</li>
                    </Link>
                    <Link to="about" spy={true} smooth={true} duration={500} offset={-80}>
                        <li className="cursor-pointer hover:text-orange-400">About</li>
                    </Link>
                    <Link to="contact" spy={true} smooth={true} duration={500} offset={-80}>
                        <li className="cursor-pointer hover:text-orange-400">Contact</li>
                    </Link> */}

                    <NavLink to = "/" className={(e)=>{return e.isActive ? "text-orange-400" : ""}}><li className="cursor-pointer py-4 hover:text-orange-400">Home</li></NavLink>
                    <NavLink to = "/FeaturesSection" className={(e)=>{return e.isActive ? "text-orange-400" : ""}}><li className="cursor-pointer py-4 hover:text-orange-400">Features</li></NavLink>
                    <NavLink to = "/About" className={(e)=>{return e.isActive ? "text-orange-400" : ""}}><li className="cursor-pointer py-4 hover:text-orange-400">About</li></NavLink>
                    <NavLink to = "/Contact" className={(e)=>{return e.isActive ? "text-orange-400" : ""}}><li className="cursor-pointer py-4 hover:text-orange-400">Contact</li></NavLink>
                </ul>
                <div className="flex space-x-6">
                    <button onClick={()=> logout()} className="px-3 py-2 border rounded-md hover:translate-y-0.5 duration-200">Logout</button>
                </div>
                </div>
            )}
        </div>
    </nav>
  )
}

export default LoggedInNavBar