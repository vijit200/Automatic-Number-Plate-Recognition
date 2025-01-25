// Search by entering license plate number (text)

import { NavLink } from 'react-router-dom';
import logo from '../assets/image.png';
import { useAuth0 } from '@auth0/auth0-react';
import axios from "axios";
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from "../contexts/AuthContext";
import { Watch } from 'react-loader-spinner';

const SearchText = () => {
  const [texts, setTexts] = useState(null);
  const [data, setData] = useState([]);

  const [isloading, setisloading] = useState(false); // loading state for skeleton loading animation

    
    // Send base64 image string to Flask backend and receive processed image
    const handleUpload = async () => {

      setisloading(true); // Set loading true to display loader
      
      // setTexts(document.getElementById('lsText').value);
      console.log(texts);
      
      if (texts == "")  return toast("Please enter the license plate number...") ;
      // alert("Processing the Text to Extract data")
      toast.info("Processing the Text to Extract data")

      //hiding the data for another search result
      const details = document.getElementById("details");
      details.classList.add("hidden");
      
      try {
        
            const response = await axios.post("http://127.0.0.1:8000/text", {
            text: texts
          },
            {
                headers: {
                  'Content-Type': 'application/json'
                }
              });
            // Set the received base64 string as processed image
            // console.log(response.data.processed_image["image"]);
            console.log(response.data.reg_data);
            setData(response.data.reg_data)

            // Unhide the data
            const details = document.getElementById("details");
            details.classList.remove("hidden");
            setisloading(false); // removes loader

            toast.success("Data successfully fetched and displayed !");
            
        } catch (error) {
            console.error("Error uploading:", error);
            // alert(error);
            toast.error("Failed to fetch data !");
        }finally {
          setisloading(false); // removes loader
        }
    };


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
                    // document.documentElement.querySelector('p').style.color = '';
        
                } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                    button.innerHTML = '&#x2600;';
                    // document.documentElement.querySelector('p').style.color = 'black';
                }
            }, [isDarkMode]);


    const {user} = useAuth0(); // Auth0
    const {currentUser} = useAuth(); // Firebase
    const {isAuthenticated} = useAuth0();
    const {userLoggedIn} = useAuth();

  return (
   <div className=''>

    <div className="flex justify-around items-center">
      <div className="flex items-center flex-shrink-0">
        <NavLink to = "/"><img src={logo}  alt="logo" className="w-16"></img></NavLink>
        {/* Button to switch between dark and light modes */}
        <button onClick={toggleMode} id="togglemode" className="ml-10 w-10 rounded-2xl border-2 border-black bg-white p-1 font-semibold uppercase text-black transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none">
        </button>
      </div>
      <h1 className='font-bold bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text lg:text-4xl md:text-3xl'>Detect with AI & YOLO</h1>
      {isAuthenticated && <h1 className='text-red-500 tracking-widest text-2xl'>{user.name}</h1>}
      {userLoggedIn && <h1 className='text-red-500 tracking-widest text-2xl'>{currentUser.email}</h1>}
    </div>
    
    <div className="relative mt-10 border-b border-neutral-800 min-h-[630px] grid justify-evenly">
    
     <div className="lg:min-h-[10rem] lg:w-[75rem] h-fit min-h-fit w-[35rem] border text-center rounded-md shadow-orange-400">
       <div className="text-xl text-orange-500 flex flex-col justify-center items-center">
         
       <h2 className='text-3xl mb-5 mt-5 text-red-500  p-1'>Detect Via License Plate Number</h2>
       <label className='text-md'>Enter Licence Plate Number :<input type="text" id="lsText" className='mb-5 ml-2 p-1 text-white border-2 border-red-800 rounded-md' onChange={(event) => setTexts(event.target.value)} />
       
       </label>
       <button onClick={handleUpload} className='border-4 text-white border-orange-500 mt-5 p-1 rounded-lg hover:border-red-700 hover:text-orange-500 mb-5'>Search</button>                                    
       </div>
     </div>
    
    
    <div className="lg:min-h-[20rem] lg:w-[75rem] h-fit min-h-[20rem] w-[35rem] border rounded-md shadow-orange-400 overflow-auto flex flex-col content-center">
      <p className='text-sm m-2 text-center'>
        Detecting objects with AI and YOLO (You Only Look Once) in real-time. Upload an image to see the detection results.
        <br />
        Note: This is a demo and the accuracy may vary depending on the image and the YOLO model used.
      </p>
    
      <p id="info" className='text-pretty text-orange-600'>
    
      <h1 className='text-center mt-2'>Data from API will appear here: </h1>
    
      
      {isloading ? 
      <><div className='flex w-full justify-center mt-12'><Watch radius={45} color='red'/></div></>
      : <></>}

      <ul id='details' className='m-5 p-5 border-2 border-white rounded-xl hidden text-center'>
        {console.log(data)}
        <li><span className='text-white'>Owner Name: </span>{data.owner_name}</li>
        <li><span className='text-white'>Fuel Type: </span>{data.fuel_type}</li>
        <li><span className='text-white'>Model: </span>{data.model}</li>
        <li><span className='text-white'>Ownership: </span>{data.ownership}</li>
        <li><span className='text-white'>registration_authority: </span>{data.registration_authority}</li>
        <li><span className='text-white'>registration_date: </span>{data.registration_date}</li>
        <li><span className='text-white'>registration_number: </span>{data.registration_number}</li>
    
      </ul>
    
      </p>
    </div>
  </div>
 </div>
  )
}

export default SearchText;