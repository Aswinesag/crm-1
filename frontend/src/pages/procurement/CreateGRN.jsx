import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import GRNItemsTable from "../../components/procurement/GRNItemsTable";
import { createGRN } from "../../services/grnService";
import { getAllPurchaseOrders } from "../../services/purchaseOrderService";
import { listSettings } from "../../services/productSettingsService";

const label = (item = {}) => ({ name: item.productName || item.materialName || item.componentName || "Unknown item", code: item.productCode || item.materialCode || item.componentCode || "" });
const CreateGRN = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]), [warehouses, setWarehouses] = useState([]), [poId, setPoId] = useState(""), [warehouse, setWarehouse] = useState(""), [items, setItems] = useState([]), [notes, setNotes] = useState(""), [saving, setSaving] = useState(false);
  useEffect(() => { Promise.all([getAllPurchaseOrders(), listSettings("warehouses", { limit: 200 })]).then(([pos, wh]) => { setOrders(pos.filter((po) => !["RECEIVED", "CANCELLED"].includes(po.status))); setWarehouses(wh.data || []); }).catch(() => toast.error("Could not load receiving data")); }, []);
  const selectPO = (id) => {
    setPoId(id); const po = orders.find((entry) => entry._id === id); if (!po) return setItems([]);
    setWarehouse(po.warehouseId?._id || "");
    setItems(po.items.filter((line) => Number(line.pendingQuantity) > 0).map((line) => { const details = label(line.item); return { poLineId: line._id, itemType: line.itemType, itemName: details.name, itemCode: details.code, orderedQuantity: line.quantity, previouslyReceived: line.receivedQuantity || 0, pendingQuantity: line.pendingQuantity, quantityReceived: line.pendingQuantity }; }));
  };
  const submit = async (event) => { event.preventDefault(); const received = items.filter((line) => Number(line.quantityReceived) > 0); if (!poId || !warehouse || !received.length) return toast.error("Select a PO, warehouse, and at least one positive receipt quantity"); setSaving(true); try { const response = await createGRN({ purchaseOrder: poId, warehouse, notes, items: received.map((line) => ({ poLineId: line.poLineId, quantityReceived: Number(line.quantityReceived), acceptedQuantity: Number(line.quantityReceived), rejectedQuantity: 0 })) }); toast.success("Draft GRN saved. Review it before posting."); navigate(`/procurement/grns/${response.data._id}`); } catch (error) { toast.error(error.response?.data?.message || "Could not create GRN"); } finally { setSaving(false); } };
  const selected = orders.find((po) => po._id === poId);
  return <div className="p-6"><form onSubmit={submit} className="bg-base-100 p-6 rounded-xl shadow space-y-6"><div><h1 className="text-2xl font-bold">Create Goods Receipt Note</h1><p className="text-sm opacity-70">Saving creates a draft. Inventory changes only after explicit posting.</p></div><div className="grid md:grid-cols-2 gap-4"><label className="form-control"><span className="label-text mb-2">Purchase Order</span><select className="select select-bordered" value={poId} onChange={(event) => selectPO(event.target.value)} required><option value="">Select PO</option>{orders.map((po) => <option key={po._id} value={po._id}>{po.poNumber} — {po.vendorId?.vendorName}</option>)}</select></label><label className="form-control"><span className="label-text mb-2">Receiving warehouse</span><select className="select select-bordered" value={warehouse} onChange={(event) => setWarehouse(event.target.value)} disabled={Boolean(selected?.warehouseId)} required><option value="">Select warehouse</option>{warehouses.map((entry) => <option key={entry._id} value={entry._id}>{entry.warehouseCode} — {entry.warehouseName}</option>)}</select></label></div>{selected && <div className="alert"><span><strong>{selected.poNumber}</strong> · {selected.vendorId?.vendorName} · {selected.status}</span></div>}{items.length > 0 && <GRNItemsTable items={items} setItems={setItems} />}<label className="form-control"><span className="label-text mb-2">Notes</span><textarea className="textarea textarea-bordered" value={notes} onChange={(event) => setNotes(event.target.value)} /></label><button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Draft"}</button></form></div>;
};
export default CreateGRN;
