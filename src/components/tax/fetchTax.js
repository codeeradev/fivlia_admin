// components/products/TaxHeader.js
import React, { useEffect, useState } from "react";
import { get } from 'api/apiClient';
import { ENDPOINTS } from 'api/endPoints';

export default function TaxHeader({ onReady }) {
  const [taxData, setTaxData] = useState([]);

  useEffect(() => {
    const fetchTax = async () => {
      try {
        const res = await get(ENDPOINTS.GET_TAX);
        const data = res.data;
        if (data?.result) {
          const arr = data.result.map((t) => t.value); // ["0%", "5%", "18%"]
          setTaxData(arr);

          const headerFormatted = `Tax (${arr.join(", ")})`;

          onReady({
            values: arr,
            header: headerFormatted, // <<< EXACT FORMAT YOU WANT
            defaultValue: arr[1] || arr[0] || "",
          });
        }
      } catch (err) {
        console.error("Tax API Error:", err);
      }
    };

    fetchTax();
  }, []);

  return null;
}
