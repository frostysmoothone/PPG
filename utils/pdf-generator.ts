import type { ProposalData } from "../types/proposal"

export function generatePDF(proposalData: ProposalData) {
  // Create a new window with the PDF content
  const printWindow = window.open("", "_blank")

  if (!printWindow) {
    alert("Please allow popups to generate PDF")
    return
  }

  const enabledCardFees = proposalData.cardFees.filter((fee) => fee.enabled)
  const enabledAdditionalFees = proposalData.additionalFees.filter((fee) => fee.enabled)

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Processing Proposal</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 40px; 
          line-height: 1.4;
          color: #333;
        }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start;
          border-bottom: 2px solid #eee; 
          padding-bottom: 20px; 
          margin-bottom: 30px; 
        }
        .company-info h1 { 
          margin: 0 0 10px 0; 
          font-size: 24px; 
          color: #000000;
        }
        .company-info img { 
          height: 60px; 
          margin-bottom: 10px; 
        }
        .proposal-info { 
          text-align: right; 
        }
        .proposal-info h2 { 
          margin: 0 0 10px 0; 
          font-size: 20px; 
          color: #1f2937;
        }
        .client-section { 
          margin-bottom: 30px; 
        }
        .client-section h3 { 
          margin: 0 0 10px 0; 
          font-size: 16px; 
          font-weight: bold;
        }
        .fee-section { 
          margin-bottom: 30px; 
        }
        .fee-section h3 { 
          margin: 0 0 15px 0; 
          font-size: 16px; 
          font-weight: bold;
          color: #1f2937;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 20px;
          font-size: 12px;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        th { 
          background-color: #f8f9fa; 
          font-weight: bold;
        }
        .settlement-terms { 
          background-color: #f8f9fa; 
          padding: 15px; 
          border-radius: 5px;
          margin-bottom: 30px;
        }
        .settlement-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 15px; 
        }
        .footer { 
          border-top: 1px solid #eee; 
          padding-top: 20px; 
          font-size: 11px; 
          color: #666;
          margin-top: 40px;
        }
        @media print {
          body { margin: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          ${proposalData.companyLogo ? `<img src="${proposalData.companyLogo}" alt="Company Logo">` : ""}
          <h1>${proposalData.companyName}</h1>
          <div style="white-space: pre-line; color: #666;">${proposalData.companyAddress}</div>
          <div style="color: #666; margin-top: 5px;">${proposalData.companyPhone} | ${proposalData.companyEmail}</div>
        </div>
        <div class="proposal-info">
          <h2>Payment Processing Proposal</h2>
          <div style="color: #666;">
            <div>Date: ${proposalData.proposalDate}</div>
            <div>Valid Until: ${proposalData.validUntil}</div>
          </div>
        </div>
      </div>

      <div class="client-section">
        <h3>Prepared For:</h3>
        <div style="color: #666;">
          <div style="font-weight: 500;">${proposalData.clientName}</div>
          <div>${proposalData.clientCompany}</div>
          <div style="white-space: pre-line;">${proposalData.clientAddress}</div>
          <div>${proposalData.clientEmail}</div>
        </div>
      </div>

      <div class="fee-section">
        <h3>Schedule A - Card Processing Fees</h3>
        <table>
          <thead>
            <tr>
              <th>Card Type</th>
              <th>Rate</th>
              <th>Fixed Fee</th>
              <th>Currency</th>
            </tr>
          </thead>
          <tbody>
            ${enabledCardFees
              .map(
                (fee) => `
              <tr>
                <td>${fee.cardType}</td>
                <td>${fee.percentageFee}%</td>
                <td>${fee.fixedFee.toFixed(2)}</td>
                <td>${fee.currency}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>

      ${
        enabledAdditionalFees.length > 0
          ? `
        <div class="fee-section">
          <h3>Additional Fees</h3>
          <table>
            <thead>
              <tr>
                <th>Fee Type</th>
                <th>Rate</th>
                <th>Fixed Fee</th>
                <th>Currency</th>
              </tr>
            </thead>
            <tbody>
              ${enabledAdditionalFees
                .map(
                  (fee) => `
                <tr>
                  <td>${fee.feeType}</td>
                  <td>${fee.percentageFee}%</td>
                  <td>${fee.feeType === "Reserve" ? `${fee.days} days` : fee.fixedFee.toFixed(2)}</td>
                  <td>${fee.currency}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </div>
      `
          : ""
      }

      <div class="fee-section">
        <h3>Settlement Terms</h3>
        <div class="settlement-terms">
          <div class="settlement-grid">
            <div><strong>Settlement Period:</strong> ${proposalData.settlementTerms.settlementPeriod}</div>
            <div><strong>Settlement Fee:</strong> ${proposalData.settlementTerms.settlementFee} ${proposalData.settlementTerms.settlementCurrency}</div>
            <div><strong>Minimum Settlement:</strong> ${proposalData.settlementTerms.minimumSettlement} ${proposalData.settlementTerms.settlementCurrency}</div>
            <div><strong>Settlement Currency:</strong> ${proposalData.settlementTerms.settlementCurrency}</div>
          </div>
        </div>
      </div>

      <div class="footer">
        <p>This proposal is valid until ${proposalData.validUntil}. Terms and conditions apply.</p>
        <p style="margin-top: 10px;">For questions regarding this proposal, please contact us at ${proposalData.companyEmail}</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
  `

  printWindow.document.write(htmlContent)
  printWindow.document.close()
}
