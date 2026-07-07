const supabase = require('./lib/supabase');
const botManager = require('./bots');
const logger = require('./lib/logger');

class IntegrationsSync {
    constructor() {
        this.subscription = null;
    }

    async start() {
        logger.info('Starting Integrations Synchronization Service (Native Bots)...');
        
        // 1. Initial Sync
        await this.syncAll();

        // 2. Listen for changes in real-time
        this.subscription = supabase
            .channel('public:integrations')
            .on('postgres_changes', { event: '*', table: 'integrations' }, async (payload) => {
                logger.info('Received integration update from database:', { event: payload.eventType });
                await this.handleDatabaseEvent(payload);
            })
            .subscribe((status) => {
                logger.info(`Supabase subscription status: ${status}`);
            });
    }

    async syncAll() {
        try {
            logger.info('Performing initial full synchronization for bots...');
            const { data, error } = await supabase
                .from('integrations')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) {
                logger.error(`Supabase error fetching integrations: ${error.message}`);
                throw error;
            }

            logger.info(`Found ${data ? data.length : 0} integrations in database.`);
            if (data && data.length > 0) {
                logger.info('Integration service names: ' + data.map(i => i.service_name).join(', '));
            }

            await botManager.startAll(data || []);
            
            logger.info('Initial bot sync completed.');
        } catch (error) {
            logger.error(`Initial sync failed: ${error.message}`);
        }
    }

    async handleDatabaseEvent(payload) {
        const { eventType, new: newItem, old: oldItem } = payload;

        try {
            if (eventType === 'DELETE') {
                botManager.stopBot(oldItem.service_name, oldItem.user_id);
            } else {
                if (newItem.is_active) {
                    botManager.startBot(newItem.service_name, newItem.credentials, newItem.id, newItem.user_id);
                } else {
                    botManager.stopBot(newItem.service_name, newItem.user_id);
                }
            }
        } catch (error) {
            logger.error(`Failed to handle database event: ${error.message}`);
        }
    }

    stop() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        // Stop all active bots
        Object.keys(botManager.activeBots).forEach(type => botManager.stopBot(type));
    }
}

module.exports = new IntegrationsSync();
