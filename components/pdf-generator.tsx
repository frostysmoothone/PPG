"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { FeeTable } from "./fee-table"
import { AdditionalFeesTable } from "./additional-fees-table"
import { SettlementSection } from "./settlement-section"
import { PDFPreview } from "./pdf-preview"
import { SaveProposalDialog } from "./save-proposal-dialog"
import { SavedProposalsDialog } from "./saved-proposals-dialog"
import { generatePDF } from "../utils/pdf-generator"
import { saveProposal } from "../utils/proposal-storage"
import type { ProposalData, CardFee, AdditionalFee, SavedProposal } from "../types/proposal"
import { FileText, Eye, EyeOff, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const defaultCardFees: CardFee[] = [
  { cardType: "VISA", enabled: true, percentageFee: 2.9, fixedFee: 0.3, currency: "USD" },
  { cardType: "MasterCard", enabled: true, percentageFee: 2.9, fixedFee: 0.3, currency: "USD" },
  { cardType: "Discover", enabled: false, percentageFee: 0, fixedFee: 0, currency: "USD" },
  { cardType: "Amex", enabled: false, percentageFee: 0, fixedFee: 0, currency: "USD" },
  { cardType: "MaestroCard", enabled: false, percentageFee: 0, fixedFee: 0, currency: "USD" },
  { cardType: "DinersClub", enabled: false, percentageFee: 0, fixedFee: 0, currency: "USD" },
  { cardType: "JCB", enabled: false, percentageFee: 0, fixedFee: 0, currency: "USD" },
  { cardType: "UnionPay", enabled: false, percentageFee: 0, fixedFee: 0, currency: "USD" },
]

const defaultAdditionalFees: AdditionalFee[] = [
  { feeType: "Setup Fee", enabled: false, percentageFee: 0, fixedFee: 0, currency: "USD" },
  { feeType: "Chargeback Fee", enabled: false, percentageFee: 0, fixedFee: 55, currency: "USD" },
  { feeType: "Dispute Fee", enabled: false, percentageFee: 0, fixedFee: 25, currency: "USD" },
  { feeType: "Declined Transaction Fee", enabled: false, percentageFee: 0, fixedFee: 0.55, currency: "USD" },
  { feeType: "Refunded Transaction Fee", enabled: false, percentageFee: 0, fixedFee: 15, currency: "USD" },
  { feeType: "Reserve", enabled: false, percentageFee: 10, fixedFee: 0, currency: "USD", days: 180 },
]

const getDefaultProposalData = (): ProposalData => ({
  companyLogo: "/linx-logo.png",
  companyName: "Transfer Global Inc.",
  companyAddress: "2135 De la Montagnes\nMontreal, QC, H3G 1Z8",
  companyPhone: "",
  companyEmail: "finance@linx.fi",
  clientName: "",
  clientCompany: "",
  clientAddress: "",
  clientEmail: "",
  proposalDate: new Date().toISOString().split("T")[0],
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  cardFees: defaultCardFees,
  additionalFees: defaultAdditionalFees,
  settlementTerms: {
    settlementPeriod: "T+2 Business Days",
    settlementFee: 0,
    settlementCurrency: "USD",
    minimumSettlement: 0,
  },
})

export default function PDFGenerator() {
  const [showPreview, setShowPreview] = useState(false)
  const [logoDataUrl, setLogoDataUrl] = useState<string>("")
  const [proposalData, setProposalData] = useState<ProposalData>(getDefaultProposalData())
  const [currentProposalId, setCurrentProposalId] = useState<string | null>(null)
  const [currentProposalName, setCurrentProposalName] = useState<string>("")
  const { toast } = useToast()

  // Convert default logo to data URL on component mount
  useEffect(() => {
    const convertLogoToDataUrl = async () => {
      try {
        const response = await fetch("/linx-logo.png")
        const blob = await response.blob()
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          setLogoDataUrl(dataUrl)
          setProposalData((prev) => ({ ...prev, companyLogo: dataUrl }))
        }
        reader.readAsDataURL(blob)
      } catch (error) {
        console.error("Failed to load default logo:", error)
      }
    }

    convertLogoToDataUrl()
  }, [])

  const handleCompanyInfoChange = (field: keyof ProposalData, value: string) => {
    setProposalData((prev) => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setLogoDataUrl(dataUrl)
        setProposalData((prev) => ({ ...prev, companyLogo: dataUrl }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProposal = (name: string) => {
    try {
      const saved = saveProposal(name, proposalData, currentProposalId || undefined)
      setCurrentProposalId(saved.id)
      setCurrentProposalName(saved.name)
      toast({
        title: "Proposal Saved",
        description: `"${name}" has been saved successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save proposal. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLoadProposal = (proposal: SavedProposal) => {
    setProposalData(proposal.data)
    setCurrentProposalId(proposal.id)
    setCurrentProposalName(proposal.name)
    if (proposal.data.companyLogo) {
      setLogoDataUrl(proposal.data.companyLogo)
    }
    toast({
      title: "Proposal Loaded",
      description: `"${proposal.name}" has been loaded.`,
    })
  }

  const handleNewProposal = () => {
    setProposalData(getDefaultProposalData())
    setCurrentProposalId(null)
    setCurrentProposalName("")
    // Reset logo to default
    if (logoDataUrl && logoDataUrl.startsWith("data:")) {
      setProposalData((prev) => ({ ...prev, companyLogo: logoDataUrl }))
    }
    toast({
      title: "New Proposal",
      description: "Started a new proposal.",
    })
  }

  const handleGeneratePDF = () => {
    generatePDF(proposalData)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Processing Proposal Generator</h1>
            <p className="text-gray-600">Create professional pricing proposals for payment processing services</p>
            {currentProposalName && (
              <p className="text-sm text-blue-600 mt-1">Currently editing: {currentProposalName}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleNewProposal} className="flex items-center gap-2 bg-transparent">
              <RotateCcw className="h-4 w-4" />
              New
            </Button>
            <SavedProposalsDialog onLoadProposal={handleLoadProposal} />
            <SaveProposalDialog
              proposalData={proposalData}
              onSave={handleSaveProposal}
              currentName={currentProposalName}
              isEditing={!!currentProposalId}
            />
            <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2">
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
            <Button onClick={handleGeneratePDF} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Generate PDF
            </Button>
          </div>
        </div>

        <div className={`grid gap-6 ${showPreview ? "lg:grid-cols-2" : "grid-cols-1"}`}>
          {/* Form Section */}
          <div className={showPreview ? "" : "max-w-4xl mx-auto w-full"}>
            <Tabs defaultValue="company" className="space-y-4">
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
                      {logoDataUrl && (
                        <div className="mt-2">
                          <img
                            src={logoDataUrl || "/placeholder.svg"}
                            alt="Company Logo"
                            className="h-12 object-contain"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                          id="companyName"
                          value={proposalData.companyName}
                          onChange={(e) => handleCompanyInfoChange("companyName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="companyPhone">Phone</Label>
                        <Input
                          id="companyPhone"
                          value={proposalData.companyPhone}
                          onChange={(e) => handleCompanyInfoChange("companyPhone", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="companyAddress">Address</Label>
                      <Textarea
                        id="companyAddress"
                        value={proposalData.companyAddress}
                        onChange={(e) => handleCompanyInfoChange("companyAddress", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyEmail">Email</Label>
                      <Input
                        id="companyEmail"
                        type="email"
                        value={proposalData.companyEmail}
                        onChange={(e) => handleCompanyInfoChange("companyEmail", e.target.value)}
                      />
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
                        <Label htmlFor="clientName">Client Name</Label>
                        <Input
                          id="clientName"
                          value={proposalData.clientName}
                          onChange={(e) => handleCompanyInfoChange("clientName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="clientCompany">Company</Label>
                        <Input
                          id="clientCompany"
                          value={proposalData.clientCompany}
                          onChange={(e) => handleCompanyInfoChange("clientCompany", e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="clientAddress">Address</Label>
                      <Textarea
                        id="clientAddress"
                        value={proposalData.clientAddress}
                        onChange={(e) => handleCompanyInfoChange("clientAddress", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="clientEmail">Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={proposalData.clientEmail}
                        onChange={(e) => handleCompanyInfoChange("clientEmail", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="proposalDate">Proposal Date</Label>
                        <Input
                          id="proposalDate"
                          type="date"
                          value={proposalData.proposalDate}
                          onChange={(e) => handleCompanyInfoChange("proposalDate", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="validUntil">Valid Until</Label>
                        <Input
                          id="validUntil"
                          type="date"
                          value={proposalData.validUntil}
                          onChange={(e) => handleCompanyInfoChange("validUntil", e.target.value)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fees" className="space-y-4">
                <FeeTable
                  cardFees={proposalData.cardFees}
                  onChange={(cardFees) => setProposalData((prev) => ({ ...prev, cardFees }))}
                />
                <AdditionalFeesTable
                  additionalFees={proposalData.additionalFees}
                  onChange={(additionalFees) => setProposalData((prev) => ({ ...prev, additionalFees }))}
                />
              </TabsContent>

              <TabsContent value="settlement" className="space-y-4">
                <SettlementSection
                  settlementTerms={proposalData.settlementTerms}
                  onChange={(settlementTerms) => setProposalData((prev) => ({ ...prev, settlementTerms }))}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="lg:sticky lg:top-4 lg:h-fit">
              <PDFPreview proposalData={proposalData} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
