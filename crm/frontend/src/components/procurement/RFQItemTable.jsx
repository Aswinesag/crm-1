import React from "react";

const RFQItemTable = ({
  items,
  setItems,
}) => {

  const addRow = () => {

    setItems([
      ...items,
      {
        material: "",
        quantity: "",
        unit: "",
      },
    ]);
  };

  const updateItem =
    (
      index,
      field,
      value
    ) => {

      const updated =
        [...items];

      updated[index][field] =
        value;

      setItems(updated);
    };

  const removeRow =
    (index) => {

      const updated =
        items.filter(
          (_, i) =>
            i !== index
        );

      setItems(updated);
    };

  return (
    <div className="bg-white rounded-lg shadow p-4">

      <div className="flex justify-between mb-4">

        <h3 className="font-semibold text-lg">
          RFQ Items
        </h3>

        <button
          onClick={addRow}
          className="
          bg-blue-600
          text-white
          px-4
          py-2
          rounded
          "
        >
          Add Item
        </button>

      </div>

      <table className="w-full">

        <thead>
          <tr className="border-b">
            <th>Material</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {items.map(
            (
              item,
              index
            ) => (
              <tr key={index}>

                <td>
                  <input
                    type="text"
                    value={
                      item.material
                    }
                    onChange={(e) =>
                      updateItem(
                        index,
                        "material",
                        e.target.value
                      )
                    }
                    className="
                    border
                    p-2
                    w-full
                    "
                  />
                </td>

                <td>
                  <input
                    type="number"
                    value={
                      item.quantity
                    }
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        e.target.value
                      )
                    }
                    className="
                    border
                    p-2
                    w-full
                    "
                  />
                </td>

                <td>
                  <input
                    type="text"
                    value={
                      item.unit
                    }
                    onChange={(e) =>
                      updateItem(
                        index,
                        "unit",
                        e.target.value
                      )
                    }
                    className="
                    border
                    p-2
                    w-full
                    "
                  />
                </td>

                <td>

                  <button
                    onClick={() =>
                      removeRow(
                        index
                      )
                    }
                    className="
                    bg-red-500
                    text-white
                    px-3
                    py-1
                    rounded
                    "
                  >
                    Delete
                  </button>

                </td>

              </tr>
            )
          )}

        </tbody>

      </table>

    </div>
  );
};

export default RFQItemTable;