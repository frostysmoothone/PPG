"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ProposalData } from "../types/proposal"

interface PDFPreviewProps {
  proposalData: ProposalData
}

export function PDFPreview({ proposalData }: PDFPreviewProps) {
  if (!proposalData) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            Loading preview...
          </div>
        </CardContent>
      </Card>
    )
  }

  const enabledCardFees = proposalData.cardFees?.filter(fee => fee.enabled) || []
  const enabledAdditionalFees = proposalData.additionalFees?.filter(fee => fee.enabled) || []

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Proposal Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            {proposalData.companyLogo && (
              <img 
                src={proposalData.companyLogo || "/placeholder.svg"} 
                alt="Company Logo" 
                className="h-16 object-contain mb-2"
              />
            )}
            <h1 className="text-2xl font-bold">{proposalData.companyName || "Company Name"}</h1>
            <div className="text-sm text-gray-600 whitespace-pre-line">
              {proposalData.companyAddress || "Company Address"}
            </div>
            {proposalData.companyPhone && (
              <div className="text-sm text-gray-600">Phone: {proposalData.companyPhone}</div>
            )}
            {proposalData.companyEmail && (
              <div className="text-sm text-gray-600">Email: {proposalData.companyEmail}</div>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-xl font-semibold">Payment Processing Proposal</h2>
            <div className="text-sm text-gray-600 mt-2">
              <div>Date: {proposalData.proposalDate || "Not set"}</div>
              <div>Valid Until: {proposalData.validUntil || "Not set"}</div>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-2">Prepared For:</h3>
          <div className="text-sm">
            <div className="font-medium">{proposalData.clientName || "Client Name"}</div>
            {proposalData.clientCompany && (
              <div>{proposalData.clientCompany}</div>
            )}
            <div className="whitespace-pre-line text-gray-600">
              {proposalData.clientAddress || "Client Address"}
            </div>
            {proposalData.clientEmail && (
              <div className="text-gray-600">Email: {proposalData.clientEmail}</div>
            )}
          </div>
        </div>

        {/* Card Processing Fees */}
        {enabledCardFees.length > 0 && (
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Card Processing Fees</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Card Type</th>
                    <th className="text-right py-2">Percentage Fee</th>
                    <th className="text-right py-2">Fixed Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {enabledCardFees.map((fee, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">
                        <Badge variant="outline">{fee.cardType}</Badge>
                      </td>
                      <td className="text-right py-2">{fee.percentageFee}%</td>
                      <td className="text-right py-2">
                        {fee.currency} {fee.fixedFee.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Additional Fees */}
        {enabledAdditionalFees.length > 0 && (
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold mb-3">Additional Fees</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Fee Type</th>
                    <th className="text-right py-2">Percentage Fee</th>
                    <th className="text-right py-2">Fixed Fee</th>
                    <th className="text-right py-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {enabledAdditionalFees.map((fee, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">
                        <Badge variant="secondary">{fee.feeType}</Badge>
                      </td>
                      <td className="text-right py-2">
                        {fee.percentageFee > 0 ? `${fee.percentageFee}%` : '-'}
                      </td>
                      <td className="text-right py-2">
                        {fee.fixedFee > 0 ? `${fee.currency} ${fee.fixedFee.toFixed(2)}` : '-'}
                      </td>
                      <td className="text-right py-2">
                        {fee.days ? `${fee.days} days` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settlement Terms */}
        {proposalData.settlementTerms && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Settlement Terms</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Settlement Period:</span>
                <div className="text-gray-600">
                  {proposalData.settlementTerms.settlementPeriod || "Not specified"}
                </div>
              </div>
              <div>
                <span className="font-medium">Settlement Fee:</span>
                <div className="text-gray-600">
                  {proposalData.settlementTerms.settlementCurrency} {proposalData.settlementTerms.settlementFee?.toFixed(2) || "0.00"}
                </div>
              </div>
              <div>
                <span className="font-medium">Settlement Currency:</span>
                <div className="text-gray-600">
                  {proposalData.settlementTerms.settlementCurrency || "USD"}
                </div>
              </div>
              <div>
                <span className="font-medium">Minimum Settlement:</span>
                <div className="text-gray-600">
                  {proposalData.settlementTerms.settlementCurrency} {proposalData.settlementTerms.minimumSettlement?.toFixed(2) || "0.00"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t">
          This proposal is valid until {proposalData.validUntil || "the specified date"}.
          Terms and conditions apply.
        </div>
      </CardContent>
    </Card>
  )
}
