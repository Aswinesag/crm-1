import PRStatusBadge from "./PRStatusBadge";

const PRTable = ({
  prs,
  onView,
}) => {

  console.log(
    "PRTable received:",
    prs.length
  );
  return (
    <table className="w-full bg-white">

      <thead>
        <tr>
          <th>PR Number</th>
          <th>Material</th>
          <th>Qty</th>
          <th>Department</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
      {console.log(
    "Rendering rows:",
    prs.length
  )}
        {prs.map((pr) => (
          <tr key={pr._id}>
            <td>{pr.prNumber}</td>

            <td>
              {
                pr.materialId
                  ?.materialName
              }
            </td>

            <td>
              {pr.quantity}
            </td>

            <td>
              {pr.department}
            </td>

            <td>
              <PRStatusBadge
                status={
                  pr.status
                }
              />
            </td>

            <td>
              <button
                onClick={() =>
                  onView(pr)
                }
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>

    </table>
  );
};

export default PRTable;