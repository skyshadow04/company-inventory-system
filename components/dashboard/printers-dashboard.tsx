"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type PrinterRecord = {
  printer_id: number;
  printer_name: string;
  entity: string;
  toners: Array<{ toner_id: number; toner_name: string; toner_code: string; toner_quantity: number }>;
  drums: Array<{ drum_id: number; drum_name: string; drum_code: string; drum_quantity: number }>;
};

type ConsumableDraft = { name: string; code: string; quantity: number };

const emptyConsumable = (): ConsumableDraft => ({ name: "", code: "", quantity: 0 });

export function PrintersDashboard({ initialPrinters, entity }: { initialPrinters: PrinterRecord[]; entity?: string }) {
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrinterId, setEditingPrinterId] = useState<number | null>(null);
  const [editPrinterName, setEditPrinterName] = useState("");
  const [editToners, setEditToners] = useState<ConsumableDraft[]>([]);
  const [editDrums, setEditDrums] = useState<ConsumableDraft[]>([]);
  const [printerName, setPrinterName] = useState("");
  const [toners, setToners] = useState<ConsumableDraft[]>([emptyConsumable()]);
  const [drums, setDrums] = useState<ConsumableDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateRow(type: "toners" | "drums", index: number, field: keyof ConsumableDraft, value: string) {
    const setter = type === "toners" ? setToners : setDrums;
    setter((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: field === "quantity" ? Number(value) : value } : row));
  }

  function addRow(type: "toners" | "drums") {
    const setter = type === "toners" ? setToners : setDrums;
    setter((rows) => [...rows, emptyConsumable()]);
  }

  function removeRow(type: "toners" | "drums", index: number) {
    const setter = type === "toners" ? setToners : setDrums;
    setter((rows) => rows.length === 1 && type === "toners" ? rows : rows.filter((_, rowIndex) => rowIndex !== index));
  }

  function startEditing(printer: PrinterRecord) {
    setEditingPrinterId(printer.printer_id);
    setEditPrinterName(printer.printer_name);
    setEditToners(printer.toners.map((toner) => ({ name: toner.toner_name, code: toner.toner_code, quantity: toner.toner_quantity })));
    setEditDrums(printer.drums.map((drum) => ({ name: drum.drum_name, code: drum.drum_code, quantity: drum.drum_quantity })));
    setError(null);
  }

  function updateEditRow(type: "toners" | "drums", index: number, field: keyof ConsumableDraft, value: string) {
    const setter = type === "toners" ? setEditToners : setEditDrums;
    setter((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: field === "quantity" ? Number(value) : value } : row));
  }

  function addEditRow(type: "toners" | "drums") {
    const setter = type === "toners" ? setEditToners : setEditDrums;
    setter((rows) => [...rows, emptyConsumable()]);
  }

  function removeEditRow(type: "toners" | "drums", index: number) {
    const setter = type === "toners" ? setEditToners : setEditDrums;
    setter((rows) => rows.length === 1 && type === "toners" ? rows : rows.filter((_, rowIndex) => rowIndex !== index));
  }

  async function saveEdit() {
    if (editingPrinterId === null) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/printers/${editingPrinterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printerName: editPrinterName, toners: editToners, drums: editDrums }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || "Unable to update printer.");
        return;
      }

      setEditingPrinterId(null);
      setMessage("Printer updated successfully.");
      router.refresh();
    } catch (submissionError: unknown) {
      setError(submissionError instanceof Error ? submissionError.message : "Network error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/printers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ printerName, entity, toners, drums }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.message || "Unable to create printer.");
        return;
      }

      setPrinterName("");
      setToners([emptyConsumable()]);
      setDrums([]);
      setMessage("Printer created successfully.");
      setIsFormOpen(false);
      router.refresh();
    } catch (submissionError: unknown) {
      setError(submissionError instanceof Error ? submissionError.message : "Network error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Printer stock</h2>
        <button type="button" onClick={() => setIsFormOpen((open) => !open)} className="rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800">
          {isFormOpen ? "Cancel" : "Add printer"}
        </button>
      </div>

      {message && <p className="text-sm text-emerald-700">{message}</p>}

      {isFormOpen && <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Add printer</h2>
          <p className="mt-1 text-sm text-slate-600">Record every compatible toner and drum with its current stock.</p>
        </div>
        <label className="block max-w-xl space-y-2">
          <span className="text-sm font-medium text-slate-700">Printer name</span>
          <input required value={printerName} onChange={(event) => setPrinterName(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200" placeholder="e.g. HP Color LaserJet Pro" />
        </label>

        {([['toners', toners, 'Toners'], ['drums', drums, 'Drums']] as const).map(([type, rows, label]) => (
          <section key={type} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{label}</h3>
                {type === "drums" && <p className="mt-1 text-xs text-slate-500">Optional for printers without drums.</p>}
              </div>
              <button type="button" onClick={() => addRow(type)} className="text-sm font-semibold text-sky-700 hover:text-sky-900">+ Add {type === "toners" ? "toner" : "drum"}</button>
            </div>
            <div className="space-y-3">
              {rows.map((row, index) => (
                <div key={`${type}-${index}`} className="grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_8rem_auto]">
                  <input required value={row.name} onChange={(event) => updateRow(type, index, "name", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder={`${label.slice(0, -1)} name (Black)`} />
                  <input required value={row.code} onChange={(event) => updateRow(type, index, "code", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Code" />
                  <input required min={0} type="number" value={row.quantity} onChange={(event) => updateRow(type, index, "quantity", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Stock" />
                  <button type="button" onClick={() => removeRow(type, index)} disabled={rows.length === 1} className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40" aria-label={`Remove ${label.slice(0, -1).toLowerCase()}`}>Remove</button>
                </div>
              ))}
            </div>
          </section>
        ))}

        {error && <p className="text-sm text-red-700">{error}</p>}
        <button disabled={loading} type="submit" className="rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50">{loading ? "Saving..." : "Save printer"}</button>
      </form>}

      <section className="space-y-4">
        {initialPrinters.length === 0 ? <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No printers recorded yet.</p> : initialPrinters.map((printer) => (
          <article key={printer.printer_id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {editingPrinterId === printer.printer_id ? (
              <div className="space-y-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">Edit printer</h3>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{printer.entity} · ID {printer.printer_id}</span>
                </div>
                <input required value={editPrinterName} onChange={(event) => setEditPrinterName(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Printer name" />
                {([['toners', editToners, 'Toners'], ['drums', editDrums, 'Drums']] as const).map(([type, rows, label]) => (
                  <section key={type} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-800">{label}</h4>
                        {type === "drums" && <p className="mt-1 text-xs text-slate-500">Optional for printers without drums.</p>}
                      </div>
                      <button type="button" onClick={() => addEditRow(type)} className="text-sm font-semibold text-sky-700 hover:text-sky-900">+ Add {type === "toners" ? "toner" : "drum"}</button>
                    </div>
                    <div className="space-y-3">
                      {rows.map((row, index) => (
                        <div key={`${type}-${index}`} className="grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_8rem_auto]">
                          <input required value={row.name} onChange={(event) => updateEditRow(type, index, "name", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder={`${label.slice(0, -1)} name (Black)`} />
                          <input required value={row.code} onChange={(event) => updateEditRow(type, index, "code", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Code" />
                          <input required min={0} type="number" value={row.quantity} onChange={(event) => updateEditRow(type, index, "quantity", event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Stock" />
                          <button type="button" onClick={() => removeEditRow(type, index)} disabled={rows.length === 1 && type === "toners"} className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40">Remove</button>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
                {error && <p className="text-sm text-red-700">{error}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setEditingPrinterId(null)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                  <button type="button" onClick={saveEdit} disabled={loading} className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50">{loading ? "Saving..." : "Save changes"}</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{printer.printer_name}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{printer.entity} · ID {printer.printer_id}</span>
                    <button type="button" onClick={() => startEditing(printer)} className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100">Edit printer</button>
                  </div>
                </div>
                <div className="mt-5 grid gap-6 md:grid-cols-2">
                  {[['Toners', printer.toners, 'toner_name', 'toner_code', 'toner_quantity'], ['Drums', printer.drums, 'drum_name', 'drum_code', 'drum_quantity']].map(([label, records, nameKey, codeKey, quantityKey]) => (
                    <div key={label as string}>
                      <h4 className="mb-2 text-sm font-semibold text-slate-700">{label as string}</h4>
                      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                        {(records as Array<Record<string, string | number>>).map((record) => <div key={String(record[`${String(label).toLowerCase().slice(0, -1)}_id`])} className="flex items-center justify-between gap-3 px-3 py-2 text-sm"><span><span className="font-medium text-slate-800">{record[nameKey as string]}</span><span className="ml-2 text-slate-500">{record[codeKey as string]}</span></span><span className="font-semibold text-slate-900">{record[quantityKey as string]}</span></div>)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </article>
        ))}
      </section>
    </div>
  );
}
