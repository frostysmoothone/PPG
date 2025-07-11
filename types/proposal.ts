export interface CardFee {
  cardType: string
  enabled: boolean
  percentageFee: number
  fixedFee: number
  currency: string
}

export interface AdditionalFee {
  feeType: string
  enabled: boolean
  percentageFee: number
  fixedFee: number
  currency: string
  days?: number // For reserve fees
  isCustom?: boolean // To identify custom fees
}

export interface SettlementTerms {
  settlementPeriod: string
  settlementFee: number
  settlementCurrency: string
  minimumSettlement: number
}

export interface ProposalData {
  // Header/Provider Info
  companyLogo?: string
  companyName: string
  companyAddress: string
  companyPhone: string
  companyEmail: string

  // Recipient Info
  clientName: string
  clientCompany: string
  clientAddress: string
  clientEmail: string

  // Proposal Details
  proposalDate: string
  validUntil: string

  // Fee Structure
  cardFees: CardFee[]
  additionalFees: AdditionalFee[]
  settlementTerms: SettlementTerms
}

export interface SavedProposal {
  id: string
  name: string
  data: ProposalData
  createdAt: string
  updatedAt: string
}
