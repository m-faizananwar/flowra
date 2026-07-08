import supabase from './lib/supabase';
import logger from './lib/logger';

/**
 * ChatSyncService
 * 
 * Periodically synchronizes message history from the local OpenClaw engine
 * to Supabase for archiving and signal processing.
 */
class ChatSyncService {
  syncInterval: any;
  intervalMs: any;
    constructor() {
        this.syncInterval = null;
        // Default interval: 30 minutes
        this.intervalMs = parseInt(process.env.SYNC_INTERVAL_MS) || 30 * 60 * 1000;
    }

    async start() {
        logger.info(`Chat Sync Service starting... (Interval: ${this.intervalMs / 1000 / 60} minutes)`);
        
        // Run immediately on start
        this.performSync();

        // Schedule periodic sync
        this.syncInterval = setInterval(() => {
            this.performSync();
        }, this.intervalMs);
    }

    async stop() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            logger.info('Chat Sync Service stopped.');
        }
    }

    async performSync() {
        logger.info('Starting scheduled chat synchronization...');
        
        try {
            // 1. Fetch active communication integrations
            const { data: integrations, error } = await supabase
                .from('integrations')
                .select('*')
                .in('service_name', ['slack', 'telegram', 'discord'])
                .eq('is_active', true);

            if (error) {
                logger.error('Error fetching integrations for sync:', error);
                return;
            }

            if (!integrations || integrations.length === 0) {
                logger.info('No active communication integrations found. Skipping sync.');
                return;
            }

            logger.info(`Found ${integrations.length} active integrations to sync.`);

            // 2. Process each integration
            for (const integration of integrations) {
                await this.syncIntegrationMessages(integration);
            }

            logger.info('Scheduled chat synchronization completed successfully.');
        } catch (error) {
            logger.error('Critical error during performSync:', error);
        }
    }

    async syncIntegrationMessages(integration) {
        const { id, service_name, credentials } = integration;
        const channelId = credentials.chat_id || credentials.channel_id;

        if (!channelId) {
            logger.warn(`Integration ${id} (${service_name}) has no channel ID configured. Skipping.`);
            return;
        }

        logger.info(`Syncing messages for ${service_name} channel: ${channelId}`);

        try {
            // 3. Fetch messages from OpenClaw (Mocked for now)
            // In a real scenario, this would read from ~/.openclaw/logs or a local DB
            const messages = await this.fetchLocalMessages(service_name, channelId);

            if (messages.length === 0) {
                logger.info(`No new messages for ${service_name} channel ${channelId}.`);
                return;
            }

            // 4. Upsert to Supabase
            // We use upsert on (integration_id, external_id) to prevent duplicates
            const { error: upsertError } = await supabase
                .from('messages')
                .upsert(
                    messages.map(msg => ({
                        integration_id: id,
                        external_message_id: msg.id,
                        sender_name: msg.author,
                        content: msg.text,
                        metadata: msg.metadata || {},
                        created_at: msg.timestamp,
                        synced_at: new Date().toISOString()
                    })),
                    { onConflict: 'integration_id, external_message_id' }
                );

            if (upsertError) {
                // If the table doesn't exist yet, we log it but don't crash
                if (upsertError.code === '42P01') {
                    logger.error(`Table "messages" does not exist in Supabase. Please run the SQL migrations.`);
                } else {
                    logger.error(`Error upserting messages for ${service_name}:`, upsertError);
                }
            } else {
                logger.info(`Successfully synced ${messages.length} messages for ${service_name}.`);
            }
        } catch (error) {
            logger.error(`Failed to sync integration ${id}:`, error);
        }
    }

    /**
     * Fetch messages from Supabase for reconciliation.
     * Since bot services save messages in real-time, this acts as a periodic
     * integrity check, re-syncing any messages stored since the last run.
     */
    async fetchLocalMessages(service, channelId): Promise<any[]> {
        const since = new Date(Date.now() - this.intervalMs).toISOString();

        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('channel_id', channelId)
            .gte('created_at', since)
            .order('created_at', { ascending: true });

        if (error) {
            logger.error(`Error fetching messages for reconciliation (${service} - ${channelId}):`, error);
            return [];
        }

        logger.debug(`Reconciliation: found ${messages?.length ?? 0} messages for ${service} - ${channelId}`);
        return (messages || []).map((msg: any) => ({
            id: msg.external_message_id,
            author: msg.sender_name,
            text: msg.content,
            timestamp: msg.created_at,
            metadata: msg.metadata || {},
        }));
    }
}

export default new ChatSyncService();
