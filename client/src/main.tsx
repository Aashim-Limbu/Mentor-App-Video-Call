import {createRoot} from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import {createBrowserRouter, RouterProvider} from "react-router";
import Home from "./routes/Home.tsx";
import Sender from "./routes/Sender.tsx";
import Receiver from "./routes/Receiver.tsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {index: true, element: <Home />},
            {path: "sender", element: <Sender />},
            {path: "receiver", element: <Receiver />},
        ],
    },
]);
createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
