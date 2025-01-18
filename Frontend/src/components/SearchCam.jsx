import { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/image.png";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

function SearchCam() {
  const [data, setData] = useState(null);
  const [processedImage, setProcessedImage] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const eventSourceRef = useRef(null);

  const startLiveDetection = () => {
    if (!isDetecting) {
      setIsDetecting(true);
      
      // Start video feed and detection feed from the backend
      const eventSource = new EventSource("http://127.0.0.1:8000/video_feed");

      eventSource.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);

          if (response.type === "video") {
            // Set the live video feed as base64 image
            const img = `data:image/jpeg;base64,${response.image}`;
            document.getElementById("liveFeed").src = img;
          } else if (response.type === "detection") {
            // Handle detection data
            if (response.reg_data) {
              setData(response.reg_data);
              setProcessedImage(`data:image/jpeg;base64,${response.processed_image}`);
              setLicensePlate(response.reg_data.registration_number);
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
        toast.info("Live detection stopped.");
      }
      document.getElementById("liveFeed").src = "";
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
      <div className="flex justify-around items-center">
        <NavLink to="/">
          <img src={logo} alt="logo" className="lg:w-16 w-12" />
        </NavLink>
        <h1 className="font-bold bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text lg:text-4xl md:text-2xl">
          AI License Plate Detection
        </h1>
        {isAuthenticated && <h1 className="text-red-500 lg:text-2xl">{user.name}</h1>}
        {userLoggedIn && <h1 className="text-red-500 lg:text-2xl">{currentUser.email}</h1>}
      </div>

      <div className="relative mt-10 min-h-[600px]">
        <div className="min-h-[30rem] lg:w-[77rem] border rounded-md shadow-md overflow-auto flex flex-col items-center">
          <p className="text-sm m-2 text-center">
            Detect license plates in real-time with AI and YOLO integration.
          </p>
          <h2 className="text-center mt-2 text-orange-600">Detected Vehicle Data:</h2>

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

          {data && (
            <ul className="m-5 p-5 border rounded-xl bg-gray-800 text-white">
              <li><strong>Owner Name:</strong> {data.owner_name}</li>
              <li><strong>Fuel Type:</strong> {data.fuel_type}</li>
              <li><strong>Model:</strong> {data.model}</li>
              <li><strong>Ownership:</strong> {data.ownership}</li>
              <li><strong>Registration Authority:</strong> {data.registration_authority}</li>
              <li><strong>Registration Date:</strong> {data.registration_date}</li>
            </ul>
          )}
        </div>

        <div className="mt-5 flex justify-center">
          <img
            id="liveFeed"
            alt="Live Camera Feed"
            className="border-4 border-orange-500 rounded-lg"
            style={{ width: "720px", height: "480px" }}
          />
        </div>

        <div className="mt-5 flex justify-center">
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
      </div>
    </div>
  );
}

export default SearchCam;
