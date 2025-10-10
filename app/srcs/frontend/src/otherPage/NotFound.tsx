import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function NotFound() {
    const navigate = useNavigate(); 
    const location = useLocation();
    const { msg } = ( location.state || {} ) as { msg: string};
    console.log("404 Not found", msg);
    
    useEffect( ()=> {
        document.title = "404";
        const timer = setTimeout(() => {
            console.log("NotFound: redirect to /");
            navigate("/", { replace: true });
        }, 1000 * 2);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div>
            <h1 className="bg-red-400">404 page Not Found</h1>
            <h3 className="bg-red-400">{msg}</h3>
            <p>2 second redirect to login page...</p>
        </div>
    );
}

export default NotFound;