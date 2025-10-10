import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
    const navigate = useNavigate();
    
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
            <p>2 second redirect to login page...</p>
        </div>
    );
}

export default NotFound;