"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ProposalData } from "../types/proposal"

interface PDFPreviewProps {
  proposalData: ProposalData
}

export function PDFPreview({ proposalData }: PDFPreviewProps) {
  const enabledCardFees = proposalData.cardFees.filter((fee) => fee.enabled)
  const enabledAdditionalFees = proposalData.additionalFees.filter((fee) => fee.enabled)

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>PDF Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white p-6 border rounded-lg text-sm space-y-6 max-h-[800px] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              {proposalData.companyLogo && (
                <img src={proposalData.companyLogo || "/placeholder.svg"} alt="Company Logo" className="h-12 mb-2" />
              )}
              <h1 className="text-xl font-bold">{proposalData.companyName}</h1>
              <div className="text-gray-600 whitespace-pre-line">{proposalData.companyAddress}</div>
              <div className="text-gray-600">
                {proposalData.companyPhone} | {proposalData.companyEmail}
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-semibold">Payment Processing Proposal</h2>
              <div className="text-gray-600">
                <div>Date: {proposalData.proposalDate}</div>
                <div>Valid Until: {proposalData.validUntil}</div>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div>
            <h3 className="font-semibold mb-2">Prepared For:</h3>
            <div className="text-gray-700">
              <div className="font-medium">{proposalData.clientName}</div>
              <div>{proposalData.clientCompany}</div>
              <div className="whitespace-pre-line">{proposalData.clientAddress}</div>
              <div>{proposalData.clientEmail}</div>
            </div>
          </div>

          {/* Schedule A - Card Fees */}
          <div>
            <h3 className="font-semibold mb-3">Schedule A - Card Processing Fees</h3>
            <table className="w-full border-collapse border border-gray-300 text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 p-2 text-left">Card Type</th>
                  <th className="border border-gray-300 p-2 text-left">Rate</th>
                  <th className="border border-gray-300 p-2 text-left">Fixed Fee</th>
                  <th className="border border-gray-300 p-2 text-left">Currency</th>
                </tr>
              </thead>
              <tbody>
                {enabledCardFees.map((fee) => (
                  <tr key={fee.cardType}>
                    <td className="border border-gray-300 p-2">{fee.cardType}</td>
                    <td className="border border-gray-300 p-2">{fee.percentageFee}%</td>
                    <td className="border border-gray-300 p-2">{fee.fixedFee.toFixed(2)}</td>
                    <td className="border border-gray-300 p-2">{fee.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Additional Fees */}
          {enabledAdditionalFees.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Additional Fees</h3>
              <table className="w-full border-collapse border border-gray-300 text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Fee Type</th>
                    <th className="border border-gray-300 p-2 text-left">Rate</th>
                    <th className="border border-gray-300 p-2 text-left">Fixed Fee</th>
                    <th className="border border-gray-300 p-2 text-left">Currency</th>
                  </tr>
                </thead>
                <tbody>
                  {enabledAdditionalFees.map((fee) => (
                    <tr key={fee.feeType}>
                      <td className="border border-gray-300 p-2">{fee.feeType}</td>
                      <td className="border border-gray-300 p-2">{fee.percentageFee}%</td>
                      <td className="border border-gray-300 p-2">
                        {fee.feeType === "Reserve" ? `${fee.days} days` : fee.fixedFee.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 p-2">{fee.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Settlement Terms */}
          <div>
            <h3 className="font-semibold mb-3">Settlement Terms</h3>
            <div className="bg-gray-50 p-3 rounded">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-medium">Settlement Period:</span>{" "}
                  {proposalData.settlementTerms.settlementPeriod}
                </div>
                <div>
                  <span className="font-medium">Settlement Fee:</span> {proposalData.settlementTerms.settlementFee}{" "}
                  {proposalData.settlementTerms.settlementCurrency}
                </div>
                <div>
                  <span className="font-medium">Minimum Settlement:</span>{" "}
                  {proposalData.settlementTerms.minimumSettlement} {proposalData.settlementTerms.settlementCurrency}
                </div>
                <div>
                  <span className="font-medium">Settlement Currency:</span>{" "}
                  {proposalData.settlementTerms.settlementCurrency}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-4 text-xs text-gray-600">
            <p>This proposal is valid until {proposalData.validUntil}. Terms and conditions apply.</p>
            <p className="mt-2">
              For questions regarding this proposal, please contact us at {proposalData.companyEmail}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
