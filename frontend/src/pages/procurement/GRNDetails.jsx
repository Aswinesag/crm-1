import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { getGRNById, postGRN, reverseGRN } from "../../services/grnService";

const GRNDetails = () => {
  const { id } = useParams(); const [grn, setGrn] = useState(null), [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => { try { setGrn((await getGRNById(id)).data); } catch (error) { toast.error(error.response?.data?.message || "Could not load GRN"); } }, [id]);
  useEffect(() => { refresh(); }, [refresh]);
  const post = async () => { if (!window.confirm("Post this GRN? This will add accepted quantities to inventory.")) return; setBusy(true); try { await postGRN(id); toast.success("GRN posted and inventory updated"); await refresh(); } catch (error) { toast.error(error.response?.data?.message || "Posting failed"); } finally { setBusy(false); } };
  const reverse = async () => { const reason = window.prompt("Reason for reversal"); if (!reason) return; setBusy(true); try { await reverseGRN(id, reason); toast.success("GRN reversed"); await refresh(); } catch (error) { toast.error(error.response?.data?.message || "Reversal failed"); } finally { setBusy(false); } };
  if (!grn) return <div className="p-6">Loading…</div>;
  return <div className="p-6 space-y-6"><div className="flex flex-wrap justify-between gap-3"><div><h1 className="text-3xl font-bold">{grn.grnNumber}</h1><p>{grn.purchaseOrder?.poNumber} · {grn.vendor?.vendorName} · {grn.warehouse?.warehouseName}</p></div><div className="flex gap-2"><span className="badge badge-lg">{grn.status}</span>{grn.status === "Draft" && <button className="btn btn-primary btn-sm" disabled={busy} onClick={post}>Post GRN</button>}{grn.status === "Posted" && <button className="btn btn-error btn-outline btn-sm" disabled={busy} onClick={reverse}>Reverse</button>}</div></div><div className="overflow-x-auto bg-base-100 rounded-xl shadow"><table className="table table-zebra"><thead><tr><th>Item</th><th>Type</th><th>Ordered</th><th>Previously received</th><th>This receipt</th><th>Accepted</th><th>Rejected</th></tr></thead><tbody>{grn.items.map((line) => <tr key={line._id}><td><div className="font-medium">{line.itemNameSnapshot}</div><div className="text-xs opacity-60">{line.itemCodeSnapshot}</div></td><td>{line.itemType}</td><td>{line.orderedQuantitySnapshot}</td><td>{line.previouslyReceivedSnapshot}</td><td>{line.quantityReceived}</td><td>{line.acceptedQuantity}</td><td>{line.rejectedQuantity}</td></tr>)}</tbody></table></div><p className="text-sm opacity-70">Posted GRNs are immutable. Reversal creates compensating inventory ledger entries and retains the original history.</p></div>;
};
export default GRNDetails;
