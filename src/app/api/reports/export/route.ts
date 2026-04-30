import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as XLSX from "xlsx";
import { getCurrentViewer } from "@/lib/auth";
import { getReportRows } from "@/lib/services/app-data";

const reportTypes = ["members", "services", "cells", "inventory", "sermons"] as const;

type ReportType = (typeof reportTypes)[number];

function isReportType(value: string): value is ReportType {
  return reportTypes.includes(value as ReportType);
}

async function buildPdf(viewer: Awaited<ReturnType<typeof getCurrentViewer>> & object, type: ReportType) {
  const rows = await getReportRows(viewer, type);
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawText(`Rapport ${type}`, {
    x: 40,
    y: 550,
    size: 22,
    font: bold,
    color: rgb(0.08, 0.13, 0.24),
  });

  const headers = Object.keys(rows[0] ?? {});
  let y = 520;

  page.drawText(headers.join(" | "), {
    x: 40,
    y,
    size: 10,
    font: bold,
    color: rgb(0.06, 0.46, 0.43),
  });

  y -= 18;

  rows.slice(0, 20).forEach((row) => {
    const line = headers
      .map((header) => String(row[header] ?? ""))
      .join(" | ")
      .slice(0, 110);

    page.drawText(line, {
      x: 40,
      y,
      size: 9,
      font,
      color: rgb(0.1, 0.12, 0.16),
    });
    y -= 16;
  });

  return pdf.save();
}

async function buildXlsx(viewer: Awaited<ReturnType<typeof getCurrentViewer>> & object, type: ReportType) {
  const rows = await getReportRows(viewer, type);
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Rapport");
  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
}

export async function GET(request: NextRequest) {
  const viewer = await getCurrentViewer();
  if (!viewer || !viewer.church_id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const type = request.nextUrl.searchParams.get("type");
  const format = request.nextUrl.searchParams.get("format");

  if (!type || !isReportType(type) || !format || !["pdf", "xlsx"].includes(format)) {
    return NextResponse.json({ error: "Paramètres d'export invalides" }, { status: 400 });
  }

  if (format === "pdf") {
    const bytes = await buildPdf(viewer, type);
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rapport-${type}.pdf"`,
      },
    });
  }

  const workbook = await buildXlsx(viewer, type);
  return new NextResponse(Buffer.from(workbook), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="rapport-${type}.xlsx"`,
    },
  });
}
