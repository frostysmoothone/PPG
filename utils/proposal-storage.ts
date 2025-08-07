import { supabase } from '../lib/supabase'
import { getCurrentUser } from './auth'
import type { ProposalData } from '../types/proposal'

export interface SavedProposal {
  id: string
  name: string
  data: ProposalData
  user_id: string
  created_at: string
  updated_at: string
}

export async function getSavedProposals(): Promise<SavedProposal[]> {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching proposals:', error)
      throw new Error(`Failed to fetch proposals: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error in getSavedProposals:', error)
    throw error
  }
}

export async function saveProposal(
  name: string, 
  data: ProposalData, 
  id?: string
): Promise<SavedProposal> {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    if (id) {
      // Update existing proposal
      const { data: updated, error } = await supabase
        .from('proposals')
        .update({
          name,
          data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', currentUser.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating proposal:', error)
        throw new Error(`Failed to update proposal: ${error.message}`)
      }

      return updated
    } else {
      // Create new proposal
      const { data: created, error } = await supabase
        .from('proposals')
        .insert([{
          name,
          data,
          user_id: currentUser.id
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating proposal:', error)
        throw new Error(`Failed to save proposal: ${error.message}`)
      }

      return created
    }
  } catch (error) {
    console.error('Error in saveProposal:', error)
    throw error
  }
}

export async function updateProposal(id: string, updates: Partial<SavedProposal>): Promise<SavedProposal> {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('proposals')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', currentUser.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating proposal:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in updateProposal:', error)
    throw error
  }
}

export async function deleteProposal(id: string): Promise<void> {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id)
      .eq('user_id', currentUser.id)

    if (error) {
      console.error('Error deleting proposal:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in deleteProposal:', error)
    throw error
  }
}

export async function loadProposal(id: string): Promise<SavedProposal> {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .eq('user_id', currentUser.id)
      .single()

    if (error) {
      console.error('Error loading proposal:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in loadProposal:', error)
    throw error
  }
}
