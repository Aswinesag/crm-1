const GRNItemsTable = ({ items, setItems }) => {
  const change = (index, value) => setItems(items.map((item, position) => position === index ? { ...item, quantityReceived: value } : item));
  return (
    <div className="overflow-x-auto border border-base-300 rounded-xl">
      <table className="table table-zebra">
        <thead><tr><th>Item</th><th>Type</th><th>Ordered</th><th>Previously received</th><th>Pending</th><th>Receiving now</th></tr></thead>
        <tbody>{items.map((item, index) => <tr key={item.poLineId}>
          <td><div className="font-medium">{item.itemName}</div><div className="text-xs opacity-60">{item.itemCode}</div></td>
          <td>{item.itemType}</td><td>{item.orderedQuantity}</td><td>{item.previouslyReceived}</td><td>{item.pendingQuantity}</td>
          <td><input aria-label={`Quantity for ${item.itemName}`} type="number" min="0" max={item.pendingQuantity} step="any" className="input input-bordered input-sm w-28" value={item.quantityReceived} onChange={(event) => change(index, event.target.value)} /></td>
        </tr>)}</tbody>
      </table>
    </div>
  );
};
export default GRNItemsTable;
