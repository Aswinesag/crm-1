const PRStatsCards = ({
  prs,
}) => {
  const total =
    prs.length;

  const pending =
    prs.filter(
      (p) =>
        p.status === "PENDING"
    ).length;

  const approved =
    prs.filter(
      (p) =>
        p.status === "APPROVED"
    ).length;

  const rejected =
    prs.filter(
      (p) =>
        p.status === "REJECTED"
    ).length;

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">

      <div className="bg-white p-4 rounded shadow">
        <h3>Total PRs</h3>
        <p>{total}</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3>Pending</h3>
        <p>{pending}</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3>Approved</h3>
        <p>{approved}</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3>Rejected</h3>
        <p>{rejected}</p>
      </div>

    </div>
  );
};

export default PRStatsCards;