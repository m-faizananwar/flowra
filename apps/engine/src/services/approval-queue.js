const { createClient } = require('@supabase/supabase-js');
const jiraSync = require('./jira-sync');
const winston = require('winston');

class ApprovalQueue {
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
    }

    /**
     * Create a new suggestion based on a detected signal
     */
    async suggestMovement(data) {
        const { 
            user_id, 
            integration_id, 
            issue_key, 
            target_status, 
            transition_id, 
            reason, 
            evidence_url 
        } = data;

        const { data: suggestion, error } = await this.supabase
            .from('approval_queue')
            .insert({
                user_id,
                integration_id,
                issue_key,
                target_status,
                transition_id,
                reason,
                evidence_url,
                status: 'pending',
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return suggestion;
    }

    /**
     * Approve a suggestion and execute the Jira move
     */
    async approve(suggestionId) {
        const { data: suggestion } = await this.supabase
            .from('approval_queue')
            .select('*')
            .eq('id', suggestionId)
            .single();

        if (!suggestion) throw new Error('Suggestion not found');
        if (suggestion.status !== 'pending') throw new Error('Suggestion already processed');

        try {
            // Execute the actual Jira move
            await jiraSync.executeMovement(
                suggestion.integration_id,
                suggestion.issue_key,
                suggestion.transition_id,
                `Flowra Auto-Move: Approved by human. Reason: ${suggestion.reason}`
            );

            // Update status in DB
            await this.supabase
                .from('approval_queue')
                .update({ 
                    status: 'approved', 
                    processed_at: new Date().toISOString() 
                })
                .eq('id', suggestionId);

            return { success: true };
        } catch (error) {
            console.error('Approval execution failed:', error);
            throw error;
        }
    }

    /**
     * Reject a suggestion
     */
    async reject(suggestionId, reason) {
        await this.supabase
            .from('approval_queue')
            .update({ 
                status: 'rejected', 
                rejection_reason: reason,
                processed_at: new Date().toISOString() 
            })
            .eq('id', suggestionId);
        
        return { success: true };
    }
}

module.exports = new ApprovalQueue();
