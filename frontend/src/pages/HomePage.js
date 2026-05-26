import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <h1 className="company-name">SHRI G ENTERPRISES</h1>
      <p className="company-info">
        Welding & Safety Equipment’s<br />
        S. No.371, Flat No.20, Unity Park, Somwar Peth, Narpatsingh Chowk,<br />
        Above HDFC Bank, Pune 411011<br />
        Email : shrigenterprises25@gmail.com<br />
        <b>GST No : 27AJIPG2516N1Z2</b>
      </p>
      <button onClick={() => navigate("/invoice")}>Create New Invoice</button>
      <button onClick={() => navigate("/view-bills")}>View Previous Bills</button>
    </div>
  );
};

export default HomePage;
