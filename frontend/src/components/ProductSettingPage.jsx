import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { createSetting, deleteSetting, listSettings, updateSetting } from "../services/productSettingsService.js";

const emptyForm = (fields) => Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? ""]));
const getValue = (record, path) => path.split(".").reduce((value, key) => value?.[key], record);

const ProductSettingPage = ({ title, singular, resource, fields, columns, hasStatus = false }) => {
  const [records, setRecords] = useState([]);
  const [options, setOptions] = useState({});
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => emptyForm(fields));
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listSettings(resource, { page, limit: 10, search: query });
      setRecords(result.data || []);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || `Unable to load ${title.toLowerCase()}`);
    } finally { setLoading(false); }
  }, [page, query, resource, title]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const optionFields = fields.filter((field) => field.optionsResource);
    Promise.all(optionFields.map(async (field) => {
      const result = await listSettings(field.optionsResource, { limit: 200 });
      return [field.name, result.data || []];
    })).then((entries) => setOptions(Object.fromEntries(entries))).catch(() => toast.error("Unable to load form options"));
  }, [fields]);

  const stats = useMemo(() => ({
    total: records.length,
    active: records.filter((record) => record.status === "Active").length,
    inactive: records.filter((record) => record.status === "Inactive").length,
  }), [records]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm(fields)); setModalOpen(true); };
  const openEdit = (record) => {
    setEditingId(record._id);
    setForm(Object.fromEntries(fields.map((field) => [field.name, field.type === "relation" ? getValue(record, `${field.name}._id`) || "" : record[field.name] ?? ""])));
    setModalOpen(true);
  };
  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingId) await updateSetting(resource, editingId, form);
      else await createSetting(resource, form);
      toast.success(`${singular} ${editingId ? "updated" : "created"}`);
      setModalOpen(false);
      await load();
    } catch (error) { toast.error(error.response?.data?.message || `Unable to save ${singular.toLowerCase()}`); }
    finally { setSaving(false); }
  };
  const remove = async (record) => {
    if (!window.confirm(`Delete ${singular.toLowerCase()} “${record.name || record.hsnCode || record.warehouseName}”?`)) return;
    try { await deleteSetting(resource, record._id); toast.success(`${singular} deleted`); await load(); }
    catch (error) { toast.error(error.response?.data?.message || `Unable to delete ${singular.toLowerCase()}`); }
  };

  return <div className="mt-4 pb-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><h1 className="text-2xl font-bold text-gray-900">{title}</h1><p className="mt-1 text-sm text-gray-500">Manage {title.toLowerCase()} stored in MongoDB.</p></div>
      <button onClick={openCreate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-orange-200"><FiPlus /> Add {singular}</button>
    </div>

    <div className={`mt-5 grid gap-3 ${hasStatus ? "sm:grid-cols-3" : "sm:grid-cols-1"}`}>
      <div className="rounded-xl border border-orange-100 bg-orange-50 p-4"><p className="text-sm text-orange-700">Visible on this page</p><p className="mt-1 text-2xl font-bold text-orange-900">{stats.total}</p></div>
      {hasStatus && <><div className="rounded-xl border border-green-100 bg-green-50 p-4"><p className="text-sm text-green-700">Active</p><p className="mt-1 text-2xl font-bold text-green-900">{stats.active}</p></div><div className="rounded-xl border border-gray-200 bg-gray-50 p-4"><p className="text-sm text-gray-600">Inactive</p><p className="mt-1 text-2xl font-bold text-gray-900">{stats.inactive}</p></div></>}
    </div>

    <form onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(search.trim()); }} className="mt-5 flex max-w-xl gap-2">
      <label className="relative flex-1"><span className="sr-only">Search</span><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}`} className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"/></label>
      <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50">Search</button>
    </form>

    <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[720px]"><thead className="bg-gray-50 text-sm text-gray-600"><tr><th className="p-4 text-left">#</th>{columns.map((column) => <th key={column.key} className="p-4 text-left font-semibold">{column.label}</th>)}<th className="p-4 text-right font-semibold">Actions</th></tr></thead>
        <tbody>{loading ? <tr><td colSpan={columns.length + 2} className="p-10 text-center text-gray-500">Loading...</td></tr> : records.length === 0 ? <tr><td colSpan={columns.length + 2} className="p-10 text-center text-gray-500">No records found.</td></tr> : records.map((record, index) => <tr key={record._id} className="border-t border-gray-100 hover:bg-orange-50/30"><td className="p-4 text-gray-500">{(page - 1) * 10 + index + 1}</td>{columns.map((column) => <td key={column.key} className="p-4 text-gray-700">{column.render ? column.render(record) : getValue(record, column.key) || "—"}</td>)}<td className="p-4"><div className="flex justify-end gap-2"><button onClick={() => openEdit(record)} title="Edit" className="rounded-md p-2 text-amber-600 transition hover:bg-amber-50"><FiEdit2 /></button><button onClick={() => remove(record)} title="Delete" className="rounded-md p-2 text-red-600 transition hover:bg-red-50"><FiTrash2 /></button></div></td></tr>)}</tbody>
      </table>
      <div className="flex items-center justify-between border-t p-4 text-sm"><span>Page {page} of {totalPages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded border px-3 py-1.5 disabled:opacity-40">Previous</button><button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border px-3 py-1.5 disabled:opacity-40">Next</button></div></div>
    </div>

    {modalOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
      <form onSubmit={submit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-6 py-4"><h2 className="text-lg font-semibold">{editingId ? "Edit" : "Add"} {singular}</h2><button type="button" onClick={() => setModalOpen(false)} className="rounded p-2 text-gray-500 hover:bg-gray-100" aria-label="Close"><FiX /></button></div>
        <div className="space-y-4 p-6">{fields.map((field) => <label key={field.name} className="block"><span className="mb-1.5 block text-sm font-medium text-gray-700">{field.label}{field.required && <span className="text-red-500"> *</span>}</span>{field.type === "textarea" ? <textarea required={field.required} rows="3" value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"/> : field.type === "select" || field.type === "relation" ? <select required={field.required} value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"><option value="">Select {field.label.toLowerCase()}</option>{(field.options || options[field.name] || []).map((option) => <option key={option.value || option._id} value={option.value || option._id}>{option.label || option.name}</option>)}</select> : <input type={field.type || "text"} min={field.min} max={field.max} required={field.required} value={form[field.name]} onChange={(e) => setForm({ ...form, [field.name]: e.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"/>}</label>)}</div>
        <div className="flex justify-end gap-3 border-t px-6 py-4"><button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border px-4 py-2">Cancel</button><button disabled={saving} className="rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60">{saving ? "Saving..." : "Save"}</button></div>
      </form>
    </div>}
  </div>;
};

export default ProductSettingPage;
