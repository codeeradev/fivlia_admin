import React, { useState } from "react";
import { Button } from "@mui/material";

export default function PermissionViewer({ permissions }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button
        size="small"
        style={{
          background: "#007bff",
          color: "white",
          borderRadius: "6px",
          padding: "3px 10px",
          fontSize: "12px",
        }}
        onClick={() => setOpen(!open)}
      >
        {open ? "Hide" : "View"} ({permissions?.length})
      </Button>

      {open && (
        <div
          style={{
            marginTop: 8,
            padding: 10,
            borderRadius: 8,
            background: "#f5f5f5",
            maxWidth: 300,
          }}
        >
          {permissions?.map((p) => (
            <div key={p} style={{ fontSize: 12, marginBottom: 4 }}>
              • {p.replace(/_/g, " ")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
