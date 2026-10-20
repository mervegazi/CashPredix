import { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  FileText,
  Loader2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function FileDropzone({ companies, onBatchUpload, isUploading }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id || '');
  const fileInputRef = useRef(null);

  // Parse CSV text into array of objects
  const parseCSV = (text) => {
    const lines = text
      .split(/\r\n|\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new Error('CSV file is empty or missing data rows');
    }

    // Parse header row
    const rawHeaders = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

    const nameIdx = rawHeaders.findIndex((h) => h.includes('customer') || h.includes('client') || h.includes('vendor') || h.includes('name'));
    const termsIdx = rawHeaders.findIndex((h) => h.includes('term'));
    const categoryIdx = rawHeaders.findIndex((h) => h.includes('category') || h.includes('industry') || h.includes('type'));
    const amountIdx = rawHeaders.findIndex((h) => h.includes('invoice amount') || h.includes('amount') || h.includes('balance') || h.includes('inflow') || h.includes('receivable'));
    const invNoIdx = rawHeaders.findIndex((h) => h.includes('invoice number') || h.includes('invoice #') || h.includes('inv_number') || h.includes('invoice_no') || h.includes('inv'));
    const invDateIdx = rawHeaders.findIndex((h) => h.includes('invoice date') || h.includes('issue date'));
    const dueDateIdx = rawHeaders.findIndex((h) => h.includes('due date') || h.includes('maturity date') || h.includes('vade'));
    const methodIdx = rawHeaders.findIndex((h) => h.includes('method') || h.includes('payment method') || h.includes('instrument'));
    const checkNoIdx = rawHeaders.findIndex((h) => h.includes('check number') || h.includes('check #') || h.includes('chk'));
    const installmentIdx = rawHeaders.findIndex((h) => h.includes('installment') || h.includes('split') || h.includes('part'));

    if (nameIdx === -1) {
      throw new Error('Could not find a "Customer Name", "Client Name", or "Name" header column');
    }

    const rows = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      // Basic CSV regex to support comma within quotes
      const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
      const cleanValues = values.map((v) => v.replace(/^["']|["']$/g, '').trim());

      const customerName = cleanValues[nameIdx] || '';
      const paymentTerms = (termsIdx !== -1 ? cleanValues[termsIdx] : '') || 'Net 30';
      const category = (categoryIdx !== -1 ? cleanValues[categoryIdx] : '') || 'Commercial Client';
      const amount = amountIdx !== -1 ? parseFloat(cleanValues[amountIdx].replace(/[$,]/g, '')) : null;

      if (!customerName) {
        errors.push(`Row ${i + 1}: Missing customer name, skipped.`);
        continue;
      }

      rows.push({
        id: `import-${Date.now()}-${i}`,
        name: customerName,
        payment_terms: paymentTerms,
        category,
        amount: isNaN(amount) ? null : amount,
        invoice_number: invNoIdx !== -1 ? cleanValues[invNoIdx] : null,
        invoice_date: invDateIdx !== -1 ? cleanValues[invDateIdx] : null,
        due_date: dueDateIdx !== -1 ? cleanValues[dueDateIdx] : null,
        payment_method: methodIdx !== -1 ? cleanValues[methodIdx] : null,
        check_number: checkNoIdx !== -1 ? cleanValues[checkNoIdx] : null,
        installment: installmentIdx !== -1 ? cleanValues[installmentIdx] : null,
        status: 'Valid',
      });
    }

    return { rows, errors };
  };

  const handleFileProcess = (file) => {
    if (!file) return;

    const validExtensions = ['.csv', '.txt'];
    const fileName = file.name.toLowerCase();
    const isValidType = validExtensions.some((ext) => fileName.endsWith(ext)) || file.type.includes('csv') || file.type.includes('text');

    if (!isValidType) {
      toast.error('Please upload a standard .CSV or .TXT ledger file.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const { rows, errors } = parseCSV(text);
        setParsedRows(rows);
        setParseErrors(errors);
        toast.success(`Parsed ${rows.length} customer rows successfully!`);
      } catch (err) {
        toast.error(`CSV Parsing failed: ${err.message}`);
        setParsedRows([]);
        setParseErrors([err.message]);
      }
    };

    reader.readAsText(file);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setParseErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadSample = (type = 'ledger') => {
    let sampleContent = '';
    let fileName = '';

    if (type === 'ledger') {
      fileName = 'cashpredix_ar_financial_ledger_sample.csv';
      sampleContent =
        'Invoice Number,Customer Name,Invoice Date,Due Date,Payment Terms,Invoice Amount,Payment Date,Amount Paid,Remaining Balance,Payment Method,Installment,Check Number,Check Maturity Date,Factoring Fee,Status\n' +
        'INV-2025-10482,JPMorgan Chase Treasury,2025-06-20,2025-07-20,Net 30,12500.00,2025-07-18,6250.00,6250.00,wire_transfer,1/2,,,0.00,PARTIAL\n' +
        'INV-2025-10482,JPMorgan Chase Treasury,2025-06-20,2025-07-20,Net 30,12500.00,2025-07-28,6250.00,0.00,check,2/2,CHK-884120,2025-07-28,0.00,PAID\n' +
        'INV-2025-22415,Walmart eCommerce,2025-08-01,2025-09-30,Net 60,45000.00,2025-08-15,45000.00,0.00,check,1/1,CHK-441209,2025-09-30,1125.00,PAID (Factored / Kırdırıldı)\n' +
        'INV-2025-33190,Shopify Plus Merchant,2025-08-10,2025-08-25,Net 15,18200.00,2025-08-23,18200.00,0.00,ach,1/1,,,0.00,PAID\n' +
        'INV-2025-44012,Mayo Clinical Systems,2025-09-05,2025-10-20,Net 45,65000.00,2025-10-10,65000.00,0.00,cash,1/1,,,0.00,PAID\n' +
        'INV-2025-55910,Nike Global Logistics,2025-09-12,2025-10-12,2/10 Net 30,32500.00,2025-09-20,31850.00,0.00,wire_transfer,1/1,,,0.00,PAID (2% Early Discount)\n' +
        'INV-2025-66120,State Research Institute,2025-09-20,2025-12-19,Net 90,19500.00,,,19500.00,,1/1,,,0.00,PENDING\n';
    } else {
      fileName = 'cashpredix_customer_sample.csv';
      sampleContent =
        'Customer Name,Payment Terms,Category,Estimated Monthly Inflow\n' +
        'JPMorgan Chase Treasury,Net 30,FinTech & Banking,45000.00\n' +
        'Shopify Plus Merchant,Net 15,SaaS & Digital Platforms,18200.00\n' +
        'Walmart eCommerce,Net 60,Retail & Wholesale Chains,84000.00\n' +
        'Mayo Clinical Systems,Net 45,Healthcare & Clinical,65000.00\n' +
        'Nike Global Logistics,2/10 Net 30,Logistics & Transit,32500.00\n' +
        'State Research Institute,Net 90,Public Sector & Education,19500.00\n';
    }

    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${fileName}!`);
  };

  const handleConfirmBatchUpload = () => {
    if (!selectedCompanyId) {
      toast.error('Please select a target company entity.');
      return;
    }
    if (parsedRows.length === 0) {
      toast.error('No valid rows available to import.');
      return;
    }
    onBatchUpload(parsedRows, selectedCompanyId);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Sample Download */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              Batch Customer & Accounts Receivable Ingestion
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Bulk upload corporate customer ledgers, invoices, split payments, checks, and maturity dates.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => handleDownloadSample('ledger')}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm"
            title="Download full AR ledger template with invoices, due dates, and check details"
          >
            <Download className="w-3.5 h-3.5" />
            <span>AR Ledger Template (CSV)</span>
          </button>
          <button
            type="button"
            onClick={() => handleDownloadSample('customers')}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/80 transition-all shadow-sm"
            title="Download simple customer directory template"
          >
            <Download className="w-3.5 h-3.5 text-gray-400" />
            <span>Customer Directory (CSV)</span>
          </button>
        </div>
      </div>

      {/* Dropzone Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
            : 'border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-900/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt,.xlsx,.xls"
          onChange={(e) => handleFileProcess(e.target.files?.[0])}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              Drag & Drop your customer receivables ledger here, or <span className="text-blue-500 hover:underline">browse files</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Supports CSV, TXT, Excel exported files (Up to 10,000 rows)
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2 text-[11px] text-gray-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Automatic header mapping</span>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Client-side parsing & instant preview</span>
          </div>
        </div>
      </div>

      {/* Parsed Results Preview */}
      {selectedFile && (
        <div className="rounded-2xl p-5 bg-white dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  {parsedRows.length} valid customer records extracted
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Select target company */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Assign to:
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-medium rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                title="Discard file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {parseErrors.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              <div className="space-y-1">
                <span className="font-semibold">Parsing Notices:</span>
                {parseErrors.slice(0, 3).map((err, i) => (
                  <p key={i} className="text-[11px] opacity-90">{err}</p>
                ))}
              </div>
            </div>
          )}

          {/* Table Preview */}
          {(() => {
            const hasInvoiceData = parsedRows.some((r) => r.invoice_number || r.due_date || r.payment_method);

            return (
              <div className="overflow-x-auto max-h-64 rounded-xl border border-gray-100 dark:border-gray-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">#</th>
                      <th className="py-2.5 px-3 font-semibold">Customer / Client Name</th>
                      {hasInvoiceData && <th className="py-2.5 px-3 font-semibold">Invoice #</th>}
                      {hasInvoiceData && <th className="py-2.5 px-3 font-semibold">Due Date (Vade)</th>}
                      <th className="py-2.5 px-3 font-semibold">Payment Terms</th>
                      {hasInvoiceData && <th className="py-2.5 px-3 font-semibold">Method / Instrument</th>}
                      {hasInvoiceData && <th className="py-2.5 px-3 font-semibold">Installment</th>}
                      {!hasInvoiceData && <th className="py-2.5 px-3 font-semibold">Category</th>}
                      <th className="py-2.5 px-3 font-semibold">Amount</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                    {parsedRows.slice(0, 10).map((row, idx) => (
                      <tr key={row.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                        <td className="py-2 px-3 text-gray-400">{idx + 1}</td>
                        <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">
                          {row.name}
                        </td>
                        {hasInvoiceData && (
                          <td className="py-2 px-3 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                            {row.invoice_number || '—'}
                          </td>
                        )}
                        {hasInvoiceData && (
                          <td className="py-2 px-3 font-mono text-[11px]">
                            {row.due_date || '—'}
                          </td>
                        )}
                        <td className="py-2 px-3">{row.payment_terms}</td>
                        {hasInvoiceData && (
                          <td className="py-2 px-3">
                            {row.payment_method ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                {row.payment_method.toUpperCase()}
                                {row.check_number && ` (${row.check_number})`}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        )}
                        {hasInvoiceData && (
                          <td className="py-2 px-3 text-gray-400 font-mono text-[11px]">
                            {row.installment || '1/1'}
                          </td>
                        )}
                        {!hasInvoiceData && <td className="py-2 px-3">{row.category}</td>}
                        <td className="py-2 px-3 font-mono font-semibold text-gray-900 dark:text-white">
                          {row.amount ? `$${row.amount.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            Valid
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}

          {parsedRows.length > 10 && (
            <p className="text-[11px] text-gray-400 text-center">
              Showing preview of first 10 rows (out of {parsedRows.length} total rows)
            </p>
          )}

          {/* Action Trigger */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={isUploading || parsedRows.length === 0}
              onClick={handleConfirmBatchUpload}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30 transition-all disabled:opacity-60"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Ingesting {parsedRows.length} Customers...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Ingest {parsedRows.length} Customers to Database</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
