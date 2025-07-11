import { supabase } from "../lib/supabase"
import type { SavedProposal } from "../types/proposal"
import type { DatabaseProposal } from "../lib/supabase"

// Convert database proposal to app proposal type
function dbProposalToProposal(dbProposal: DatabaseProposal): SavedProposal {
  return {
    id: dbProposal.id,
    name: dbProposal.name,
    data: dbProposal.data,
    createdAt: dbProposal.created_at,
    updatedAt: dbProposal.updated_at,
  }
}

export async function saveProposal(userId: string, name: string, data: any): Promise<SavedProposal | null> {
  try {
    const { data: dbProposal, error } = await supabase
      .from("proposals")
      .insert({
        user_id: userId,
        name,
        data,
      })
      .select()
      .single()

    if (error) {
      console.error("Error saving proposal:", error)
      return null
    }

    return dbProposalToProposal(dbProposal)
  } catch (error) {
    console.error("Save proposal error:", error)
    return null
  }
}

export async function getProposals(userId: string): Promise<SavedProposal[]> {
  try {
    const { data: dbProposals, error } = await supabase
      .from("proposals")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching proposals:", error)
      return []
    }

    return dbProposals.map(dbProposalToProposal)
  } catch (error) {
    console.error("Get proposals error:", error)
    return []
  }
}

export async function updateProposal(proposalId: string, name: string, data: any): Promise<SavedProposal | null> {
  try {
    const { data: dbProposal, error } = await supabase
      .from("proposals")
      .update({
        name,
        data,
      })
      .eq("id", proposalId)
      .select()
      .single()

    if (error) {
      console.error("Error updating proposal:", error)
      return null
    }

    return dbProposalToProposal(dbProposal)
  } catch (error) {
    console.error("Update proposal error:", error)
    return null
  }
}

export async function deleteProposal(proposalId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("proposals").delete().eq("id", proposalId)

    if (error) {
      console.error("Error deleting proposal:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Delete proposal error:", error)
    return false
  }
}

export async function getProposal(proposalId: string): Promise<SavedProposal | null> {
  try {
    const { data: dbProposal, error } = await supabase.from("proposals").select("*").eq("id", proposalId).single()

    if (error) {
      console.error("Error fetching proposal:", error)
      return null
    }

    return dbProposalToProposal(dbProposal)
  } catch (error) {
    console.error("Get proposal error:", error)
    return null
  }
}
