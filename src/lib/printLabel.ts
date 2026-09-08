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

export function printComplaintLabel(complaint: PrinterComplaint) {
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
  <title>Label ${partyName}</title>
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
      padding: 1.8mm 2mm;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 1.4mm;
    }
    .party {
      font-size: 12pt;
      font-weight: 800;
      line-height: 1.1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .meta {
      font-size: 10pt;
      font-weight: 700;
      line-height: 1.15;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  </style>
</head>
<body>
  <div class="label">
    <div class="party">${partyName}</div>
    <div class="meta">Ph: ${phoneNo}</div>
    <div class="meta">Date: ${createdDate}</div>
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
