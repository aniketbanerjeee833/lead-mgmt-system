// SideMenuLayout.jsx
import { Link, useLocation } from "react-router-dom";


// export default function SideMenu({ role }) {
//   const location = useLocation();

//   const menuItems = [
//     { name: "All Leads", path: "/home", roles: ["user", "admin"] },
//     { name: "Notifications", path: "/notifications", roles: ["admin"] },
//   ];

//   return (
//     <aside className="w-64 bg-white shadow-lg p-4 min-h-screen">
//       <h2 className="text-xl font-bold mb-6">Lead Management</h2>
//       <nav className="space-y-2">
//         {menuItems
//           .filter((item) => item.roles.includes(role))
//           .map((item) => (
//             <Link
//               key={item.path}
//               to={item.path}
//               className={`block px-4 py-2 rounded-lg transition ${
//                 location.pathname === item.path
//                   ? "bg-blue-500 text-white"
//                   : "text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               {item.name}
//             </Link>
//           ))}
//       </nav>
//     </aside>
//   );
// }


import { useEffect, useState } from "react";

import io from "socket.io-client";
import axios from "axios";
import { useSelector } from "react-redux";



const socket = io("http://localhost:5000"); // your backend

export default function SideMenu({ role }) {
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const {  userId:adminId} = useSelector((state) => state.user); // ✅ get role + userId from redux
  // ✅ Fetch count when admin loads
  // const fetchCount = async () => {
  //   try {
  //     const res = await axios.get(`http://localhost:5000/api/admin/pending-closure-count/${adminId}`, {
  //       withCredentials: true, // if using auth cookies
  //     });
  //     console.log(res.data);
  //     setPendingCount(res.data.count);
  //   } catch (err) {
  //     console.error("Error fetching pending count:", err);
  //   }
  // };
  //   // const{data:leadsAppliedForClosure, error:leadsAppliedForClosureError, isLoading:leadsAppliedForClosureLoading } = 
  //   // useGetAllLeadsAppliedForClosedQuery(adminId);

 
  // useEffect(() => {
  //   console.log(role);
  //   if (role === "admin") {
  //     fetchCount();



  // // setPendingCount(leadsAppliedForClosure?.length);
  //     // Register admin on socket
  //     // const adminId = localStorage.getItem("adminId"); // or from redux
  //     socket.emit("register", { id: adminId, role: "admin" });

  //     // Listen for closure requests
  //     socket.on("closure_request", (data) => {
  //       console.log("📩 New closure request:", data);
  //       setPendingCount((prev) => prev + 1); // increment instantly
  //     });

  //     return () => {
  //       socket.off("closure_request");
  //     };
  //   }
  // }, [role]);
  // console.log(pendingCount);

  // ✅ Menu items for both roles
  const menuItems = {
    user: [
      { name: "All Leads", path: "/home" },
      { name: "Edit Leads", path: "/edit-leads/:leadId" },
    ],
    admin: [
      { name: "Dashboard", path: "/admin-home" },
      {
        name: `Notifications`, // show live count
        path: "/admin-notifications",
      },
    ],
  };

  const currentMenu = menuItems[role] || [];

  return (
    <aside className="w-64 bg-white shadow-lg p-4 min-h-screen">
      <h2 className="text-xl font-bold mb-6">Lead Management</h2>
      <nav className="space-y-2">
        {currentMenu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-2 rounded-lg transition ${
              location.pathname === item.path
                ? "bg-blue-500 text-white"
                : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

