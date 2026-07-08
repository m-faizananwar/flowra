import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import logger from './logger';

// Global shared map for pending refreshes to prevent race conditions across instances
const refreshPromises = new Map();

class JiraAPI {
  userId: any;
  integrationId: any;
  credentials: any;
  cloudId: any;
  supabase: any;
  retryCount: any;
  lastRefreshTime: any;
    constructor(integration) {
        this.userId = integration.user_id;
        this.integrationId = integration.id;
        this.credentials = integration.credentials;
        this.cloudId = this.credentials.cloud_id;
        
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        this.retryCount = 0;
    }

    /**
     * Get Axios instance with valid token
     */
    async getClient() {
        if (!this.credentials?.access_token) {
            throw new Error("Jira access token missing. Please reconnect Jira.");
        }
        return axios.create({
            baseURL: `https://api.atlassian.com/ex/jira/${this.cloudId}/rest/api/3`,
            headers: {
                'Authorization': `Bearer ${this.credentials.access_token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Refresh the Access Token using the Refresh Token
     */
    /**
     * Refresh the Access Token using the Refresh Token
     * Uses a global mutex to prevent multiple concurrent refreshes for the same integration.
     */
    /**
     * Refresh the Access Token using the Refresh Token
     * Uses a global mutex and database check to prevent redundant refreshes.
     */
    async refreshAccessToken() {

        // 1. Check cooldown (Throttle refreshes to every 10 seconds)
        if (this.lastRefreshTime && (Date.now() - this.lastRefreshTime < 10000)) {
            logger.info(`[JiraAPI] Shared Refresh: Cooldown active for ${this.integrationId}. Using current token.`);
            return this.credentials.access_token;
        }

        // 2. Check if a refresh is already in progress in this process
        if (refreshPromises.has(this.integrationId)) {
            logger.info(`[JiraAPI] Shared Refresh: Awaiting existing refresh for ${this.integrationId}...`);
            const token = await refreshPromises.get(this.integrationId);
            this.credentials.access_token = token;
            return token;
        }

        // 2. Create the refresh promise
        const refreshPromise = (async () => {
            try {
                // A. FIRST: Fetch the latest integration from DB to see if someone else refreshed it already
                // (This handles the race condition between frontend and backend)
                const { data: latest, error: fetchErr } = await this.supabase
                    .from('integrations')
                    .select('credentials')
                    .eq('id', this.integrationId)
                    .single();

                if (!fetchErr && latest?.credentials) {
                    const dbToken = latest.credentials.access_token;
                    // If the token in DB is different from what we currently have, use it!
                    if (dbToken && dbToken !== this.credentials.access_token) {
                        logger.info(`[JiraAPI] Shared Refresh: Detected newer token in DB for ${this.integrationId}. Skipping OAuth refresh.`);
                        this.credentials.access_token = dbToken;
                        this.credentials.refresh_token = latest.credentials.refresh_token;
                        return dbToken;
                    }
                }

                // B. SECOND: If DB token is the same as ours, it's truly expired. Do the OAuth refresh.
                logger.info(`[JiraAPI] Shared Refresh: Starting OAuth refresh for integration ${this.integrationId}...`);
                
                const response = await axios.post('https://auth.atlassian.com/oauth/token', {
                    grant_type: 'refresh_token',
                    client_id: process.env.JIRA_CLIENT_ID,
                    client_secret: process.env.JIRA_CLIENT_SECRET,
                    refresh_token: this.credentials.refresh_token,
                });

                const { access_token, refresh_token } = response.data;
                
                // Update local instance
                this.credentials.access_token = access_token;
                this.credentials.refresh_token = refresh_token;

                // Persist to Database
                const { error } = await this.supabase
                    .from('integrations')
                    .update({ 
                        credentials: { 
                            ...this.credentials, 
                            access_token, 
                            refresh_token,
                            updated_at: new Date().toISOString()
                        }
                    })
                    .eq('id', this.integrationId);

                if (error) {
                    logger.error(`[JiraAPI] Database update failed after refresh: ${error.message}`);
                    throw error;
                }
                
                logger.info(`[JiraAPI] Shared Refresh: Completed for integration ${this.integrationId}.`);
                return access_token;
            } catch (error) {
                const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
                logger.error(`[JiraAPI] Shared Refresh: FAILED for integration ${this.integrationId}: ${errorMsg}`);
                throw error;
            } finally {
                // Clean up the global map
                refreshPromises.delete(this.integrationId);
                // Set cooldown
                this.lastRefreshTime = Date.now();
            }
        })();

        // 3. Store in global map and return it
        refreshPromises.set(this.integrationId, refreshPromise);
        return refreshPromise;
    }

    /**
     * Get available transitions for an issue
     */
    async getTransitions(issueKey) {
        let client = await this.getClient();
        try {
            const res = await client.get(`/issue/${issueKey}/transitions`);
            return res.data.transitions || [];
        } catch (error) {
            if (error.response?.status === 401) {
                await this.refreshAccessToken();
                client = await this.getClient(); // Get new client with fresh token
                const res = await client.get(`/issue/${issueKey}/transitions`);
                return res.data.transitions || [];
            }
            throw error;
        }
    }

    /**
     * Fetch issue details
     */
    async getIssue(issueKey) {
        const client = await this.getClient();
        try {
            const res = await client.get(`/issue/${issueKey}`);
            return res.data;
        } catch (error) {
            if (error.response?.status === 401) {
                await this.refreshAccessToken();
                return this.getIssue(issueKey); // Retry
            }
            throw error;
        }
    }

    /**
     * Move card status
     */
    async transitionIssue(issueKey, transitionId) {
        const client = await this.getClient();
        try {
            await client.post(`/issue/${issueKey}/transitions`, {
                transition: { id: transitionId }
            });
            return true;
        } catch (error) {
            if (error.response?.status === 401) {
                await this.refreshAccessToken();
                return this.transitionIssue(issueKey, transitionId);
            }
            throw error;
        }
    }

    /**
     * Smart transition: Find ID for a status name and move it
     */
    async transitionToStatus(issueKey, statusName) {
        const transitions = await this.getTransitions(issueKey);
        const target = transitions.find(t => 
            t.name.toLowerCase() === statusName.toLowerCase() || 
            t.to.name.toLowerCase() === statusName.toLowerCase()
        );

        if (!target) {
            throw new Error(`Transition to status "${statusName}" not found for ${issueKey}. Available: ${transitions.map(t => t.name).join(', ')}`);
        }

        return this.transitionIssue(issueKey, target.id);
    }

    /**
     * Add comment to issue
     */
    async addComment(issueKey, commentText, retry = true) {
        const client = await this.getClient();
        try {
            await client.post(`/issue/${issueKey}/comment`, {
                body: {
                    type: "doc",
                    version: 1,
                    content: [
                        {
                            type: "paragraph",
                            content: [{ type: "text", text: commentText }]
                        }
                    ]
                }
            });
            return true;
        } catch (error) {
            if (error.response?.status === 401 && retry) {
                await this.refreshAccessToken();
                return this.addComment(issueKey, commentText, false);
            }
            throw error;
        }
    }

    /**
     * Internal helper to get an Axios client for Jira Agile API
     */
    async getAgileClient() {
        if (!this.credentials) throw new Error("Jira credentials not found");
        const cloudId = this.cloudId?.trim();
        const url = `https://api.atlassian.com/ex/jira/${cloudId}/rest/agile/1.0`;
        
        const token = this.credentials.access_token;
        const tokenHint = token ? `${token.substring(0, 5)}...${token.substring(token.length - 5)}` : 'null';
        logger.info(`[JiraAPI] Agile Client init with token hint: ${tokenHint}`);

        return axios.create({
            baseURL: url,
            timeout: 15000,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'User-Agent': 'Flowra-Engine/1.0.0'
            }
        });
    }

    /**
     * Fetch multiple issues in one call (for AI context enrichment)
     * Returns a map of { issueKey -> { summary, status, description, priority, assignee } }
     */
    async getIssuesBatch(issueKeys, retry = true) {
        if (!issueKeys || issueKeys.length === 0) return {};
        const client = await this.getClient();
        try {
            const quotedKeys = issueKeys.map(k => `"${k}"`).join(',');
            const jql = `issueKey in (${quotedKeys})`;
            
            const res = await client.get('/search/jql', {
                params: {
                    jql,
                    fields: 'summary,status,description,priority,assignee,reporter,customfield_10016,customfield_10020,labels',
                    maxResults: 50,
                }
            });
            const issueMap = {};
            for (const issue of res.data.issues || []) {
                const f = issue.fields;
                let descriptionText = '';
                try {
                    if (f.description) {
                        if (typeof f.description === 'string') {
                            descriptionText = f.description;
                        } else if (f.description.content) {
                            descriptionText = f.description.content
                                .flatMap(block => block.content || [])
                                .filter(n => n.type === 'text')
                                .map(n => n.text)
                                .join(' ');
                        }
                    }
                } catch (_) {}

                issueMap[issue.key] = {
                    issueKey: issue.key,
                    projectKey: issue.key.split('-')[0],
                    summary: f.summary || '',
                    status: f.status?.name || '',
                    description: descriptionText,
                    priority: f.priority?.name || '',
                    assigneeName: f.assignee?.displayName || '',
                    assigneeAccountId: f.assignee?.accountId || '',
                    reporterName: f.reporter?.displayName || '',
                    storyPoints: f.customfield_10016 || null,
                    sprintName: f.customfield_10020?.[0]?.name || '',
                    sprintJiraId: f.customfield_10020?.[0]?.id || null,
                    labels: f.labels || [],
                };
            }
            return issueMap;
        } catch (error) {
            if (error.response?.status === 401 && retry) {
                await this.refreshAccessToken();
                return this.getIssuesBatch(issueKeys, false);
            }
            throw error;
        }
    }

    /**
     * Get all boards accessible by this integration
     */
    async getBoards(retry = true) {
        if (!this.cloudId) throw new Error("Jira Cloud ID missing.");
        const client = await this.getAgileClient();
        try {
            logger.info(`[JiraAPI] Fetching boards for Site: ${this.credentials.name || 'Unknown'} (ID: ${this.cloudId})...`);
            const res = await client.get('/board', { params: { maxResults: 50 } });
            return res.data.values || [];
        } catch (error) {
            if (error.response?.status === 401 && retry) {
                logger.warn(`[JiraAPI] 401 Unauthorized for Agile API. Refreshing token and retrying...`);
                await this.refreshAccessToken();
                return this.getBoards(false);
            }
            
            if (error.response) {
                logger.error(`[JiraAPI] Agile API Error: Status ${error.response.status}. Data: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }

    /**
     * Get the active sprint for a given board
     */
    async getActiveSprint(boardId, retry = true) {
        const client = await this.getAgileClient();
        try {
            const res = await client.get(`/board/${boardId}/sprint`, { params: { state: 'active' } });
            const sprints = res.data.values || [];
            return sprints[0] || null;
        } catch (error) {
            if (error.response?.status === 401 && retry) {
                await this.refreshAccessToken();
                return this.getActiveSprint(boardId, false);
            }
            throw error;
        }
    }

    /**
     * Get all issues in a sprint (for metrics calculation)
     */
    /**
     * Get all issues in a sprint using JQL (more stable than Agile endpoint)
     */
    async getSprintIssues(boardId, sprintId, projectKey = null, retry = true) {
        const client = await this.getClient();
        try {
            // ULTIMATE FIX: Pull EVERYTHING in the project to ensure no cards are missing
            // We use the projectKey if available, otherwise fallback to the sprint query
            const jql = projectKey 
                ? `project = "${projectKey}" ORDER BY updated DESC`
                : `sprint = ${sprintId}`;

            logger.info(`[JiraAPI] Fetching PROJECT issues via JQL: ${jql}`);
            const res = await client.get('/search/jql', {
                params: {
                    jql,
                    fields: 'summary,status,description,priority,assignee,customfield_10016,customfield_10020',
                    maxResults: 100,
                }
            });
            return res.data.issues || [];
        } catch (error) {
            if (error.response?.status === 401 && retry) {
                logger.info(`[JiraAPI] 401 on JQL project search, refreshing and retrying...`);
                await this.refreshAccessToken();
                await new Promise(resolve => setTimeout(resolve, 1000));
                return this.getSprintIssues(boardId, sprintId, projectKey, false);
            }
            throw error;
        }
    }
}

export default JiraAPI;
