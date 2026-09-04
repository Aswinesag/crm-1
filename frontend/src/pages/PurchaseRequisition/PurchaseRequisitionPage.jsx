import {
  useEffect,
  useState,
} from "react";

import {
  getAllPRs,
  createPR,
} from "../../services/purchaseRequisitionService";

import PRStatsCards from "../../components/PurchaseRequisition/PRStatsCards";
import PRTable from "../../components/PurchaseRequisition/PRTable";
import CreatePurchaseRequisitionModal from "./CreatePurchaseRequisitionModal";
import { getAllMaterials } from "../../services/materialService";

const PurchaseRequisitionPage = () => {

  const [prs, setPrs] =
    useState([]);

  const [materials, setMaterials] = useState([]);

  const [open,
    setOpen] =
    useState(false);

 const loadData = async () => {
  try {
    const res = await getAllPRs();

    console.log("FULL RESPONSE:", res);
    console.log("RESPONSE DATA:", res.data);
    console.log("PRS:", res.data.data);

    setPrs(res.data.data || []);
  } catch (err) {
    console.error("PR ERROR:", err);
  }
};

const loadMaterials = async () => {
  try {
    const res = await getAllMaterials();

    console.log("FULL MATERIAL RESPONSE:", res.data);
    console.log("MATERIAL ARRAY:", res.data.materials);
    console.log(
      "IS ARRAY:",
      Array.isArray(res.data.materials)
    );

    setMaterials(res.data.materials);
  } catch (err) {
    console.error("MATERIAL ERROR:", err);
    setMaterials([]);
  }
};

  useEffect(() => {
    loadData();
    loadMaterials();
  }, []);

  console.log(
    "PRS LENGTH:",
    prs.length
  );

  const handleCreate =
    async (data) => {
      await createPR(
        data
      );

      loadData();

      setOpen(false);
    };

  console.log("materials state =", materials);
  console.log(
  "materials is array =",
  Array.isArray(materials)
);

  return (
    <div className="p-6">

      <div className="flex justify-between mb-6">

        <h1 className="text-2xl font-bold">
          Purchase Requisition Management
        </h1>

        <button
          onClick={() =>
            setOpen(true)
          }
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          New PR
        </button>

      </div>

      <PRStatsCards
        prs={prs}
      />

      <PRTable
        prs={prs}
        onView={(pr) =>
          console.log(pr)
        }
      />

      <CreatePurchaseRequisitionModal
        open={open}
        onClose={() =>
          setOpen(false)
        }
        onSubmit={
          handleCreate
        }
        materials={materials}
      />

    </div>
  );
};

export default
PurchaseRequisitionPage;