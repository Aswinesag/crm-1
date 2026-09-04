import React, {
  useState,
  useEffect,
} from "react";

import RFQItemTable from "../../components/procurement/RFQItemTable";

import {
  createRFQ,
} from "../../services/rfqService";

import {
  getAllMaterials,
} from "../../services/materialService";

import {
  getAllVendors,
} from "../../services/vendorService";

const CreateRFQ = () => {

  const [materials, setMaterials] = useState([]);

  const [vendors, setVendors] = useState([]);

  const [items, setItems] = useState([]);

  const [formData, setFormData] = useState({
  materialId: "",
  vendorId: "",
  quantity: "",
  requiredDate: "",
  description: "",
  status: "Draft",
});

  useEffect(() => {

 const fetchMaterials = async () => {

  try {

    const data =
      await getAllMaterials();

    console.log(
      "Materials Response:",
      data
    );

    setMaterials(
      data.materials || []
    );

  } catch (err) {

    console.error(
      "Error fetching materials:",
      err
    );

    setMaterials([]);

  }

};

const fetchVendors = async () => {

  try {

    const data =
      await getAllVendors();

    setVendors(
      data.data || []
    );

  } catch (err) {

    console.error(
      "Error fetching vendors:",
      err
    );

  }

};

    fetchMaterials();
    fetchVendors();

  }, []);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      console.log(
        "Selected Material ID:",
        formData.materialId
      );

      console.log(
        "Materials State:",
        materials
      );

      const selectedMaterial =
        materials.find(
          (material) =>
            String(material._id) ===
            String(formData.materialId)
        );

      if (!selectedMaterial) {

        alert(
          "Please select a material"
        );

        return;

      }

      const payload = {

        rfqNumber:
          `RFQ-${Date.now()}`,

        materialId:
          selectedMaterial._id,

        quantity:
          Number(formData.quantity),

        unit:
          selectedMaterial.unit || "Kg",

        requiredDate:
          formData.requiredDate,

        vendorIds: [
          formData.vendorId
        ],

        remarks:
          formData.description,

        status: formData.status,

        createdBy:
          "Super Admin",

      };

      console.log(
        "RFQ Payload:",
        payload
      );

      await createRFQ(payload);

      alert(
        "RFQ Created Successfully"
      );

     setFormData({
      materialId: "",
      vendorId: "",
      quantity: "",
      requiredDate: "",
      description: "",
      status: "",
    });

      setItems([]);

    } catch (error) {

      console.error(
        "Create RFQ Error:",
        error
      );

      alert(
        "Error Creating RFQ"
      );

    }

  };

  console.log(
  "Materials State:",
  materials
);

  return (

    <div className="p-6">

      <h1
        className="
          text-2xl
          font-bold
          mb-6
        "
      >
        Create RFQ
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        <div
          className="
            bg-white
            p-6
            rounded-lg
            shadow
          "
        >

          <div
            className="
              grid
              md:grid-cols-2
              gap-4
            "
          >

            <select
              name="materialId"
              value={formData.materialId}
              onChange={handleChange}
              className="
                border
                p-3
                rounded
              "
              required
            >

              <option value="">
                Select Material
              </option>

              {Array.isArray(materials) &&
                materials.map(
                  (material) => (

                    <option
                      key={material._id}
                      value={material._id}
                    >
                      {material.materialName}
                    </option>

                  )
              )}

            </select>

            <select
  name="vendorId"
  value={formData.vendorId}
  onChange={handleChange}
  className="
    border
    p-3
    rounded
  "
  required
>

  <option value="">
    Select Supplier
  </option>

  {vendors.map(
    (vendor) => (

      <option
        key={vendor._id}
        value={vendor._id}
      >
        {vendor.vendorName}
      </option>

    )
  )}

</select>

            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="
                border
                p-3
                rounded
              "
              required
            />

            <input
              type="date"
              name="requiredDate"
              value={formData.requiredDate}
              onChange={handleChange}
              className="
                border
                p-3
                rounded
              "
              required
            />

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="
                border
                p-3
                rounded
              "
            >

              <option value="Draft">
                Draft
              </option>

              <option value="Open">
                Open
              </option>

            </select>

          </div>

          <textarea
            name="description"
            rows="4"
            placeholder="Remarks"
            value={formData.description}
            onChange={handleChange}
            className="
              border
              p-3
              rounded
              w-full
              mt-4
            "
          />

        </div>

        <RFQItemTable
          items={items}
          setItems={setItems}
        />

        <button
          type="submit"
          className="
            bg-green-600
            text-white
            px-6
            py-3
            rounded-lg
          "
        >
          Create RFQ
        </button>

      </form>

    </div>

  );

};

export default CreateRFQ;