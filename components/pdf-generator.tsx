"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProposalData, CardFee, AdditionalFee, SettlementTerms } from "../types/proposal"
import { FeeTable } from "./fee-table"
import { AdditionalFeesTable } from "./additional-fees-table"
import { SettlementSection } from "./settlement-section"
import { PDFPreview } from "./pdf-preview"
import { generatePDF } from "../utils/pdf-generator"
import { FileText, Download, Eye } from "lucide-react"

const initialCardFees: CardFee[] = [
  { cardType: "VISA", enabled: true, percentageFee: 2.9, fixedFee: 0.3, currency: "USD" },
  { cardType: "MasterCard", enabled: true, percentageFee: 2.9, fixedFee: 0.3, currency: "USD" },
  { cardType: "Discover", enabled: false, percentageFee: 0, fixedFee: 0, currency: "USD" },
  { cardType: "Amex", enabled: false, percentageFee: 0, fixedFee: 0, currency: "USD" },
  { cardType: "MaestroCard", enabled: false, percentageFee: 0, fixedFee: 0, currency: "USD" },
  { cardType: "DinersClub", enabled: false, percentageFee: 0, fixedFee: 0, currency: "USD" },
  { cardType: "JCB", enabled: false, percentageFee: 0, fixedFee: 0, currency: "USD" },
  { cardType: "UnionPay", enabled: false, percentageFee: 0, fixedFee: 0, currency: "USD" },
]

const initialAdditionalFees: AdditionalFee[] = [
  { feeType: "Setup Fee", enabled: false, percentageFee: 0, fixedFee: 99.0, currency: "USD" },
  { feeType: "Chargeback Fee", enabled: true, percentageFee: 0, fixedFee: 15.0, currency: "USD" },
  { feeType: "Dispute Fee", enabled: true, percentageFee: 0, fixedFee: 15.0, currency: "USD" },
  { feeType: "Declined Transaction Fee", enabled: false, percentageFee: 0, fixedFee: 0.1, currency: "USD" },
  { feeType: "Refunded Transaction Fee", enabled: false, percentageFee: 0, fixedFee: 0.25, currency: "USD" },
  { feeType: "Reserve", enabled: false, percentageFee: 10, fixedFee: 0, currency: "USD", days: 180 },
]

export default function PDFGenerator() {
  const [showPreview, setShowPreview] = useState(false)
  const [proposalData, setProposalData] = useState<ProposalData>({
    // Header/Provider Info
    companyName: "Transfer Global Inc.",
    companyAddress: "2135 De la Montagnes\nMontreal, QC, H3G 1Z8",
    companyPhone: "",
    companyEmail: "finance@linx.fi",
    companyLogo: "/linx-logo.png",

    // Recipient Info
    clientName: "",
    clientCompany: "",
    clientAddress: "",
    clientEmail: "",

    // Proposal Details
    proposalDate: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],

    // Fee Structure
    cardFees: initialCardFees,
    additionalFees: initialAdditionalFees,
    settlementTerms: {
      settlementPeriod: "T+2 Business Days",
      settlementFee: 0,
      settlementCurrency: "USD",
      minimumSettlement: 1.0,
    },
  })

  const handleInputChange = (field: keyof ProposalData, value: any) => {
    setProposalData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCardFeesChange = (cardFees: CardFee[]) => {
    setProposalData((prev) => ({ ...prev, cardFees }))
  }

  const handleAdditionalFeesChange = (additionalFees: AdditionalFee[]) => {
    setProposalData((prev) => ({ ...prev, additionalFees }))
  }

  const handleSettlementChange = (settlementTerms: SettlementTerms) => {
    setProposalData((prev) => ({ ...prev, settlementTerms }))
  }

  const handleGeneratePDF = () => {
    generatePDF(proposalData)
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProposalData((prev) => ({ ...prev, companyLogo: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Payment Processing Proposal Generator</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button onClick={handleGeneratePDF} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Generate PDF
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 ${showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
        <div className={`space-y-6 ${!showPreview ? "max-w-4xl mx-auto" : ""}`}>
          <Tabs defaultValue="company" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="client">Client</TabsTrigger>
              <TabsTrigger value="fees">Fees</TabsTrigger>
              <TabsTrigger value="settlement">Settlement</TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="logo">Company Logo</Label>
                    <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={proposalData.companyName}
                      onChange={(e) => handleInputChange("companyName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="companyAddress">Address</Label>
                    <Textarea
                      id="companyAddress"
                      value={proposalData.companyAddress}
                      onChange={(e) => handleInputChange("companyAddress", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyPhone">Phone</Label>
                      <Input
                        id="companyPhone"
                        value={proposalData.companyPhone}
                        onChange={(e) => handleInputChange("companyPhone", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyEmail">Email</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={proposalData.companyEmail}
                        onChange={(e) => handleInputChange("companyEmail", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="client" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="clientName">Contact Name</Label>
                      <Input
                        id="clientName"
                        value={proposalData.clientName}
                        onChange={(e) => handleInputChange("clientName", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientCompany">Company Name</Label>
                      <Input
                        id="clientCompany"
                        value={proposalData.clientCompany}
                        onChange={(e) => handleInputChange("clientCompany", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="clientAddress">Address</Label>
                    <Textarea
                      id="clientAddress"
                      value={proposalData.clientAddress}
                      onChange={(e) => handleInputChange("clientAddress", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={proposalData.clientEmail}
                      onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="proposalDate">Proposal Date</Label>
                      <Input
                        id="proposalDate"
                        type="date"
                        value={proposalData.proposalDate}
                        onChange={(e) => handleInputChange("proposalDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="validUntil">Valid Until</Label>
                      <Input
                        id="validUntil"
                        type="date"
                        value={proposalData.validUntil}
                        onChange={(e) => handleInputChange("validUntil", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees" className="space-y-4">
              <FeeTable cardFees={proposalData.cardFees} onChange={handleCardFeesChange} />
              <AdditionalFeesTable additionalFees={proposalData.additionalFees} onChange={handleAdditionalFeesChange} />
            </TabsContent>

            <TabsContent value="settlement">
              <SettlementSection settlementTerms={proposalData.settlementTerms} onChange={handleSettlementChange} />
            </TabsContent>
          </Tabs>
        </div>

        {showPreview && (
          <div className="lg:sticky lg:top-6">
            <PDFPreview proposalData={proposalData} />
          </div>
        )}
      </div>
    </div>
  )
}
