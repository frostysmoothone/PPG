import { supabase } from '../lib/supabase'
import type { ProposalData, CardFee, AdditionalFee } from '../types/proposal'

export interface SystemSettings {
  id: string
  company_name: string
  company_address: string
  company_phone: string
  company_email: string
  company_logo: string
  default_card_fees: CardFee[]
  default_additional_fees: AdditionalFee[]
  default_settlement_terms: {
    settlementPeriod: string
    settlementFee: number
    settlementCurrency: string
    minimumSettlement: number
  }
  created_at: string
  updated_at: string
}

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

export function getDefaultProposalData(): ProposalData {
  return {
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
  }
}

export async function getSystemSettings(): Promise<SystemSettings | null> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .single()

    if (error) {
      console.error('Error fetching system settings:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getSystemSettings:', error)
    return null
  }
}

export async function updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings | null> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error updating system settings:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updateSystemSettings:', error)
    return null
  }
}

export async function initializeSystemSettings(): Promise<void> {
  try {
    // Check if system settings exist
    const { data: existing, error } = await supabase
      .from('system_settings')
      .select('id')
      .single()

    if (existing) {
      console.log('System settings already exist')
      return
    }

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking system settings:', error)
      return
    }

    // Create default system settings
    const { error: insertError } = await supabase
      .from('system_settings')
      .insert([{
        company_name: "Transfer Global Inc.",
        company_address: "2135 De la Montagnes\nMontreal, QC, H3G 1Z8",
        company_phone: "",
        company_email: "finance@linx.fi",
        company_logo: "/linx-logo.png",
        default_card_fees: defaultCardFees,
        default_additional_fees: defaultAdditionalFees,
        default_settlement_terms: {
          settlementPeriod: "T+2 Business Days",
          settlementFee: 0,
          settlementCurrency: "USD",
          minimumSettlement: 0,
        }
      }])

    if (insertError) {
      console.error('Error creating default system settings:', insertError)
    } else {
      console.log('Default system settings created successfully')
    }
  } catch (error) {
    console.error('Error initializing system settings:', error)
  }
}
