import Navbar from "../components/Navbar";
import CameraFeed from "../components/CameraFeed";
import SecurityToggle from "../components/SecurityToggle";
import AlertPanel from "../components/AlertPanel";
import EmergencyContacts from "../components/EmergencyContacts";

export default function Dashboard() {
  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <Navbar />

      <div className="flex flex-col md:flex-row gap-8 p-6">
        {/* Camera Feed Section */}
        <div className="flex-1">
          <CameraFeed />
        </div>

        {/* Controls Section */}
        <div className="flex flex-col gap-6">
          <SecurityToggle />
          <EmergencyContacts />
        </div>
      </div>

      {/* 🧠 Alerts Section at the bottom */}
      <div className="p-6">
        <AlertPanel />
      </div>
    </div>
  );
}
