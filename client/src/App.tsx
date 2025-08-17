import {Link, Outlet} from "react-router";

export default function App() {
    return (
        <div className="w-full max-w-7xl mx-auto">
            <nav className="flex justify-between py-2">
                <p className="text-2xl text-blue-500 font-semibold">
                    <Link to="/">App</Link>
                </p>
                <ul className="flex items-center gap-x-4">
                    <li>
                        <Link to="/sender">sender</Link>
                    </li>
                    <li>
                        <Link to="/receiver">Receiver</Link>
                    </li>
                </ul>
            </nav>
            <div className="outlet">
                <Outlet />
            </div>
        </div>
    );
}
