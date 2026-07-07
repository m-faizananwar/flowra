const { createClient } = require('@supabase/supabase-js');
const JiraAPI = require('./lib/jira-api');
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.Console()]
});

class JiraSyncService {
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        this.instances = new Map(); // Cache of JiraAPI instances per user
    }

    /**
     * Get or create a JiraAPI instance for a specific integration record
     */
    async getApi(integration) {
        if (!this.instances.has(integration.id)) {
            this.instances.set(integration.id, new JiraAPI(integration));
        }
        return this.instances.get(integration.id);
    }

    /**
     * Fetch all active Jira integrations and sync them
     */
    async syncAll() {
        logger.info('Starting Global Jira Sync...');
        const { data: integrations, error } = await this.supabase
            .from('integrations')
            .select('*')
            .eq('service_name', 'jira')
            .eq('is_active', true);

        if (error) {
            logger.error('Failed to fetch Jira integrations:', error);
            return;
        }

        for (const integration of integrations) {
            try {
                await this.syncUserJira(integration);
            } catch (err) {
                logger.error(`Sync failed for integration ${integration.id}:`, err);
            }
        }
    }

    /**
     * Sync specific user's Jira issues to local tasks table
     */
    async syncUserJira(integration) {
        const api = await this.getApi(integration);
        logger.info(`Syncing Jira for User ${integration.user_id}...`);

        // Example: Fetch issues updated in the last 24 hours
        // JQL: project = "PROJ" AND updated > -24h
        const jql = `project = "${integration.credentials.project_key || ''}" ORDER BY updated DESC`;
        
        // Note: We'd implement search in jira-api.js next if needed
        // For now, let's assume we are just preparing for the signal-driven updates
    }

    /**
     * Move a card based on an approved signal
     */
    async executeMovement(integrationId, issueKey, targetStatus, comment) {
        const { data: integration } = await this.supabase
            .from('integrations')
            .select('*')
            .eq('id', integrationId)
            .single();

        if (!integration) throw new Error('Integration not found');

        const api = await this.getApi(integration);
        
        logger.info(`Executing Jira Transition: ${issueKey} -> ${targetStatus}`);
        
        await api.transitionToStatus(issueKey, targetStatus);
        
        if (comment) {
            await api.addComment(issueKey, comment);
        }

        return true;
    }
}

module.exports = new JiraSyncService();
