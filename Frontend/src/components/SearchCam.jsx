import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/image.png";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import {Maximize, Shrink} from "lucide-react";
import { Watch } from 'react-loader-spinner';
import cam from '../assets/cam.png';

function SearchCam() {
  const [data, setData] = useState(null);
  const [processedImage, setProcessedImage] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const eventSourceRef = useRef(null);

  const [isloading, setisloading] = useState(false); // loading state for skeleton loading animation

  const [isFullScreen, setIsFullScreen] = useState(); // change to fullscreen mode
  const cameraRef = useRef(null);

  // Fullscreen toggle handler
  const toggleFullScreen = () => {
    const cameraElement = cameraRef.current;
    setIsFullScreen(false);
    if (!isFullScreen) {
      // Enter full screen
      if (cameraElement.requestFullscreen) {
        cameraElement.requestFullscreen();
      } else if (cameraElement.webkitRequestFullscreen) {
        cameraElement.webkitRequestFullscreen(); // Safari
      } else if (cameraElement.mozRequestFullScreen) {
        cameraElement.mozRequestFullScreen(); // Firefox
      } else if (cameraElement.msRequestFullscreen) {
        cameraElement.msRequestFullscreen(); // IE/Edge
      }
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

  // Live detection code
  const startLiveDetection = () => {
    if (!isDetecting) {
      setIsDetecting(true);
      setisloading(true); // Set loading true to display loader
      setData(null); // removes the previously loaded data
      setProcessedImage(""); // removes the previously processed image
      setLicensePlate(""); // removes the previous data
      
      // Start video feed and detection feed from the backend
      // Used eventsource instead of Axios to fetch data through live camera contunuously instead of just once
      const eventSource = new EventSource("http://127.0.0.1:8000/video_feed");
      eventSource.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);

          if (response.type === "video") {
            const liveFeed = document.getElementById("liveFeed");
            if (liveFeed) {
              const img = `data:image/jpeg;base64,${response.image}`;
              liveFeed.src = img;
            }
          } else if (response.type === "detection") {
            // Handle detection data
            if (response.reg_data) {
              setData(response.reg_data);
              setProcessedImage(`data:image/jpeg;base64,${response.processed_image}`);
              setLicensePlate(response.reg_data.registration_number);
              setisloading(false); // removes loader
              toast.success("License plate detected and processed.");
            } else {
              toast.error("No data found for the detected license plate.");
            }
          }
        } catch (error) {
          console.error("Error processing detection feed:", error);
          toast.error("Error processing detection feed.");
        }
      };

      eventSource.onerror = (error) => {
        console.error("Detection feed error:", error);
        toast.error("Detection feed connection error.");
        eventSource.close();
        setIsDetecting(false);
      };

      eventSourceRef.current = eventSource;
    }
  };

  const stopLiveDetection = () => {
    if (isDetecting) {
      setIsDetecting(false);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        setisloading(false);
        toast.info("Live detection stopped.");
      }
      document.getElementById("liveFeed").src = (cam);
    }
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const { user } = useAuth0();
  const { currentUser } = useAuth();
  const { isAuthenticated } = useAuth0();
  const { userLoggedIn } = useAuth();

  return (
    <div>
      {/* Navbar code */}
      <div className="flex justify-around items-center">
        <NavLink to="/">
          <img src={logo} alt="logo" className="lg:w-16 w-12" />
        </NavLink>
        {/* Button to switch between dark and light modes */}
        <button onClick={toggleMode} id="togglemode" className="ml-10 w-10 rounded-2xl border-2 border-black bg-white p-1 font-semibold uppercase text-black transition-all duration-300 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none">
        </button>
        <h1 className="font-bold bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text lg:text-4xl md:text-2xl">
        Detect with AI & YOLO
        </h1>
        {isAuthenticated && <h1 className="text-red-500 lg:text-2xl">{user.name}</h1>}
        {userLoggedIn && <h1 className="text-red-500 lg:text-2xl">{currentUser.email}</h1>}
      </div>

      <div id="showData" className="relative mt-10 min-h-[600px] lg:grid-cols-2 gap-5 md:flex ">

        {/* Live camera feed area */}
      
      <div id="showCam" className="flex flex-col w-fit gap-5">
        <div className="mt-10">
          <img
            src= {cam}
            id="liveFeed"
            alt="Live Camera Feed"
            className="border-4 border-orange-500 rounded-lg"
            style={{ width: "500px", height: "300px" }}
            ref={cameraRef}
          />
          {/* Fullscreen button */}
        <button
          onClick={toggleFullScreen}
          className="absolute top-14 left-2 z-40 w-fit rounded-2xl border-2 border-black bg-transparent p-1 font-semibold uppercase text-black transition-all duration-300 hover:bg-white hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0px_black] active:translate-x-[0px] active:translate-y-[0px] active:rounded-2xl active:shadow-none"
        >
          {isFullScreen ? <Shrink /> : <Maximize />}
        </button>
        </div> 

        {!isDetecting ? (
            <button
              onClick={startLiveDetection}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-800"
            >
              Start Detection
            </button>
          ) : (
            <button
              onClick={stopLiveDetection}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-800"
            >
              Stop Detection
            </button>
          )}

        </div>

      {/* Code to show the fetched data */}
      {/* {data && ( */}
        <div className="min-h-[30rem] lg:w-[45rem] border mt-5 rounded-md shadow-md overflow-auto flex flex-col items-center">
          <p className="text-sm m-2 text-center">
            Detect license plates in real-time with AI and YOLO integration.
          </p>
          <h2 className="text-center mt-2 text-orange-600">Detected Vehicle Data will appear here:</h2>

          {isloading ? 
          <><div className='flex w-full justify-center mt-10'><Watch radius={45} color='red'/></div>Scan a license plate via camera, and the fetched data will be momentarily displayed...</>
          : <></>}

          {licensePlate && (
            <div className="m-4 text-center">
              <h3>License Plate:</h3>
              <p className="text-xl text-orange-600">{licensePlate}</p>
            </div>
          )}

          {processedImage && (
            <div className="m-4 text-center">
              <h3>Processed Plate Image:</h3>
              <img src={processedImage} alt="Detected Plate" className="w-48 h-auto" />
            </div>
          )}
          
           {data && (<ul className="m-5 p-5 border rounded-xl bg-gray-800 text-white">
              <li><strong>Owner Name:</strong> {data.owner_name}</li>
              <li><strong>Fuel Type:</strong> {data.fuel_type}</li>
              <li><strong>Model:</strong> {data.model}</li>
              <li><strong>Ownership:</strong> {data.ownership}</li>
              <li><strong>Registration Authority:</strong> {data.registration_authority}</li>
              <li><strong>Registration Date:</strong> {data.registration_date}</li>
            </ul>)} 
        </div>
      </div>
      {/* )} */}
    </div>
  );
}

export default SearchCam;