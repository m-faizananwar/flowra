const { Octokit } = require("octokit");
const supabase = require("./lib/supabase");
const logger = require("./lib/logger");

class GitHubSync {
    constructor() {
        this.appId = process.env.GITHUB_APP_ID;
        this.privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n');
    }

    /**
     * Get an Octokit instance for a specific installation
     */
    async getInstallationClient(installationId) {
        if (!this.appId || !this.privateKey) {
            throw new Error("GitHub App credentials missing in environment");
        }

        return new Octokit({
            authStrategy: require("@octokit/auth-app").createAppAuth,
            auth: {
                appId: this.appId,
                privateKey: this.privateKey,
                installationId: installationId,
            },
        });
    }

    /**
     * Sync repositories for an installation
     */
    async syncRepositories(integrationId, installationId, userId) {
        try {
            logger.info(`Syncing GitHub Repositories for Installation: ${installationId}`);
            const octokit = await this.getInstallationClient(installationId);
            
            const repos = await octokit.paginate(
                octokit.rest.apps.listReposAccessibleToInstallation,
                { per_page: 100 }
            );
            const repoIds = repos.map((repo) => repo.id);

            for (const repo of repos) {
                await supabase
                    .from('github_repositories')
                    .upsert({
                        user_id: userId,
                        integration_id: integrationId,
                        repo_id: repo.id,
                        full_name: repo.full_name,
                        is_active: true,
                        last_sync_at: new Date().toISOString()
                    }, { onConflict: 'integration_id,repo_id' });
            }

            const staleQuery = supabase
                .from('github_repositories')
                .update({
                    is_active: false,
                    last_sync_at: new Date().toISOString()
                })
                .eq('integration_id', integrationId);

            if (repoIds.length > 0) {
                await staleQuery.not('repo_id', 'in', `(${repoIds.join(',')})`);
            } else {
                await staleQuery;
            }

            logger.info(`Successfully synced ${repos.length} repositories for ${integrationId}`);
            
            // Sync collaborators for each active repo
            for (const repo of repos) {
                await this.syncCollaborators(integrationId, installationId, userId, repo.owner.login, repo.name);
            }

            return repos;
        } catch (err) {
            logger.error(`Failed to sync GitHub repositories: ${err.message}`);
            throw err;
        }
    }

    /**
     * Sync collaborators for a specific repository
     */
    async syncCollaborators(integrationId, installationId, userId, owner, repoName) {
        try {
            logger.info(`Syncing GitHub Collaborators for ${owner}/${repoName}`);
            const octokit = await this.getInstallationClient(installationId);
            
            const collaborators = await octokit.paginate(
                octokit.rest.repos.listCollaborators,
                { owner, repo: repoName, per_page: 100 }
            );

            const botManager = require("./bots");
            
            for (const collab of collaborators) {
                if (collab.type === 'Bot') continue;

                await botManager.anchorMember(
                    integrationId,
                    userId,
                    collab.id.toString(),
                    collab.login,
                    collab.login,
                    {
                        avatar_url: collab.avatar_url,
                        html_url: collab.html_url,
                        github_id: collab.id
                    }
                );
            }

            logger.info(`Synced ${collaborators.length} collaborators for ${repoName}`);
        } catch (err) {
            logger.error(`Failed to sync collaborators for ${repoName}: ${err.message}`);
        }
    }

    /**
     * Fetch PRs for a specific repository
     */
    async getPullRequests(installationId, owner, repo) {
        const octokit = await this.getInstallationClient(installationId);
        const { data } = await octokit.rest.pulls.list({
            owner,
            repo,
            state: 'all',
            per_page: 10
        });
        return data;
    }

    /**
     * Fetch Commits for a specific repository
     */
    async getCommits(installationId, owner, repo) {
        const octokit = await this.getInstallationClient(installationId);
        const { data } = await octokit.rest.repos.listCommits({
            owner,
            repo,
            per_page: 15
        });
        return data;
    }
}

module.exports = new GitHubSync();
