// import React from "react";
// import MDBox from "components/MDBox";
// import { useMaterialUIController } from "context";
// import { useNavigate } from "react-router-dom";

// const deliveryStatuses = [
//   "Pending",
//   "Confirmed",
//   "Packed",
//   "Dispatched",
//   "In Transit",
//   "Out for Delivery",
//   "Delivered",
//   "Cancelled",
//   "Returned",
//   "Delivery Failed",
// ];

// function DeliveryStatusDropdown({ value, onChange }) {
//     const [controller] = useMaterialUIController();
//         const { miniSidenav } = controller;
//   return (
//     <MDBox
//                 p={2}
//                 style={{
//                     marginLeft: miniSidenav ? "80px" : "250px",
//                     transition: "margin-left 0.3s ease",
//                 }}
//             >
//     <div>
//       <label htmlFor="deliveryStatus">Delivery Status:</label>
//       <select
//         id="deliveryStatus"
//         value={value}
//         onChange={onChange}
//         style={{ padding: "8px", width: "100%", marginTop: "10px" }}
//       >
//         <option value="">-- Select Status --</option>
//         {deliveryStatuses.map((status) => (
//           <option key={status} value={status}>
//             {status}
//           </option>
//         ))}
//       </select>
//     </div>
//     </MDBox>
//   );
// }

// export default DeliveryStatusDropdown;
