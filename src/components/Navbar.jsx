import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
      <h1 className="text-2xl font-semibold text-blue-600">SmartShield</h1>
      <div className="flex items-center gap-4">
        <Link to="/profile" className="text-gray-600 hover:text-blue-500">
          Profile
        </Link>
        <Menu className="text-gray-700" />
      </div>
    </div>
  );
}
