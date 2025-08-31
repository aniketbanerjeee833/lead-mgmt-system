// import React, { useEffect, useState } from "react";
// import {
//   BarChart, Bar, XAxis, YAxis, Tooltip, Legend,  CartesianGrid,
//   PieChart, Pie, Cell, ResponsiveContainer
// } from "recharts";
// import { format, addDays, parseISO } from "date-fns";

import { useSelector } from "react-redux";
import SideMenu from "../layout/SideMenu";

// const baseUrl = "http://localhost:5000/api/admin"; 
// const adminId = 2;

// export default function Admindashboard() {
//   const [year, setYear] = useState(new Date().getFullYear());
//   const [leadsByMonth, setLeadsByMonth] = useState([]);
//   const [sources, setSources] = useState([]);
//   const [priorityByMonth, setPriorityByMonth] = useState([]);
//   const [statusByMonth, setStatusByMonth] = useState([]);

//   const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
//                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//   const COLORS = ["#6c8bdd", "#34d399", "#f87171", "#fbbf24", "#6366f1", "#10b981"];

//   // const fetchData = async (selectedYear) => {
//   //   try {
//   //     const [leadsRes, srcRes, priRes, statRes] = await Promise.all([
//   //       fetch(`${baseUrl}/metrics/leads-by-month?adminId=${adminId}&year=${selectedYear}`),
//   //       fetch(`${baseUrl}/metrics/sources?adminId=${adminId}&year=${selectedYear}`),
//   //       fetch(`${baseUrl}/metrics/priority-by-month?adminId=${adminId}&year=${selectedYear}`),
//   //       fetch(`${baseUrl}/metrics/status-by-month?adminId=${adminId}&year=${selectedYear}`)
//   //     ]);

//   //     const [leadsData, srcData, priData, statData] = await Promise.all([
//   //       leadsRes.json(),
//   //       srcRes.json(),
//   //       priRes.json(),
//   //       statRes.json()
//   //     ]);

//   //     // Normalize: ensure all 12 months appear
//   //     const monthsTemplate = MONTH_NAMES.map((m, i) => ({ month: `${m}-${selectedYear}` }));

//   //     // Leads
//   //     const leadsMap = {};
//   //     leadsData.forEach(d => { leadsMap[d.month] = d.total; });
//   //     setLeadsByMonth(monthsTemplate.map((m, i) => ({
//   //       month: m.month,
//   //       count: leadsMap[i + 1] || 0
//   //     })));

//   //     // Sources
//   //     setSources(srcData.map(d => ({ source: d.source, count: d.total })));

//   //     // Priority
//   //     const priGrouped = {};
//   //     priData.forEach(d => {
//   //       const key = `${MONTH_NAMES[d.month - 1]}-${selectedYear}`;
//   //       if (!priGrouped[key]) priGrouped[key] = { month: key, High: 0, Medium: 0, Low: 0 };
//   //       priGrouped[key][d.priority] = d.total;
//   //     });
//   //     setPriorityByMonth(monthsTemplate.map(m => priGrouped[m.month] || { month: m.month, High: 0, Medium: 0, Low: 0 }));

//   //     // Status
//   //     const statGrouped = {};
//   //     statData.forEach(d => {
//   //       const key = `${MONTH_NAMES[d.month - 1]}-${selectedYear}`;
//   //       if (!statGrouped[key]) statGrouped[key] = { month: key, Active: 0, Inactive: 0, Closed: 0, Pending: 0 };
//   //       statGrouped[key][d.status] = d.total;
//   //     });
//   //     setStatusByMonth(monthsTemplate.map(m => statGrouped[m.month] || { month: m.month, Active: 0, Inactive: 0, Closed: 0, Pending: 0 }));

//   //   } catch (err) {
//   //     console.error("Fetch error:", err);
//   //   }
//   // };

//   // useEffect(() => {
//   //   fetchData(year);
//   // }, [year]);
// const fetchData = async (selectedYear) => {
//   try {
//     const [followUpsRes, leadsRes, srcRes, priRes, statRes] = await Promise.allSettled([
//       fetch(
//         `http://localhost:5000/api/admin/metrics/follow-ups-day-wise-of-each-user?day=${formattedDate}&adminId=${adminId}`),
//       fetch(`${baseUrl}/metrics/leads-by-month?adminId=${adminId}&year=${selectedYear}`),
//       fetch(`${baseUrl}/metrics/sources?adminId=${adminId}&year=${selectedYear}`),
//       fetch(`${baseUrl}/metrics/priority-by-month?adminId=${adminId}&year=${selectedYear}`),
//       fetch(`${baseUrl}/metrics/status-by-month?adminId=${adminId}&year=${selectedYear}`)
//     ]);

//     // Normalize months
//     const monthsTemplate = MONTH_NAMES.map((m, i) => ({ month: `${m}-${selectedYear}` }));

//     if(followUpsRes.status === "fulfilled" && followUpsRes.value.ok) {
      
//       const followUpsData = await followUpsRes.value.json();
//       console.log(followUpsData);
   
//       setFollowUpsData(followUpsData);
//     }
//     // Leads
//     if (leadsRes.status === "fulfilled" && leadsRes.value.ok) {
//       const leadsData = await leadsRes.value.json();
//       console.log(leadsData);
//       const leadsMap = {};
//       leadsData.forEach(d => { leadsMap[d.month] = d.total; });
//       setLeadsByMonth(monthsTemplate.map((m, i) => ({
//         month: m.month,
//         count: leadsMap[i + 1] || 0
//       })));
//     } else {
//       console.error("Leads fetch failed");
//       setLeadsByMonth(monthsTemplate.map(m => ({ month: m.month, count: 0 })));
//     }

//     // Sources
//  if (srcRes.status === "fulfilled" && srcRes.value.ok) {
//   const srcData = await srcRes.value.json();
//   console.log(srcData);

//   const newSources = {}; // ✅ fresh object

//   srcData.forEach(d => {
//     const key = `${MONTH_NAMES[d.month - 1]}-${selectedYear}`;
//     if (!newSources[key]) {
//       newSources[key] = { month: key, News: 0, Social_Media: 0, Referral: 0, Website: 0 };
//     }
//     // increment correct source dynamically
//     if (d.source !== "N/A") {
//       newSources[key][d.source] = (newSources[key][d.source] || 0) + d.total;
//     }
//   });

//   // ✅ merge with monthsTemplate so missing months are still there
//   const merged = monthsTemplate.map(m =>
//     newSources[m.month] ? newSources[m.month] : { month: m.month, News: 0, Social_Media: 0, Referral: 0, Website: 0 }
//   );

//   setSources(merged);
// } else {
//   console.error("Sources fetch failed");
//   setSources([]);
// }


//     // Priority
//     if (priRes.status === "fulfilled" && priRes.value.ok) {
//       const priData = await priRes.value.json();
//       console.log(priData);
//       const priGrouped = {};
//       priData.forEach(d => {
//         const key = `${MONTH_NAMES[d.month - 1]}-${selectedYear}`;
//         if (!priGrouped[key]) priGrouped[key] = { month: key, High: 0, Medium: 0, Low: 0 };
//         priGrouped[key][d.priority] = d.total;
//       });
//       setPriorityByMonth(monthsTemplate.map(m => priGrouped[m.month] || { month: m.month, High: 0, Medium: 0, Low: 0 }));
//     } else {
//       console.error("Priority fetch failed");
//       setPriorityByMonth(monthsTemplate.map(m => ({ month: m.month, High: 0, Medium: 0, Low: 0 })));
//     }

//     // Status
//     if (statRes.status === "fulfilled" && statRes.value.ok) {
//       const statData = await statRes.value.json();
//       console.log(statData);
//       const statGrouped = {};
//       statData.forEach(d => {
//         const key = `${MONTH_NAMES[d.month - 1]}-${selectedYear}`;
//         if (!statGrouped[key]) statGrouped[key] = { month: key, Active: 0, Inactive: 0, Closed: 0, Pending: 0 };
//         statGrouped[key][d.status] = d.total;
//       });
//       setStatusByMonth(monthsTemplate.map(m => statGrouped[m.month] || { month: m.month, Active: 0, Inactive: 0, Closed: 0, Pending: 0 }));
//     } else {
//       console.error("Status fetch failed");
//       setStatusByMonth(monthsTemplate.map(m => ({ month: m.month, Active: 0, Inactive: 0, Closed: 0, Pending: 0 })));
//     }

//   } catch (err) {
//     console.error("Unexpected fetch error:", err);
//   }
// };

// useEffect(() => {
//   fetchData(year);
// }, [year]);

//  const [date, setDate] = useState(new Date());
//   const [followUpsData, setFollowUpsData] = useState([]);

//   const fetchDayWiseData = async () => {
//     try {
//       const formattedDate = format(date, "yyyy-MM-dd");
//       console.log(formattedDate);
//       const res = await fetch(
//         `http://localhost:5000/api/admin/metrics/follow-ups-day-wise-of-each-user?day=${formattedDate}&adminId=${adminId}`
//       );
//       const json = await res.json();
//       console.log(json);
//       setFollowUpsData(json);
//     } catch (error) {
//       console.error("Error fetching chart data:", error);
//     }
//   };

//   useEffect(() => {
//     fetchDayWiseData();
//   }, [date]);

//   const prevDay = () => setDate(addDays(date, -1));
//   const nextDay = () => setDate(addDays(date, 1))

//   const users = ["abc", "sangita"];

// // ✅ Normalize values
// const data = users.map((user) => {
//   const found = followUpsData.find((d) => d.username === user);
//   return {
//     username: user,
//     total: found && found.total ? Math.round(found.total) : 0, // no decimals, default 0
//   };
// });

// return (
//     <div className="min-h-screen bg-gray-100 p-6 max-w-full">
//       <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
//         📊 Lead Metrics Dashboard
//       </h1>

   

//       {/* Year Selector */}
//       <div className="flex justify-center mb-6">
//         <select
//           value={year}
//           onChange={(e) => setYear(parseInt(e.target.value))}
//           className="px-4 py-2 border rounded-lg shadow bg-white"
//         >
//           {[2023, 2024, 2025, 2026].map((y) => (
//             <option key={y} value={y}>
//               {y}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Responsive Grid for Charts */}
//       <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
//            <div className="p-4">
//       {/* Date Navigation */}
//       <div className="flex justify-center items-center mb-4 space-x-4">
//         <button
//           onClick={prevDay}
//           className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
//         >
//           {"<<"}
//         </button>
//         <span className="font-semibold text-lg">
//           {format(date, "MMMM dd, yyyy")}
//         </span>
//         <button
//           onClick={nextDay}
//           className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
//         >
//           {">>"}
//         </button>
//       </div>

//       {/* Chart */}
//        <div className="bg-white shadow-lg rounded-2xl p-4 overflow-x-auto">
//           <h2 className="text-lg font-semibold mb-4 text-gray-700">
//             Leads by Folow Up Date    ({format(date, "MMMM dd, yyyy")})
//           </h2>
//          <ResponsiveContainer width="100%" height={400}>
//       <BarChart data={data}>
        
//         <XAxis dataKey="username" />
//         <YAxis allowDecimals={false} /> {/* ✅ no decimals */}
//         <Tooltip />
//         <Legend />
//         <Bar dataKey="total" fill="#6c8bdd" barSize={50} />
//       </BarChart>
//     </ResponsiveContainer>
//     </div>
//     </div>
//         {/* Leads by Month */}
//         <div className="bg-white shadow-lg rounded-2xl p-4 overflow-x-auto">
//           <h2 className="text-lg font-semibold mb-4 text-gray-700">
//             Leads by Month ({year})
//           </h2>
//           <div className="min-w-[1000px]">
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={leadsByMonth}>
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="count" fill="#6c8bdd" radius={[6, 6, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Sources Pie Chart */}
//         <div className="bg-white shadow-lg rounded-2xl p-4">
//           <h2 className="text-lg font-semibold mb-4 text-gray-700">
//             Lead Sources ({year})
//           </h2>
//           {/* <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={sources}
//                 dataKey="count"
//                 nameKey="source"
//                 cx="50%"
//                 cy="50%"
//                 outerRadius={100}
//                 label
//               >
//                 {sources.map((entry, index) => (
//                   <Cell
//                     key={`cell-${index}`}
//                     fill={COLORS[index % COLORS.length]}
//                   />
//                 ))}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer> */}
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={sources}>
//               <XAxis dataKey="month" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//                  <Bar dataKey="News" fill="#f87171" />
//                 <Bar dataKey="Social_Media" fill="#fbbf24" />
//                 <Bar dataKey="Referral" fill="#34d399" />
//                    <Bar dataKey="Website" fill="#10b981" />
//            {/* {sources.map((entry, index) => (
//              <Bar key={`bar-${index}`} dataKey="count" fill={COLORS[index % COLORS.length]} />
//            ))} */}
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Priority by Month */}
//         <div className="bg-white shadow-lg rounded-2xl p-4 overflow-x-auto">
//           <h2 className="text-lg font-semibold mb-4 text-gray-700">
//             Priority by Month ({year})
//           </h2>
//           <div className="min-w-[1000px]">
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={priorityByMonth}>
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="High" fill="#f87171" />
//                 <Bar dataKey="Medium" fill="#fbbf24" />
//                 <Bar dataKey="Low" fill="#34d399" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Status by Month */}
//         <div className="bg-white shadow-lg rounded-2xl p-4 overflow-x-auto">
//           <h2 className="text-lg font-semibold mb-4 text-gray-700">
//             Status by Month ({year})
//           </h2>
//           <div className="min-w-[1000px]">
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={statusByMonth}>
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="Active" fill="#10b981" />
//                 <Bar dataKey="Inactive" fill="#6c8bdd" />
//                 <Bar dataKey="Closed" fill="#f87171" />
//                 <Bar dataKey="Pending" fill="#fbbf24" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

export default function Admindashboard() {
     const { role, userId } = useSelector((state) => state.user); // ✅ get role + userId from redu
  return (
    <div className="flex min-h-screen">
          <SideMenu role={role} />
             <div className="flex-1 p-6 overflow-x-auto">
        <h1 className="text-2xl font-bold mb-4">📋 Admin Dashboard</h1>
        </div>
    </div>
  )
}