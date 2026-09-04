import React,
{
  useEffect,
  useState,
} from "react";

import PurchaseOrderTable
from "../../components/procurement/PurchaseOrderTable";

import {
  getAllPurchaseOrders,
}
from "../../services/purchaseOrderService";

const PurchaseOrderList = () => {

  const [
    purchaseOrders,
    setPurchaseOrders,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  useEffect(() => {

    fetchPurchaseOrders();

  }, []);

  const fetchPurchaseOrders =
    async () => {

      try {

        const data =
          await getAllPurchaseOrders();

        setPurchaseOrders(
          data
        );

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

  if (loading) {

    return (
      <div
        className="
        flex
        justify-center
        items-center
        h-64"
      >
        Loading...
      </div>
    );
  }

  return (

    <div className="p-6">

      <div
        className="
        flex
        justify-between
        items-center
        mb-6"
      >

        <h1
          className="
          text-2xl
          font-bold"
        >
          Purchase Orders
        </h1>

      </div>

      <PurchaseOrderTable
        purchaseOrders={
          purchaseOrders
        }
      />

    </div>
  );
};

export default PurchaseOrderList;