// The four order stages shown in the admin / store order tables.
// Internal orderStatus values are untouched (driver app + settlement use them).
export const STAGES = ["Pending", "In Processing", "Shipped", "Delivered"];

const clean = (s) => String(s || "").trim().toLowerCase();

const PROCESSING = [
  "accepted",
  "in processing",
  "inprocessing",
  "processing",
  "ready",
  "ready to pickup",
  "going to pickup",
  "picked up",
];
const SHIPPED = ["shipped", "on the way", "on way", "out for delivery"];

export const getStage = (orderStatus) => {
  const s = clean(orderStatus);
  if (!s || s === "pending") return "Pending";
  if (s === "delivered") return "Delivered";
  if (SHIPPED.includes(s)) return "Shipped";
  if (PROCESSING.includes(s)) return "In Processing";
  if (["cancelled", "canceled", "rejected"].includes(s)) return "Cancelled";
  return String(orderStatus);
};

// Internal status saved when a stage is picked.
export const stageToStatus = (stage, isGlobal) => {
  const s = clean(stage);
  if (s === "pending") return "Pending";
  if (s === "in processing") return "Accepted";
  if (s === "delivered") return "Delivered";
  if (s === "shipped") return isGlobal ? "Shipped" : "On The Way";
  return null;
};

// Stage dropdown options for one order. Earlier stages are disabled so an
// order only moves forward; a cancelled order keeps just "Cancelled".
export const getStageOptions = (orderStatus) => {
  const current = getStage(orderStatus);
  if (current === "Cancelled") return [{ value: "Cancelled", disabled: true }];
  const idx = STAGES.indexOf(current);
  const base = STAGES.map((value, i) => ({ value, disabled: idx > -1 && i < idx }));
  return idx === -1 ? [{ value: current, disabled: true }, ...base] : base;
};
