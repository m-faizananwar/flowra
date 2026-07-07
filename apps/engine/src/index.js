require('dotenv').config();
const express = require('express');
const { Octokit } = require('octokit');
const { createAppAuth } = require('@octokit/auth-app');
const logger = require('./services/lib/logger');
const integrationsSync = require('./services/integrations-sync');
const botManager = require('./services/bots');
const githubSync = require('./services/github-sync');
const analysisRunner = require('./services/intelligence/analysis-runner');
const intelligenceScheduler = require('./services/intelligence/scheduler-service');
const approvalWatcher = require('./services/intelligence/approval-watcher');
const JiraAPI = require('./services/lib/jira-api');
const supabase = require('./services/lib/supabase');

const app = express();
const PORT = process.env.PORT || 3005;

/**
 * Flowra Engine Synchronization Service
 */
async function bootstrap() {
    try {
        logger.info('==========================================');
        logger.info('   FLOWRA ENGINE CONNECTIVITY SERVICE    ');
        logger.info('==========================================');

        // Middleware for GitHub Webhooks
        app.use(express.json());

        app.post('/api/github/sync', async (req, res) => {
            try {
                logger.info(`Received manual GitHub sync request for user ${req.body.user_id}`);
                const expectedToken = process.env.FLOWRA_ENGINE_API_KEY;
                if (expectedToken) {
                    const authHeader = req.headers.authorization || '';
                    const providedToken = authHeader.startsWith('Bearer ')
                        ? authHeader.slice('Bearer '.length)
                        : '';

                    if (providedToken !== expectedToken) {
                        return res.status(401).json({ error: 'Unauthorized' });
                    }
                }

                const integrationId = req.body.integration_id;
                const installationId = Number(req.body.installation_id);
                const userId = req.body.user_id;

                if (!integrationId || !installationId || !userId) {
                    return res.status(400).json({
                        error: 'integration_id, installation_id, and user_id are required',
                    });
                }

                const repos = await githubSync.syncRepositories(
                    integrationId,
                    installationId,
                    userId
                );

                res.status(200).json({
                    ok: true,
                    repository_count: repos.length,
                    repositories: repos.map((repo) => ({
                        id: repo.id,
                        full_name: repo.full_name,
                    })),
                });
            } catch (error) {
                logger.error(`GitHub sync endpoint failed: ${error.message}`);
                res.status(500).json({ error: error.message });
            }
        });

        app.post('/api/analysis/run', async (req, res) => {
            try {
                const expectedToken = process.env.FLOWRA_ENGINE_API_KEY;
                if (expectedToken) {
                    const authHeader = req.headers.authorization || '';
                    const providedToken = authHeader.startsWith('Bearer ')
                        ? authHeader.slice('Bearer '.length)
                        : '';

                    if (providedToken !== expectedToken) {
                        return res.status(401).json({ error: 'Unauthorized' });
                    }
                }

                const userId = req.body.user_id;
                const analysisType = req.body.analysis_type || 'risk';
                const allowedTypes = ['risk', 'evaluation', 'provision_metrics', 'jira', 'jira_sync'];
                
                if (!userId || !allowedTypes.includes(analysisType)) {
                    return res.status(400).json({ error: 'user_id and a valid analysis_type are required' });
                }

                if (analysisType === 'provision_metrics') {
                    const metrics = await analysisRunner.ensureMetrics(userId);
                    return res.status(200).json({ ok: true, metrics_count: metrics.length });
                }

                const syncOnly = !!req.body.sync_only;
                const run = await intelligenceScheduler.runNow(userId, analysisType, syncOnly);
                res.status(200).json({ ok: true, run });
            } catch (error) {
                logger.error(`Manual analysis run failed: ${error.message}`);
                res.status(500).json({ error: error.message });
            }
        });

        // GitHub: List all App installations (for frontend to discover installation_id)
        app.get('/api/github/installations', async (req, res) => {
            try {
                const { Octokit } = require('octokit');
                const { createAppAuth } = require('@octokit/auth-app');
                const appId = process.env.GITHUB_APP_ID;
                const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n');

                if (!appId || !privateKey) {
                    return res.status(503).json({ error: 'GitHub App credentials not configured on engine.' });
                }

                const octokit = new Octokit({
                    authStrategy: createAppAuth,
                    auth: { appId, privateKey },
                });

                const { data } = await octokit.rest.apps.listInstallations({ per_page: 50 });
                res.json({
                    installations: data.map(inst => ({
                        id: inst.id,
                        account: { login: inst.account?.login, type: inst.account?.type },
                        created_at: inst.created_at,
                    })),
                });
            } catch (err) {
                logger.error(`Failed to list GitHub installations: ${err.message}`);
                res.status(500).json({ error: err.message });
            }
        });

        // GitHub Webhook Route
        app.post('/api/webhooks/github', async (req, res) => {
            const event = req.headers['x-github-event'];
            const deliveryId = req.headers['x-github-delivery'];
            logger.info(`Received GitHub Webhook: ${event}`);
            
            // Process the event (Pass to botManager or a specialized GitHub service)
            if (botManager.handleGitHubEvent) {
                await botManager.handleGitHubEvent(event, req.body, deliveryId);
            }
            
            res.status(200).send('Accepted');
        });

        // Jira Execute Approval Route
        app.post('/api/jira/execute-approval', async (req, res) => {
            try {
                const expectedToken = process.env.FLOWRA_ENGINE_API_KEY;
                if (expectedToken) {
                    const authHeader = req.headers.authorization || '';
                    const providedToken = authHeader.startsWith('Bearer ')
                        ? authHeader.slice('Bearer '.length)
                        : '';

                    if (providedToken !== expectedToken) {
                        return res.status(401).json({ error: 'Unauthorized' });
                    }
                }

                const { user_id, issue_key, target_status, approval_id } = req.body;
                if (!user_id || !issue_key || !target_status) {
                    return res.status(400).json({ error: 'user_id, issue_key, and target_status are required' });
                }

                // Fetch user's Jira integration
                const { data: integration, error } = await supabase
                    .from('integrations')
                    .select('*')
                    .eq('user_id', user_id)
                    .eq('service_name', 'jira')
                    .maybeSingle();

                if (error || !integration) {
                    return res.status(404).json({ error: 'Jira integration not found for this user.' });
                }

                const jiraClient = new JiraAPI(integration);
                logger.info(`[DEBUG] Executing approval for ${issue_key} -> ${target_status}`);
                
                const transitions = await jiraClient.getTransitions(issue_key);
                logger.info(`[DEBUG] Available Jira Transitions: ${transitions.map(t => t.to.name).join(', ')}`);
                
                const targetTransition = transitions.find(t => t.to.name.toLowerCase() === target_status.toLowerCase());

                if (!targetTransition) {
                    logger.error(`[DEBUG] FAILED: Transition to '${target_status}' not found in available list.`);
                    return res.status(400).json({ error: `Transition to '${target_status}' is not available for ${issue_key}` });
                }

                logger.info(`[DEBUG] Matched Transition: ${targetTransition.to.name} (ID: ${targetTransition.id})`);
                const response = await jiraClient.transitionIssue(issue_key, targetTransition.id);
                logger.info(`[DEBUG] Jira API Response: ${JSON.stringify(response)}`);
                
                if (approval_id) {
                    // Update approval request status — scoped to user_id to prevent cross-user mutation
                    await supabase
                        .from('approval_requests')
                        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
                        .eq('id', approval_id)
                        .eq('user_id', user_id); // Critical: ensure ownership before marking
                }

                res.status(200).json({ ok: true, message: `Successfully transitioned ${issue_key} to ${target_status}` });
            } catch (error) {
                logger.error(`Execute Jira approval failed: ${error.message}`);
                res.status(500).json({ error: error.message });
            }
        });

        // Health Check
        app.get('/health', (req, res) => res.send('Flowra Engine is Healthy'));

        // Start Services
        await integrationsSync.start();
        intelligenceScheduler.start();
        approvalWatcher.start();

        // Start Web Server
        app.listen(PORT, '0.0.0.0', () => {
            logger.info(`Web Server started on port ${PORT}`);
            logger.info(`Webhook URL: http://localhost:${PORT}/api/webhooks/github`);
        });

        logger.info('Service is up and running. Listening for Sockets and Webhooks.');

        // Graceful shutdown
        const shutdown = () => {
            logger.info('Shutting down service...');
            integrationsSync.stop();
            intelligenceScheduler.stop();
            process.exit(0);
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

    } catch (error) {
        logger.error('Failed to bootstrap Flowra Engine Service:', error);
        process.exit(1);
    }
}

bootstrap();
