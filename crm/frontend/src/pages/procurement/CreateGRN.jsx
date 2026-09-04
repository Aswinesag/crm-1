import React,
{
  useEffect,
  useState,
} from "react";

import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import GRNItemsTable from "../../components/procurement/GRNItemsTable";
import { createGRN } from "../../services/grnService";

const CreateGRN = () => {

  const navigate =
    useNavigate();

  const [purchaseOrders,
    setPurchaseOrders] =
    useState([]);

  const [selectedPO,
    setSelectedPO] =
    useState("");

  const [items,
    setItems] =
    useState([]);

  const [remarks,
    setRemarks] =
    useState("");

  const [deliveryDate,
    setDeliveryDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders =
    async () => {
      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const res =
          await axios.get(
            "http://localhost:5002/api/purchase-orders",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const availablePOs =
          res.data.data.filter(
            (po) =>
              po.status !==
              "RECEIVED"
          );

        setPurchaseOrders(
          availablePOs
        );

      } catch (error) {

        console.log(error);

        toast.error(
          "Failed to load Purchase Orders"
        );
      }
    };

  const handlePOChange =
    (poId) => {

      setSelectedPO(poId);

      const po =
        purchaseOrders.find(
          (p) =>
            p._id === poId
        );

      if (!po) return;

      const mappedItems =
        po.items.map(
          (item) => ({
            materialId:
              item.materialId
                ?._id,

            materialName:
              item.materialId
                ?.materialName,

            orderedQuantity:
              item.quantity,

            quantityReceived:
              item.pendingQuantity ||
              item.quantity,

            acceptedQuantity:
              item.pendingQuantity ||
              item.quantity,

            rejectedQuantity:
              0,

            remarks: "",
          })
        );

      setItems(
        mappedItems
      );
    };

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        if (
          !selectedPO
        ) {
          toast.error(
            "Select Purchase Order"
          );
          return;
        }

        const payload = {
          purchaseOrder:
            selectedPO,

          remarks,

          deliveryDate,

          items:
            items.map(
              (item) => ({
                materialId:
                  item.materialId,

                quantityReceived:
                  Number(
                    item.quantityReceived
                  ),

                acceptedQuantity:
                  Number(
                    item.acceptedQuantity
                  ),

                rejectedQuantity:
                  Number(
                    item.rejectedQuantity
                  ),

                remarks:
                  item.remarks || "",
              })
            ),
        };

        const res =
          await createGRN(
            payload
          );

        if (
          res.success
        ) {

          toast.success(
            "GRN Created Successfully"
          );

          navigate(
            "/procurement/grns"
          );
        }

      } catch (error) {

        console.log(error);

        toast.error(
          error?.response?.data
            ?.message ||
          "Failed to create GRN"
        );
      }
    };

  const selectedPOData =
    purchaseOrders.find(
      (p) =>
        p._id ===
        selectedPO
    );

  return (
    <div className="p-6">

      <div className="bg-base-100 p-6 rounded-xl shadow">

        <h1 className="text-2xl font-bold mb-6">
          Create GRN
        </h1>

        <form
          onSubmit={
            handleSubmit
          }
        >

          <div className="grid md:grid-cols-2 gap-4 mb-6">

            <div>

              <label className="label">
                Purchase Order
              </label>

              <select
                className="select select-bordered w-full"
                value={
                  selectedPO
                }
                onChange={(
                  e
                ) =>
                  handlePOChange(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select PO
                </option>

                {purchaseOrders.map(
                  (
                    po
                  ) => (
                    <option
                      key={
                        po._id
                      }
                      value={
                        po._id
                      }
                    >
                      {
                        po.poNumber
                      }
                      {" - "}
                      {
                        po
                          .vendorId
                          ?.vendorName
                      }
                    </option>
                  )
                )}
              </select>

            </div>

            <div>

              <label className="label">
                Delivery Date
              </label>

              <input
                type="date"
                className="input input-bordered w-full"
                value={
                  deliveryDate
                }
                onChange={(
                  e
                ) =>
                  setDeliveryDate(
                    e.target
                      .value
                  )
                }
              />

            </div>

          </div>

          {selectedPOData && (

            <div className="bg-base-200 p-4 rounded-lg mb-6">

              <h2 className="font-bold mb-2">
                Vendor Information
              </h2>

              <p>
                <strong>
                  Vendor:
                </strong>{" "}
                {
                  selectedPOData
                    .vendorId
                    ?.vendorName
                }
              </p>

              <p>
                <strong>
                  PO Number:
                </strong>{" "}
                {
                  selectedPOData
                    .poNumber
                }
              </p>

              <p>
                <strong>
                  Status:
                </strong>{" "}
                {
                  selectedPOData
                    .status
                }
              </p>

            </div>

          )}

          {items.length >
            0 && (

            <div className="mb-6">

              <h2 className="text-xl font-semibold mb-4">
                GRN Items
              </h2>

              <GRNItemsTable
                items={
                  items
                }
                setItems={
                  setItems
                }
              />

            </div>

          )}

          <div className="mb-6">

            <label className="label">
              Remarks
            </label>

            <textarea
              className="textarea textarea-bordered w-full"
              rows="4"
              value={
                remarks
              }
              onChange={(
                e
              ) =>
                setRemarks(
                  e.target
                    .value
                )
              }
            />

          </div>

          <button
            type="submit"
            className="btn btn-primary"
          >
            Create GRN
          </button>

        </form>

      </div>

    </div>
  );
};

export default CreateGRN;