"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink } from "lucide-react";

export default function HandoverPreview({ assetId, entity }: { assetId: number; entity: string }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ download: "0" });
    if (entity) {
      params.set("entity", entity);
    }

    let objectUrl: string | null = null;

    async function loadPdf() {
      try {
        const response = await fetch(`/api/assets/${assetId}/handover?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Unable to prepare the handover PDF.");
        }

        objectUrl = URL.createObjectURL(await response.blob());
        setPdfUrl(objectUrl);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Unable to prepare the handover PDF.");
      }
    }

    void loadPdf();
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [assetId, entity]);

  if (error) {
    return <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  }

  if (!pdfUrl) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Preparing PDF preview...</div>;
  }

  const downloadParams = new URLSearchParams({ download: "1" });
  if (entity) {
    downloadParams.set("entity", entity);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      <iframe title="Completed asset handover PDF" src={pdfUrl} className="h-[75vh] min-h-[620px] w-full bg-white" />
      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-white p-4">
        <a href={pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Open in new tab
        </a>
        <a href={`/api/assets/${assetId}/handover?${downloadParams.toString()}`} className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600">
          <Download className="h-4 w-4" aria-hidden="true" />
          Download PDF
        </a>
      </div>
    </section>
  );
}