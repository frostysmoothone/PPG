import { supabase } from "../lib/supabase"
import type { DatabaseAppSetting } from "../lib/supabase"

export interface AppSetting {
  id: string
  key: string
  value: any
  description?: string
  createdAt: string
  updatedAt: string
}

// Convert database setting to app setting type
function dbSettingToSetting(dbSetting: DatabaseAppSetting): AppSetting {
  return {
    id: dbSetting.id,
    key: dbSetting.key,
    value: dbSetting.value,
    description: dbSetting.description,
    createdAt: dbSetting.created_at,
    updatedAt: dbSetting.updated_at,
  }
}

export async function getSettings(): Promise<AppSetting[]> {
  try {
    const { data: dbSettings, error } = await supabase
      .from("app_settings")
      .select("*")
      .order("key", { ascending: true })

    if (error) {
      console.error("Error fetching settings:", error)
      return []
    }

    return dbSettings.map(dbSettingToSetting)
  } catch (error) {
    console.error("Get settings error:", error)
    return []
  }
}

export async function getSetting(key: string): Promise<AppSetting | null> {
  try {
    const { data: dbSetting, error } = await supabase.from("app_settings").select("*").eq("key", key).single()

    if (error) {
      console.error("Error fetching setting:", error)
      return null
    }

    return dbSettingToSetting(dbSetting)
  } catch (error) {
    console.error("Get setting error:", error)
    return null
  }
}

export async function updateSetting(key: string, value: any, description?: string): Promise<AppSetting | null> {
  try {
    const { data: dbSetting, error } = await supabase
      .from("app_settings")
      .upsert({
        key,
        value,
        description,
      })
      .select()
      .single()

    if (error) {
      console.error("Error updating setting:", error)
      return null
    }

    return dbSettingToSetting(dbSetting)
  } catch (error) {
    console.error("Update setting error:", error)
    return null
  }
}

export async function deleteSetting(key: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("app_settings").delete().eq("key", key)

    if (error) {
      console.error("Error deleting setting:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Delete setting error:", error)
    return false
  }
}

// Helper functions for specific settings
export async function getCompanyDefaults() {
  const setting = await getSetting("company_defaults")
  return (
    setting?.value || {
      companyName: "Transfer Global Inc.",
      companyAddress: "2135 De la Montagnes\nMontreal, QC, H3G 1Z8",
      companyPhone: "",
      companyEmail: "finance@linx.fi",
      companyLogo: "/linx-logo.png",
    }
  )
}

export async function getDefaultCardFees() {
  const setting = await getSetting("default_card_fees")
  return setting?.value || []
}

export async function getDefaultAdditionalFees() {
  const setting = await getSetting("default_additional_fees")
  return setting?.value || []
}

export async function getDefaultSettlementTerms() {
  const setting = await getSetting("default_settlement_terms")
  return (
    setting?.value || {
      settlementPeriod: "T+2 Business Days",
      settlementFee: 0,
      settlementCurrency: "USD",
      minimumSettlement: 0,
    }
  )
}

export async function getPasswordPolicy() {
  const setting = await getSetting("password_policy")
  return (
    setting?.value || {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    }
  )
}

export async function getSessionTimeout() {
  const setting = await getSetting("session_timeout_minutes")
  return Number.parseInt(setting?.value || "480")
}
