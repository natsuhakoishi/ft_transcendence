import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
    console.log("404 Not found");
    const navigate = useNavigate(); 

    useEffect( ()=> {
        setTimeout(() => {
            console.log("NotFound: redirect to /");
            navigate("/");
        }, 1000 * 2); //2s to login
    }, []);

    return (
        <div>
            <h1 className="bg-red-400">404 page Not Found</h1>
            <p>2 second redirect to login page...</p>
        </div>
    );
}

export default NotFound;