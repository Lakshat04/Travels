import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Download, Pencil, Printer, ArrowLeft } from 'lucide-react';
import type { Bill } from '../types';
import { billsApi } from '../api/billsApi';
import { InvoicePreview } from '../components/InvoicePreview';
import { LoadingButton } from '../components/LoadingButton';

export function ViewBillPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    billsApi.get(Number(id)).then((b) => {
      setBill(b);
      if (searchParams.get('print') === '1') {
        setTimeout(() => window.print(), 400);
      }
    }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDownload = async () => {
    if (!bill) return;
    setDownloading(true);
    try {
      await billsApi.downloadPdf(bill.id, bill.invoiceNumber);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="text-sm text-[var(--grey-600)]">Loading invoice...</div>;
  if (!bill) return <div className="text-sm text-[var(--grey-600)]">Invoice not found.</div>;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 print:hidden">
        <button onClick={() => navigate('/bills')} className="flex items-center gap-1.5 text-sm text-[var(--grey-600)] hover:text-[var(--ink)]">
          <ArrowLeft size={16} /> Back to Bills
        </button>
        <div className="flex items-center gap-2">
          <LoadingButton onClick={() => navigate(`/bills/${bill.id}/edit`)} icon={<Pencil size={16} />} variant="outline">
            Edit
          </LoadingButton>
          <LoadingButton onClick={() => window.print()} icon={<Printer size={16} />} variant="primary">
            Print
          </LoadingButton>
          <LoadingButton onClick={handleDownload} loading={downloading} loadingText="Downloading..." icon={<Download size={16} />} variant="gold">
            Download PDF
          </LoadingButton>
        </div>
      </div>

      <InvoicePreview data={bill} />
    </div>
  );
}
