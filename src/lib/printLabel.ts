import JsBarcode from "jsbarcode"
import { format } from "date-fns"
import type { PrinterComplaint } from "@/types/complaint"

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function createBarcodeDataUrl(value: string) {
  const canvas = document.createElement("canvas")
  JsBarcode(canvas, value, {
    format: "CODE128",
    width: 1.4,
    height: 28,
    displayValue: false,
    margin: 0,
    background: "#ffffff",
    lineColor: "#000000",
  })
  return canvas.toDataURL("image/png")
}

export function printComplaintLabel(complaint: PrinterComplaint) {
  const barcodeValue = String(complaint.id).padStart(6, "0")
  const barcodeSrc = createBarcodeDataUrl(barcodeValue)
  const partyName = escapeHtml(complaint.party_name?.trim() || "N/A")
  const phoneNo = escapeHtml(complaint.phone_no?.trim() || "N/A")
  const createdDate = escapeHtml(format(new Date(complaint.created_at), "dd/MM/yyyy HH:mm"))

  const printWindow = window.open("", "_blank", "width=400,height=300")
  if (!printWindow) {
    throw new Error("Unable to open print window. Please allow pop-ups for this site.")
  }

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Label ${barcodeValue}</title>
  <style>
    @page {
      size: 50mm 25mm;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 50mm;
      height: 25mm;
      overflow: hidden;
      background: #fff;
      color: #000;
      font-family: Arial, Helvetica, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .label {
      width: 50mm;
      height: 25mm;
      padding: 1.2mm 1.5mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .party {
      font-size: 8.5pt;
      font-weight: 700;
      line-height: 1.1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .meta {
      font-size: 7pt;
      line-height: 1.15;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .barcode-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 10mm;
    }
    .barcode-wrap img {
      max-width: 46mm;
      max-height: 9mm;
      width: auto;
      height: auto;
    }
    .code {
      text-align: center;
      font-size: 6.5pt;
      letter-spacing: 0.4px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="label">
    <div>
      <div class="party">${partyName}</div>
      <div class="meta">Ph: ${phoneNo}</div>
      <div class="meta">Date: ${createdDate}</div>
    </div>
    <div class="barcode-wrap">
      <img src="${barcodeSrc}" alt="Barcode ${barcodeValue}" />
    </div>
    <div class="code">${barcodeValue}</div>
  </div>
  <script>
    window.onload = function () {
      setTimeout(function () {
        window.focus();
        window.print();
      }, 150);
    };
  </script>
</body>
</html>`)
  printWindow.document.close()
}
