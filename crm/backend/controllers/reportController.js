const Lead = require("../models/Lead");
const User = require("../models/User");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

// Helpers
const addPageIfNeeded = (doc, y, needed, top = 50, bottom = 60) => {
  if (y + needed > doc.page.height - bottom) {
    doc.addPage();
    return top;
  }
  return y;
};

const writeTableHeader = (doc, x, y, widths, labels, fillColor = "#F3F4F6", textColor = "#111827") => {
  doc.fillColor(fillColor).rect(x, y, widths.reduce((a, b) => a + b, 0), 32).fill();
  doc.fillColor(textColor).font("Helvetica-Bold").fontSize(9);
  let xPos = x + 6;
  labels.forEach((l, i) => {
    doc.text(l, xPos, y + 6, { width: widths[i] - 10 });
    xPos += widths[i];
  });
  return y + 22;
};

exports.getReportPreview = async (req, res) => {
  try {
    const { reportType, dateFrom, dateTo } = req.body;
    const reportData = await getReportData(req.body);

    const responseData = {
      summary: reportData.summary,
      dateRange: { from: dateFrom, to: dateTo },
      reportType,
      totalRecords: reportData.individualLeads?.length || 0
    };

    if (reportType === "overall" || reportType === "analysis-only") {
      responseData.performanceData = reportData.performanceData;
    }
    if (reportType === "overall" || reportType === "leads-only") {
      responseData.individualLeads = reportData.individualLeads;
    }

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to generate report preview", error: error.message });
  }
};

exports.generatePDFReport = async (req, res) => {
  try {
    const { reportType } = req.body;
    const reportData = await getReportData(req.body);

    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
      bufferPages: false,
      info: {
        Title: "CRM Performance Report",
        Author: "CRM System",
        Subject: "Performance Analysis Report",
        Creator: "CRM System"
      }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="CRM_Report_${reportType}_${Date.now()}.pdf"`
    );

    doc.pipe(res);

    // Header bar
    const headerGradient = doc.linearGradient(0, 0, doc.page.width, 80);
    headerGradient.stop(0, "#FF6600");
    headerGradient.stop(1, "#FF8533");
    doc.save();
    doc.rect(0, 0, doc.page.width, 80).fill(headerGradient);
    doc.restore();

    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(26).text("CRM", 50, 20);
    doc.fontSize(20).text("PERFORMANCE REPORT", 120, 20);
    doc.font("Helvetica").fontSize(10).text(
      `Generated: ${new Date().toLocaleString()}`,
      50,
      52
    );

    // Report type chip (no rgba)
    doc.save();
    doc.roundedRect(doc.page.width - 200, 25, 150, 25, 4).stroke("#FFFFFF");
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(9).text(
      reportType === "overall"
        ? "COMPREHENSIVE REPORT"
        : reportType === "leads-only"
        ? "LEADS DATABASE"
        : "PERFORMANCE ANALYSIS",
      doc.page.width - 195,
      33,
      { width: 140, align: "center" }
    );
    doc.restore();

    // Config block
    let y = 100;
    doc.roundedRect(40, y, doc.page.width - 80, 70, 5).fill("#F8F9FA").stroke("#E5E7EB");
    doc.fillColor("#1F2937").font("Helvetica-Bold").fontSize(14).text("REPORT CONFIGURATION", 50, y + 14);
    const leftCol = 60;
    const rightCol = 300;
    doc.font("Helvetica-Bold").fontSize(9).fillColor("#6B7280");
    doc.text("REPORT TYPE:", leftCol, y + 35);
    doc.text("DATE RANGE:", leftCol, y + 50);
    doc.text("TOTAL RECORDS:", rightCol, y + 35);
    doc.text("FILTERS APPLIED:", rightCol, y + 50);

    doc.font("Helvetica").fillColor("#1F2937");
    doc.text(req.body.reportType.replace("-", " ").toUpperCase(), leftCol + 90, y + 35);
    doc.text(
      `${req.body.dateFrom || "All Time"} to ${req.body.dateTo || "Present"}`,
      leftCol + 90,
      y + 50
    );
    doc.text((reportData.individualLeads?.length || 0).toString(), rightCol + 100, y + 35);
    doc.text(req.body.userType === "all" ? "All Users" : req.body.userType, rightCol + 100, y + 50);

    y += 140;

    // Executive summary cards
    doc.fillColor("#1F2937").font("Helvetica-Bold").fontSize(16).text("EXECUTIVE SUMMARY", 40, y);
    y += 28;

    const cards = [
      { label: "Total Leads", value: reportData.summary.totalLeads, color: "#3B82F6" },
      { label: "Converted", value: reportData.summary.converted, color: "#10B981" },
      { label: "In Progress", value: reportData.summary.inProgress, color: "#F59E0B" },
      { label: "Lost", value: reportData.summary.failed, color: "#EF4444" }
    ];
    const cardWidth = (doc.page.width - 140) / 4;
    const cardHeight = 62;

    y = addPageIfNeeded(doc, y, cardHeight + 10);
    cards.forEach((c, i) => {
      const x = 40 + i * (cardWidth + 20);
      doc.save();
      doc.roundedRect(x, y, cardWidth, cardHeight, 8).fill("#FFFFFF").stroke("#E5E7EB");
      doc.fillColor(c.color).font("Helvetica-Bold").fontSize(22).text(String(c.value), x, y + 14, {
        width: cardWidth,
        align: "center"
      });
      doc.fillColor("#6B7280").font("Helvetica").fontSize(9).text(c.label, x, y + 42, {
        width: cardWidth,
        align: "center"
      });
      doc.restore();
    });

    y += cardHeight + 50;

    // Performance section
    if ((reportType === "overall" || reportType === "analysis-only") && reportData.performanceData?.length) {
      doc.fillColor("#1F2937").font("Helvetica-Bold").fontSize(16).text("PERFORMANCE ANALYSIS", 30, y);
      y += 24;

      const headers = ["Name", "Role", "Total", "Converted", "In Progress", "Lost", "Success Rate"];
      const widths = [110, 70, 50, 60, 70, 50, 80];
      const tableWidth = widths.reduce((a, b) => a + b, 0);
      const startX = (doc.page.width - tableWidth) / 2;

      y = addPageIfNeeded(doc, y, 24);
      y = writeTableHeader(doc, startX, y, widths, headers);

      doc.font("Helvetica").fontSize(9);
      reportData.performanceData.forEach((u, idx) => {
        y = addPageIfNeeded(doc, y, 20);
        const rowColor = idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB";
        doc.fillColor(rowColor).rect(startX, y, tableWidth, 19).fill().stroke("#E5E7EB");

        let x = startX + 6;
        const row = [
          u.name || "N/A",
          u.role || "N/A",
          String(u.totalLeads || 0),
          String(u.converted || 0),
          String(u.inProgress || 0),
          String(u.failed || 0),
          `${u.conversionRate || 0}%`
        ];

        row.forEach((cell, i) => {
          const align = i >= 2 ? "center" : "left";
          const color =
            i === 6
              ? u.conversionRate >= 50
                ? "#10B981"
                : u.conversionRate >= 25
                ? "#F59E0B"
                : "#EF4444"
              : "#374151";
          doc.fillColor(color).text(cell, x, y + 5, { width: widths[i] - 8, align });
          x += widths[i];
        });
        y += 19;
      });

      y += 20;
    }

    // Leads section
    if ((reportType === "overall" || reportType === "leads-only") && reportData.individualLeads?.length) {
      doc.fillColor("#1F2937").font("Helvetica-Bold").fontSize(16).text("DETAILED LEADS LIST", 40, y);
      y += 22;

      const headers = ["Name", "Company", "Email", "Status", "Priority", "Assigned To", "Created"];
      const widths = [80, 85, 110, 60, 50, 75, 60];
      const tableWidth = widths.reduce((a, b) => a + b, 0);
      const startX = (doc.page.width - tableWidth) / 2;

      y = addPageIfNeeded(doc, y, 24);
      y = writeTableHeader(doc, startX, y, widths, headers, "#E5E7EB", "#111827");

      doc.font("Helvetica").fontSize(8);
      reportData.individualLeads.forEach((lead, idx) => {
        y = addPageIfNeeded(doc, y, 18);
        const rowColor = idx % 2 === 0 ? "#FFFFFF" : "#F9FAFB";
        doc.fillColor(rowColor).rect(startX, y, tableWidth, 27).fill().stroke("#E5E7EB");

        let x = startX + 4;
        const cells = [
          (lead.name || "N/A").substring(0, 18),
          (lead.company || "N/A").substring(0, 18),
          (lead.email || "N/A").substring(0, 24),
          lead.status || "N/A",
          lead.priority || "N/A",
          (lead.assignedTo || "Unassigned").substring(0, 16),
          lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : "N/A"
        ];

        cells.forEach((val, i) => {
          let color = "#374151";
          if (i === 3) {
            color =
              lead.status === "Converted"
                ? "#059669"
                : lead.status === "Lost"
                ? "#DC2626"
                : lead.status === "Work In Progress"
                ? "#2563EB"
                : "#D97706";
          } else if (i === 4) {
            color =
              lead.priority === "High"
                ? "#DC2626"
                : lead.priority === "Medium"
                ? "#D97706"
                : "#059669";
          }
          doc.fillColor(color).text(val, x, y , { width: widths[i] - 8 });
          x += widths[i];
        });

        y += 37;
      });

      // Status distribution
      const leadsLen = reportData.individualLeads.length;
      if (leadsLen > 0) {
        y += 12;
        y = addPageIfNeeded(doc, y, 20);
        doc.fillColor("#1F2937").font("Helvetica-Bold").fontSize(14).text("STATUS DISTRIBUTION", 40, y);
        y += 16;

        const statusCounts = {};
        reportData.individualLeads.forEach((l) => {
          statusCounts[l.status || "Unknown"] = (statusCounts[l.status || "Unknown"] || 0) + 1;
        });
        const maxCount = Math.max(...Object.values(statusCounts));

        Object.entries(statusCounts).forEach(([status, count]) => {
          y = addPageIfNeeded(doc, y, 18);
          const pct = ((count / leadsLen) * 100).toFixed(1);
          const barWidth = (count / (maxCount || 1)) * 220;

          doc.fillColor("#374151").font("Helvetica").fontSize(10).text(`${status}:`, 50, y + 2);
          doc.fillColor("#E5E7EB").rect(150, y, 220, 12).fill();
          const barColor =
            status === "Converted" ? "#10B981" : status === "Lost" ? "#EF4444" : "#F59E0B";
          doc.fillColor(barColor).rect(150, y, barWidth, 12).fill();
          doc.fillColor("#1F2937").font("Helvetica-Bold").fontSize(9).text(`${count} (${pct}%)`, 380, y + 2);
          y += 18;
        });
      }
    }

    doc.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Failed to generate PDF report", error: error.message });
    }
  }
};

exports.generateExcelReport = async (req, res) => {
  try {
    const { reportType } = req.body;
    const reportData = await getReportData(req.body);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "CRM System";
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet("Executive Summary");
    summarySheet.addRow(["CRM PERFORMANCE REPORT"]).font = { bold: true, size: 18, color: { argb: "FF6600" } };
    summarySheet.addRow([`Report Type: ${reportType.replace("-", " ").toUpperCase()}`]);
    summarySheet.addRow([`Date Range: ${req.body.dateFrom || "All Time"} to ${req.body.dateTo || "Present"}`]);
    summarySheet.addRow([`Generated: ${new Date().toLocaleDateString()}`]);
    summarySheet.addRow([]);

    const metricsHeader = summarySheet.addRow(["PERFORMANCE METRICS"]);
    metricsHeader.font = { bold: true, size: 14 };
    metricsHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "E5E7EB" } };
    summarySheet.addRow(["Metric", "Count", "Percentage", "Status"]);

    const total = reportData.summary.totalLeads || 1;
    const metricsData = [
      ["Total Leads", reportData.summary.totalLeads, "100%", "All Leads"],
      [
        "Converted",
        reportData.summary.converted,
        `${Math.round((reportData.summary.converted / total) * 100)}%`,
        "Success"
      ],
      [
        "In Progress",
        reportData.summary.inProgress,
        `${Math.round((reportData.summary.inProgress / total) * 100)}%`,
        "Active"
      ],
      ["Lost", reportData.summary.failed, `${Math.round((reportData.summary.failed / total) * 100)}%`, "Closed"]
    ];

    metricsData.forEach((row) => {
      const r = summarySheet.addRow(row);
      if (row[3] === "Success")
        r.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "DCFCE7" } };
      if (row[3] === "Closed")
        r.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FEE2E2" } };
      if (row[3] === "Active")
        r.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FEF3C7" } };
    });

    if ((reportType === "overall" || reportType === "analysis-only") && reportData.performanceData?.length) {
      const performanceSheet = workbook.addWorksheet("Performance Analysis");
      const header = performanceSheet.addRow([
        "Name",
        "Role",
        "Total Leads",
        "Converted",
        "In Progress",
        "Lost",
        "Conversion Rate (%)",
        "Performance Grade"
      ]);
      header.font = { bold: true };
      header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F3F4F6" } };

      reportData.performanceData.forEach((u) => {
        const rate = u.conversionRate || 0;
        const grade = rate >= 70 ? "A" : rate >= 50 ? "B" : rate >= 30 ? "C" : "D";
        const row = performanceSheet.addRow([
          u.name || "N/A",
          u.role || "N/A",
          u.totalLeads || 0,
          u.converted || 0,
          u.inProgress || 0,
          u.failed || 0,
          rate,
          grade
        ]);
        const gradeCell = row.getCell(8);
        gradeCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: grade === "A" ? "DCFCE7" : grade === "B" ? "FEF3C7" : grade === "C" ? "FED7AA" : "FEE2E2" }
        };
      });
      performanceSheet.columns.forEach((c) => (c.width = 18));
    }

    if ((reportType === "overall" || reportType === "leads-only") && reportData.individualLeads?.length) {
      const leadsSheet = workbook.addWorksheet("Leads Database");
      const header = leadsSheet.addRow([
        "Lead Name",
        "Email",
        "Phone",
        "Company",
        "Status",
        "Priority",
        "Source",
        "Created By",
        "Assigned To",
        "Created Date",
        "City",
        "State",
        "Country"
      ]);
      header.font = { bold: true };
      header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };

      reportData.individualLeads.forEach((l) => {
        const row = leadsSheet.addRow([
          l.name || "N/A",
          l.email || "N/A",
          l.phone || "N/A",
          l.company || "N/A",
          l.status || "N/A",
          l.priority || "N/A",
          l.source || "N/A",
          l.createdBy || "N/A",
          l.assignedTo || "Unassigned",
          l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "N/A",
          l.city || "N/A",
          l.state || "N/A",
          l.country || "N/A"
        ]);
        const statusCell = row.getCell(5);
        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: l.status === "Converted" ? "DCFCE7" : l.status === "Lost" ? "FEE2E2" : "FEF3C7" }
        };
      });
      leadsSheet.columns.forEach((c) => (c.width = 16));
    }

    const analyticsSheet = workbook.addWorksheet("Analytics Dashboard");
    if (reportData.individualLeads?.length) {
      const statusCounts = {};
      const sourceCounts = {};
      const priorityCounts = {};
      reportData.individualLeads.forEach((l) => {
        statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
        sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
        priorityCounts[l.priority] = (priorityCounts[l.priority] || 0) + 1;
      });

      analyticsSheet.addRow(["STATUS DISTRIBUTION"]).font = { bold: true, size: 14 };
      analyticsSheet.addRow(["Status", "Count", "Percentage"]);
      Object.entries(statusCounts).forEach(([s, c]) => {
        analyticsSheet.addRow([s, c, `${Math.round((c / reportData.individualLeads.length) * 100)}%`]);
      });
      analyticsSheet.addRow([]);

      analyticsSheet.addRow(["LEAD SOURCE ANALYSIS"]).font = { bold: true, size: 14 };
      analyticsSheet.addRow(["Source", "Count", "Percentage", "Conversion Rate"]);
      Object.entries(sourceCounts).forEach(([src, c]) => {
        const srcLeads = reportData.individualLeads.filter((l) => l.source === src);
        const converted = srcLeads.filter((l) => l.status === "Converted").length;
        const rate = srcLeads.length ? Math.round((converted / srcLeads.length) * 100) : 0;
        analyticsSheet.addRow([src, c, `${Math.round((c / reportData.individualLeads.length) * 100)}%`, `${rate}%`]);
      });
      analyticsSheet.addRow([]);

      analyticsSheet.addRow(["PRIORITY ANALYSIS"]).font = { bold: true, size: 14 };
      analyticsSheet.addRow(["Priority", "Count", "Percentage"]);
      Object.entries(priorityCounts).forEach(([p, c]) => {
        analyticsSheet.addRow([p, c, `${Math.round((c / reportData.individualLeads.length) * 100)}%`]);
      });
      analyticsSheet.columns.forEach((c) => (c.width = 20));
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="CRM_Report_${reportType}_${Date.now()}.xlsx"`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "Failed to generate Excel report", error: error.message });
    }
  }
};

const getReportData = async (filters) => {
  const { userType, selectedUser, dateFrom, dateTo, searchTerm, sortBy, reportType } = filters;

  const dateFilter = {};
  if (dateFrom && dateTo) {
    dateFilter.createdAt = {
      $gte: new Date(`${dateFrom}T00:00:00.000Z`),
      $lte: new Date(new Date(`${dateTo}T23:59:59.999Z`))
    };
  }

  const searchFilter = {};
  if (searchTerm && searchTerm.trim()) {
    searchFilter.$or = [
      { name: { $regex: searchTerm, $options: "i" } },
      { email: { $regex: searchTerm, $options: "i" } },
      { company: { $regex: searchTerm, $options: "i" } }
    ];
  }

  let leadUserFilter = {};
  if (selectedUser && selectedUser !== "all") {
    const selectedUserData = await User.findById(selectedUser);
    if (selectedUserData) {
      leadUserFilter.$or = [{ createdBy: selectedUserData.name }, { assignedTo: selectedUserData.name }];
    }
  } else if (userType !== "all") {
    const u = await User.find({
      role: userType === "coordinator" ? "Coordinator" : "Engineer",
      userDeleted: false
    });
    const names = u.map((x) => x.name);
    leadUserFilter.$or = [{ createdBy: { $in: names } }, { assignedTo: { $in: names } }];
  }

  const leads = await Lead.find({
    ...dateFilter,
    ...searchFilter,
    ...leadUserFilter,
    status: { $ne: "deleted" }
  }).sort({ createdAt: sortBy === "date" ? -1 : -1 });

  let userFilter = { userDeleted: false };
  if (userType === "coordinator") userFilter.role = "Coordinator";
  if (userType === "engineer") userFilter.role = "Engineer";
  if (selectedUser && selectedUser !== "all") userFilter._id = selectedUser;

  const users = await User.find(userFilter);

  const summary = {
    totalLeads: leads.length,
    converted: leads.filter((l) => l.status === "Converted").length,
    inProgress: leads.filter((l) => ["Work In Progress", "Opportunity", "Enquiry", "Follow-up"].includes(l.status))
      .length,
    failed: leads.filter((l) => l.status === "Lost").length
  };

  const performanceData = users.map((user) => {
    const userLeads = leads.filter((lead) => lead.createdBy === user.name || lead.assignedTo === user.name);
    const converted = userLeads.filter((l) => l.status === "Converted").length;
    const inProgress = userLeads.filter((l) => ["Work In Progress", "Opportunity", "Enquiry", "Follow-up"].includes(l.status)).length;
    const failed = userLeads.filter((l) => l.status === "Lost").length;
    const totalLeads = userLeads.length;
    return {
      name: user.name,
      role: user.role,
      totalLeads,
      converted,
      inProgress,
      failed,
      conversionRate: totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0
    };
  });

  if (sortBy) {
    performanceData.sort((a, b) => {
      switch (sortBy) {
        case "performance":
        case "conversion_rate":
          return b.conversionRate - a.conversionRate;
        case "leads_count":
          return b.totalLeads - a.totalLeads;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }

  const individualLeads =
    reportType === "analysis-only"
      ? []
      : leads.map((lead) => ({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          status: lead.status,
          priority: lead.priority,
          source: lead.source,
          createdBy: lead.createdBy,
          assignedTo: lead.assignedTo,
          createdAt: lead.createdAt,
          city: lead.city,
          state: lead.state,
          country: lead.country
        }));

  return { summary, performanceData, individualLeads };
};