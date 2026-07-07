const { createClient } = require('@supabase/supabase-js');
const logger = require('../lib/logger');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Phase D2: Jira Issue Cache Service
 * Fetches Jira card details and upserts them into the local jira_issues table.
 * This enriches the AI context and powers the Sprint Analytics page.
 */
class JiraCache {
    /**
     * Extracts all Jira issue keys from a text string (e.g., "closes FURQAN-15")
     * Returns an array of unique keys like ["FURQAN-15", "SCRUM-3"]
     */
    extractIssueKeys(text) {
        const matches = text.match(/\b[A-Z]+-\d+\b/g) || [];
        return [...new Set(matches)];
    }

    /**
     * Extract all Jira issue keys from an array of context chunks
     */
    extractKeysFromChunks(chunks) {
        const allKeys = new Set();
        logger.info(`[DEBUG] Scanning ${chunks.length} chunks for Jira keys...`);
        for (const chunk of chunks) {
            const text = chunk.content || chunk.text || chunk.summary || JSON.stringify(chunk);
            // logger.info(`[DEBUG] Scanning text: "${text.substring(0, 100)}..."`);
            const keys = this.extractIssueKeys(text);
            if (keys.length > 0) {
                logger.info(`[DEBUG] Found keys in chunk: ${keys.join(', ')}`);
            }
            keys.forEach(k => allKeys.add(k));
        }
        return [...allKeys];
    }

    /**
     * Fetch issue details from Jira API and cache them in the local database.
     * Returns a map of { issueKey -> issueDetails } for the AI prompt.
     */
    async fetchAndCache({ jiraClient, userId, integrationId, issueKeys }) {
        if (!issueKeys || issueKeys.length === 0) return {};

        logger.info(`[D1] Fetching ${issueKeys.length} Jira card(s) for AI context: ${issueKeys.join(', ')}`);

        let issueMap = {};

        try {
            issueMap = await jiraClient.getIssuesBatch(issueKeys);
            logger.info(`[D1] Received ${Object.keys(issueMap).length} card(s) from Jira API.`);

            // D2: Upsert all fetched cards into the local jira_issues table
            for (const [key, card] of Object.entries(issueMap)) {
                const { error } = await supabase
                    .from('jira_issues')
                    .upsert({
                        user_id: userId,
                        integration_id: integrationId,
                        project_key: card.projectKey,
                        issue_key: key,
                        issue_type: card.issueType || 'Task',
                        summary: card.summary,
                        description: card.description,
                        status: card.status,
                        assignee_name: card.assigneeName,
                        assignee_account_id: card.assigneeAccountId,
                        reporter_name: card.reporterName,
                        priority: card.priority,
                        story_points: card.storyPoints,
                        sprint_name: card.sprintName,
                        sprint_jira_id: card.sprintJiraId,
                        labels: card.labels,
                        last_synced_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'user_id,issue_key' });

                if (error) {
                    logger.warn(`[D2] Cache upsert failed for ${key}: ${error.message}`);
                }
            }
            logger.info(`[D2] Cached ${Object.keys(issueMap).length} card(s) to jira_issues table.`);
        } catch (err) {
            logger.warn(`[D1] Jira API fetch failed: ${err.message}. Falling back to local cache.`);

            // Fallback: read from local cache if Jira API is down
            const { data: cached } = await supabase
                .from('jira_issues')
                .select('*')
                .eq('user_id', userId)
                .in('issue_key', issueKeys);

            for (const card of cached || []) {
                issueMap[card.issue_key] = {
                    summary: card.summary,
                    status: card.status,
                    description: card.description,
                    priority: card.priority,
                    assigneeName: card.assignee_name,
                };
            }
            logger.info(`[D2] Loaded ${Object.keys(issueMap).length} card(s) from local cache.`);
        }

        return issueMap;
    }

    /**
     * Bulk cache raw Jira issue objects into the local database.
     * Useful during full sprint syncs.
     * Includes a cleanup step to remove 'Ghost Cards' (deleted in Jira).
     */
    async bulkCache({ userId, integrationId, issues, projectKey }) {
        if (!issues || issues.length === 0) return;

        logger.info(`[D2] Bulk caching ${issues.length} issue(s) for user ${userId} in project ${projectKey}`);

        const currentKeys = issues.map(i => i.key);

        // 1. Upsert all current issues
        for (const issue of issues) {
            try {
                const f = issue.fields || {};
                
                // Extract description text
                let descriptionText = '';
                if (f.description) {
                    if (typeof f.description === 'string') {
                        descriptionText = f.description;
                    } else if (f.description.content) {
                        descriptionText = f.description.content
                            .flatMap((block) => block.content || [])
                            .filter((n) => n.type === 'text')
                            .map((n) => n.text)
                            .join(' ');
                    }
                }

                await supabase
                    .from('jira_issues')
                    .upsert({
                        user_id: userId,
                        integration_id: integrationId,
                        project_key: issue.key.split('-')[0],
                        issue_key: issue.key,
                        issue_type: f.issuetype?.name || 'Task',
                        summary: f.summary,
                        description: descriptionText,
                        status: f.status?.name || 'To Do',
                        assignee_name: f.assignee?.displayName || null,
                        assignee_account_id: f.assignee?.accountId || null,
                        reporter_name: f.reporter?.displayName || null,
                        priority: f.priority?.name || null,
                        story_points: f.customfield_10016 || f.story_points || null,
                        sprint_name: f.customfield_10020?.[0]?.name || null,
                        sprint_jira_id: f.customfield_10020?.[0]?.id || null,
                        labels: f.labels || [],
                        last_synced_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }, { onConflict: 'user_id,issue_key' });
            } catch (err) {
                logger.warn(`[D2] Bulk cache failed for ${issue.key}: ${err.message}`);
            }
        }

        // 2. Cleanup: Delete cards that exist in our DB but NOT in the fresh Jira list
        if (projectKey && currentKeys.length > 0) {
            logger.info(`[D2] Cleaning up ghost cards for project ${projectKey}...`);
            const { error: deleteError, count } = await supabase
                .from('jira_issues')
                .delete({ count: 'exact' })
                .eq('user_id', userId)
                .eq('project_key', projectKey)
                .not('issue_key', 'in', `(${currentKeys.join(',')})`);

            if (deleteError) {
                logger.error(`[D2] Ghost card cleanup failed: ${deleteError.message}`);
            } else if (count && count > 0) {
                logger.info(`[D2] Successfully purged ${count} ghost card(s) from project ${projectKey}.`);
            }
        }

        logger.info(`[D2] Bulk cache completed for ${issues.length} issue(s).`);
    }
}

module.exports = new JiraCache();
