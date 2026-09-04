import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const TicketCount = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const { data } = await axiosInstance.get("/tickets/count");
      setCount(data.count);
    };

    fetchCount();
  }, []);

  return (
    <div >
      <p className="text-2xl">{count}</p>
    </div>
  );
};

export default TicketCount;