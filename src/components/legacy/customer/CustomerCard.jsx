// TODO: Refactor this later
import React, { useState } from "react";
import { getCustomerData } from "@/utils/helpers/oldUtils";
// import "../../../styles/customerStyles/card.css";

export const CustomerCard = () => {
  const [data] = useState(getCustomerData());

  return (
    <div className="card">
      <div>Customer ID: {data.id}</div>
      <div>Name: {data.name}</div>
      <div>Email: {data.email}</div>
      <a href="/customer-details">View Details</a>
    </div>
  );
};
