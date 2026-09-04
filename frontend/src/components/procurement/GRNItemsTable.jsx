import React from "react";

const GRNItemsTable = ({
  items,
  setItems,
}) => {
  const handleChange = (
    index,
    field,
    value
  ) => {
    const updated = [...items];

    updated[index][field] =
      Number(value);

    if (
      field ===
      "quantityReceived"
    ) {
      updated[index]
        .acceptedQuantity =
        Number(value);
    }

    setItems(updated);
  };

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Material</th>
            <th>Ordered</th>
            <th>Received</th>
            <th>Accepted</th>
            <th>Rejected</th>
          </tr>
        </thead>

        <tbody>
          {items.map(
            (item, index) => (
              <tr key={index}>
                <td>
                  {
                    item.materialName
                  }
                </td>

                <td>
                  {
                    item.orderedQuantity
                  }
                </td>

                <td>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-24"
                    value={
                      item.quantityReceived
                    }
                    onChange={(e) =>
                      handleChange(
                        index,
                        "quantityReceived",
                        e.target.value
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-24"
                    value={
                      item.acceptedQuantity
                    }
                    onChange={(e) =>
                      handleChange(
                        index,
                        "acceptedQuantity",
                        e.target.value
                      )
                    }
                  />
                </td>

                <td>
                  <input
                    type="number"
                    className="input input-bordered input-sm w-24"
                    value={
                      item.rejectedQuantity
                    }
                    onChange={(e) =>
                      handleChange(
                        index,
                        "rejectedQuantity",
                        e.target.value
                      )
                    }
                  />
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
};

export default GRNItemsTable;