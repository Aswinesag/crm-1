import {
  useState,
} from "react";

const CreatePurchaseRequisitionModal =
({
  open,
  onClose,
  onSubmit,
  materials,
}) => {

  console.log("Materials:", materials);

  const [formData,
    setFormData] =
    useState({
      materialId: "",
      quantity: "",
      department: "",
      requiredDate: "",
      priority: "MEDIUM",
      requestedBy: "Admin",
      justification: "",
      remarks: "",
    });

  if (!open) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">

      <div className="bg-white p-6 rounded w-[600px]">

        <h2 className="text-xl mb-4">
          Create Purchase Requisition
        </h2>

        <select
          name="materialId"
          onChange={
            handleChange
          }
          className="border p-2 w-full mb-3"
        >
          <option>
            Select Material
          </option>

          {materials.map(
            (m) => (
              <option
                key={m._id}
                value={
                  m._id
                }
              >
                {
                  m.materialName
                }
              </option>
            )
          )}
        </select>

        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          onChange={
            handleChange
          }
          className="border p-2 w-full mb-3"
        />

        <input
          type="text"
          name="department"
          placeholder="Department"
          onChange={
            handleChange
          }
          className="border p-2 w-full mb-3"
        />

        <input
          type="date"
          name="requiredDate"
          onChange={
            handleChange
          }
          className="border p-2 w-full mb-3"
        />

        <textarea
          name="justification"
          placeholder="Justification"
          onChange={
            handleChange
          }
          className="border p-2 w-full mb-3"
        />

        <div className="flex gap-3">

         <button
            onClick={() => {
              console.log("Submitting:", formData);
              onSubmit(formData);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save
          </button>

          <button
            onClick={
              onClose
            }
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
};

export default
CreatePurchaseRequisitionModal;