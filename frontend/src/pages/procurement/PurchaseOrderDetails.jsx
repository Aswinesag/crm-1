import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getPurchaseOrderById } from "../../services/purchaseOrderService";

const PurchaseOrderDetails = () => {
  const { id } = useParams(), [po, setPo] = useState(null);
  const load = useCallback(async () => { try { setPo(await getPurchaseOrderById(id)); } catch (error) { toast.error(error.response?.data?.message || "Could not load Purchase Order"); } }, [id]);
  useEffect(() => { load(); }, [load]);
  if (!po) return <div className="p-6">Loading…</div>;
  const total = po.items.reduce((sum, line) => sum + Number(line.quantity) * Number(line.unitPrice || 0), 0);
  return <div className="p-6 space-y-6"><div className="flex flex-wrap justify-between gap-3"><div><h1 className="text-3xl font-bold">{po.poNumber}</h1><p>{po.vendorId?.vendorName} · {po.warehouseId?.warehouseName || "Warehouse selected at receipt"}</p></div><div className="flex gap-2 items-center"><span className="badge badge-lg">{po.status}</span>{!["RECEIVED", "CANCELLED"].includes(po.status) && <Link className="btn btn-primary btn-sm" to={`/procurement/grns/create?purchaseOrder=${po._id}`}>Create GRN</Link>}</div></div><div className="overflow-x-auto bg-base-100 rounded-xl shadow"><table className="table table-zebra"><thead><tr><th>Item</th><th>Type</th><th>Ordered</th><th>Received</th><th>Pending</th><th>Unit price</th></tr></thead><tbody>{po.items.map((line) => <tr key={line._id}><td>{line.item?.productName || line.item?.materialName || line.item?.componentName}</td><td>{line.itemType}</td><td>{line.quantity}</td><td>{line.receivedQuantity}</td><td>{line.pendingQuantity}</td><td>₹{Number(line.unitPrice || 0).toLocaleString()}</td></tr>)}</tbody></table></div><div className="stat bg-base-100 rounded-xl shadow"><div className="stat-title">Total ordered value</div><div className="stat-value text-2xl">₹{total.toLocaleString()}</div></div></div>;
};
export default PurchaseOrderDetails;
