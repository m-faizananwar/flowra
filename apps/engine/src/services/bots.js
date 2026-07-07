const { Client, GatewayIntentBits } = require("discord.js");
const TelegramBot = require("node-telegram-bot-api");
const { App } = require("@slack/bolt");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const supabase = require("./lib/supabase");
const logger = require("./lib/logger");

class BotManager {
  constructor() {
    this.activeBots = {
      discord: null,
      telegram: null,
      slack: null,
    };
    this.integrations = {};
    this.checkedChannels = new Set();
    this.memberCache = new Map(); // Cache: platform:externalId -> memberId
    this.genAI = process.env.GOOGLE_GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY) : null;
    this.model = this.genAI ? this.genAI.getGenerativeModel({ model: "gemini-2.5-pro" }) : null;
  }

  getDashboardUrl() {
    const isProd = process.env.NODE_ENV === "production";
    const prodUrl = process.env.DASHBOARD_URL_PROD || "https://app.flowra.ai";
    const stagingUrl = process.env.DASHBOARD_URL_STAGING || "http://localhost:3000";
    return isProd ? prodUrl : stagingUrl;
  }

  async checkEnlistment(platform, externalId, context) {
    if (!externalId || this.checkedChannels.has(externalId.toString())) return;

    try {
      const { data } = await supabase
        .from("integrations")
        .select("id")
        .eq("external_id", externalId.toString())
        .maybeSingle();

      if (!data) {
        const baseUrl = this.getDashboardUrl();
        const setupUrl = `${baseUrl}/integrations`;
        
        if (platform === 'telegram') {
          const isLocal = setupUrl.includes("localhost");
          let tgMessage = `⚠️ <b>Flowra Onboarding</b>: It looks like this telegram channel isn't linked to your Flowra dashboard yet.\n\nTo enable AI analysis and syncing, please visit the dashboard and enter the ID below:\n\nID for setup:\n<code>${externalId}</code>`;
          
          const options = { parse_mode: 'HTML' };
          if (isLocal) {
            tgMessage += `\n\n🔗 <b>Setup Link:</b> ${setupUrl}`;
          } else {
            options.reply_markup = {
              inline_keyboard: [[{ text: "🔗 Open Dashboard", url: setupUrl }]]
            };
          }
          this.activeBots.telegram.sendMessage(context.chat.id, tgMessage, options);
        } else if (platform === 'discord') {
          const discordMessage = `⚠️ **Flowra Onboarding**: It looks like this discord server isn't linked to your Flowra dashboard yet.\n\nTo enable AI analysis and syncing, please visit:\n🔗 [Open Dashboard](${setupUrl})\n\nID for setup: \`${externalId}\``;
          context.reply(discordMessage);
        } else if (platform === 'slack') {
          const slackMessage = `⚠️ *Flowra Onboarding*: It looks like this slack channel isn't linked to your Flowra dashboard yet.\n\nTo enable AI analysis and syncing, please visit:\n🔗 <${setupUrl}|Open Dashboard>\n\nID for setup: \`${externalId}\``;
          context.say(slackMessage);
        }
      }
      this.checkedChannels.add(externalId.toString());
    } catch (err) {
      logger.error(`Error checking enlistment for ${platform}: ${err.message}`);
    }
  }

  async startAll(integrationsData) {
    logger.info(`Initializing native bot instances... Found ${integrationsData.length} DB integrations.`);
    const started = { discord: false, telegram: false, slack: false };

    for (const integration of integrationsData) {
      const { service_name, user_id, is_active } = integration;
      
      // Initialize multi-tenant storage for this service
      if (!this.integrations[service_name]) {
        this.integrations[service_name] = {};
      }
      
      if (!this.integrations[service_name][user_id]) {
        this.integrations[service_name][user_id] = integration;
        
        if (is_active) {
          this.startBot(service_name, integration.credentials, integration.id, user_id);
          started[service_name] = true;
        }
      } else {
        logger.info(`Skipping stale/duplicate ${service_name} integration for user ${user_id}`);
      }
    }

    if (!started.discord && process.env.DISCORD_BOT_TOKEN) {
      this.startBot("discord", { token: process.env.DISCORD_BOT_TOKEN }, null);
    }
    if (!started.telegram && process.env.TELEGRAM_BOT_TOKEN) {
      this.startBot("telegram", { token: process.env.TELEGRAM_BOT_TOKEN }, null);
    }
    if (!started.slack && process.env.SLACK_BOT_TOKEN) {
      this.startBot("slack", { bot_token: process.env.SLACK_BOT_TOKEN }, null);
    }
  }

  async anchorMember(integrationId, userId, externalUserId, username, displayName, rawData = {}) {
    const cacheKey = `${integrationId}:${externalUserId}`;
    if (this.memberCache.has(cacheKey)) return this.memberCache.get(cacheKey);

    try {
      const { data: intMember, error: profileError } = await supabase
        .from("integration_members")
        .upsert({
          integration_id: integrationId,
          user_id: userId,
          external_id: externalUserId,
          username: username,
          display_name: displayName,
          avatar_url: rawData.avatar_url || rawData.photo_url || null,
          last_seen_at: new Date().toISOString(),
          metadata: rawData
        }, { onConflict: "integration_id,external_id" })
        .select("id, member_id")
        .maybeSingle();

      if (profileError) {
        logger.error(`UPSERT ERROR [integration_members]: ${profileError.message}`);
        return null;
      }

      if (intMember) {
        let memberId = intMember.member_id;
        if (!memberId && userId) {
          const { data: existingHuman } = await supabase
            .from("members")
            .select("id")
            .eq("user_id", userId)
            .eq("full_name", displayName || username)
            .limit(1)
            .maybeSingle();

          if (existingHuman) {
            memberId = existingHuman.id;
          } else {
            const { data: newHuman } = await supabase
              .from("members")
              .insert({ user_id: userId, full_name: displayName || username })
              .select("id")
              .maybeSingle();
            if (newHuman) memberId = newHuman.id;
          }

          if (memberId) {
            await supabase.from("integration_members").update({ member_id: memberId, user_id: userId }).eq("id", intMember.id);
            const updateData = { full_name: displayName, alias: username, updated_at: new Date().toISOString() };
            const incomingAvatar = rawData.avatar_url || rawData.photo_url;
            if (incomingAvatar) updateData.avatar_url = incomingAvatar;
            await supabase.from("members").update(updateData).eq("id", memberId);
          }
        }
        
        if (memberId) this.memberCache.set(cacheKey, memberId);
        return memberId;
      }
    } catch (err) {
      logger.error(`Failed to anchor member: ${err.message}`);
    }
    return null;
  }

  async saveMessage(integrationId, externalId, sender, content, channelExternalId = "unknown", channelName = "unknown", rawData = {}, externalUserId = null, username = null, displayName = null) {
    try {
      if (!integrationId) return;
      
      // Find integration in multi-tenant structure
      let integration = null;
      for (const service in this.integrations) {
        const found = Object.values(this.integrations[service]).find(i => i.id === integrationId);
        if (found) {
          integration = found;
          break;
        }
      }
      const userId = integration?.user_id;

      let channelId = null;
      if (channelExternalId !== "unknown") {
        const { data: channelData } = await supabase.from("channels").upsert({ 
          integration_id: integrationId, external_id: channelExternalId, name: channelName 
        }, { onConflict: "integration_id,external_id" }).select("id").maybeSingle();
        if (channelData) channelId = channelData.id;
      }

      let memberId = null;
      if (externalUserId) {
        memberId = await this.anchorMember(integrationId, userId, externalUserId, username || sender, displayName || sender, { 
          ...(rawData.user || {}), ...(rawData.from || {}), avatar_url: rawData.avatar_url || null 
        });
      }

      await supabase.from("messages").upsert({
        integration_id: integrationId,
        channel_id: channelId,
        external_message_id: externalId.toString(),
        sender_name: sender,
        content: content,
        metadata: { ...rawData, member_id: memberId },
        synced_at: new Date().toISOString(),
      }, { onConflict: "integration_id,external_message_id" });
    } catch (err) {
      logger.error(`Failed to save message: ${err.message}`);
    }
  }

  async syncGuildMembers(client, integrationId) {
    try {
      logger.info(`Starting bulk member sync for integration: ${integrationId}`);
      // DISABLED: This was causing massive DNS and socket exhaustion by attempting
      // to anchor and save a dummy message for every single member of the guild on startup.
      /*
      const guilds = await client.guilds.fetch();
      for (const [guildId, oAuth2Guild] of guilds) {
        const guild = await oAuth2Guild.fetch();
        const members = await guild.members.fetch();
        for (const [id, member] of members) {
          if (member.user.bot) continue;
          await this.saveMessage(integrationId, `sync-${Date.now()}-${id}`, member.displayName, "(System Sync: Registered)", "unknown", "unknown", { 
            avatar_url: member.user.displayAvatarURL({ size: 512 }) 
          }, id, member.user.username, member.displayName);
        }
      }
      */
      logger.info(`Bulk member sync disabled for performance preservation.`);
    } catch (err) {
      logger.error(`Failed to sync guild members: ${err.message}`);
    }
  }

  async getChatContext(integrationId, channelExternalId = null, limit = 15) {
    if (!integrationId || integrationId === 'null') return "";
    try {
      let query = supabase.from("messages").select("sender_name, content, created_at, channels(name)").eq("integration_id", integrationId);
      if (channelExternalId) {
        const { data: channel } = await supabase.from("channels").select("id").eq("integration_id", integrationId).eq("external_id", channelExternalId).maybeSingle();
        if (channel) query = query.eq("channel_id", channel.id);
      }
      const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
      if (error) throw error;
      return data.reverse().map((m) => {
        const prefix = m.channels?.name ? `[#${m.channels.name}] ` : "";
        return `${prefix}${m.sender_name}: ${m.content}`;
      }).join("\n");
    } catch (err) {
      logger.error(`Error fetching chat context: ${err.message}`);
      return "";
    }
  }

  async generateAIResponse(integrationId, userQuery, channelExternalId = null) {
    if (!this.model) return "AI features are currently unavailable.";
    try {
      const context = await this.getChatContext(integrationId, channelExternalId);
      const prompt = `You are Flowra assistant. Context:\n${context}\nQuery: ${userQuery}`;
          const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      logger.error(`AI generation failed: ${err.message}`);
      return "Sorry, I encountered an error.";
    }
  }

  startBot(type, credentials, integrationId, userId = null) {
    this.stopBot(type, userId);
    logger.info(`Starting ${type} bot natively for user: ${userId || 'system'}...`);
    
    // Maintain multi-tenant integrations map
    if (userId && type) {
      if (!this.integrations[type]) this.integrations[type] = {};
      this.integrations[type][userId] = { id: integrationId, service_name: type, credentials, user_id: userId, is_active: true };
    }

    try {
      switch (type) {
        case "discord":
          this.startDiscord(credentials.token || credentials.bot_token || process.env.DISCORD_BOT_TOKEN, integrationId);
          break;
        case "telegram":
          this.startTelegram(credentials.token || credentials.bot_token || process.env.TELEGRAM_BOT_TOKEN, integrationId);
          break;
        case "slack":
          this.startSlack(credentials.bot_token || process.env.SLACK_BOT_TOKEN, credentials.app_token || process.env.SLACK_APP_TOKEN, integrationId);
          break;
        case "github":
          logger.info("GitHub integration is active via Webhooks.");
          break;
        case "jira":
          logger.info("Jira integration is active via Polling & Analysis service.");
          break;
        default:
          logger.warn(`Unknown bot type: ${type}`);
      }
    } catch (error) {
      logger.error(`Failed to start ${type} bot: ${error.message}`);
    }
  }

  stopBot(type, userId = null) {
    // For social bots, we only have one instance globally usually
    // but we still clean up the integration map
    if (userId && this.integrations[type]) {
      delete this.integrations[type][userId];
    }

    if (!this.activeBots[type]) return;
    try {
      if (type === "discord") this.activeBots.discord.destroy();
      else if (type === "telegram") this.activeBots.telegram.stopPolling();
      else if (type === "slack") this.activeBots.slack.stop();
    } catch (e) {
      logger.error(`Error stopping ${type} bot: ${e.message}`);
    }
    this.activeBots[type] = null;
  }

  startDiscord(token, integrationId) {
    if (!token) return;
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers], partials: ["CHANNEL"] });
    client.on("clientReady", () => {
      logger.info(`Discord Bot logged in as ${client.user.tag}`);
      if (integrationId) this.syncGuildMembers(client, integrationId);
    });
    client.on("messageCreate", async (message) => {
      if (message.author.bot) return;
      if (message.content === "/flowra-id") return message.reply(`Your Discord ID is: \`${message.guild ? message.guild.id : message.channel.id}\``);
      
      if (message.guild) await this.checkEnlistment('discord', message.guild.id, message);
      
      await this.saveMessage(integrationId, message.id, message.member?.displayName || message.author.username, message.cleanContent, message.channel.id, message.channel.name || "dm", { 
        ...(message.toJSON ? message.toJSON() : message), 
        avatar_url: message.author.displayAvatarURL({ size: 512 }) 
      }, message.author.id, message.author.username, message.member?.displayName || message.author.username);

      if (message.mentions.has(client.user) || !message.guild) {
        message.channel.sendTyping();
        const response = await this.generateAIResponse(integrationId, message.content, message.channel.id);
        message.reply(response);
      }
    });
    client.login(token).catch(err => logger.error(`Discord login failed: ${err.message}`));
    this.activeBots.discord = client;
  }

  startTelegram(token, integrationId) {
    if (!token) return;
    const bot = new TelegramBot(token, { polling: true });
    bot.on("message", async (msg) => {
      if (msg.from?.is_bot) return;
      const content = msg.text || "";
      if (content === "/flowra-id") return bot.sendMessage(msg.chat.id, `ID: <code>${msg.chat.id}</code>`, { parse_mode: 'HTML' });
      
      let photoUrl = null;
      try {
        const photos = await bot.getUserProfilePhotos(msg.from.id, { limit: 1 });
        if (photos?.total_count > 0) {
          const file = await bot.getFile(photos.photos[0][0].file_id);
          photoUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
        }
      } catch (e) {}

      await this.saveMessage(integrationId, msg.message_id, msg.from.username || msg.from.first_name, content, msg.chat.id.toString(), msg.chat.title || "private", { ...msg, avatar_url: photoUrl }, msg.from.id.toString(), msg.from.username, msg.from.first_name);
      
      if (content.toLowerCase().includes("flowra") || !msg.chat.title) {
        const response = await this.generateAIResponse(integrationId, content, msg.chat.id.toString());
        bot.sendMessage(msg.chat.id, response);
      } else {
        await this.checkEnlistment('telegram', msg.chat.id, msg);
      }
    });
    bot.on("polling_error", (err) => {
      if (err.message?.includes("ECONNRESET")) {
        logger.warn("Telegram polling connection reset (ECONNRESET). Retrying...");
      } else {
        logger.error(`Telegram polling error: ${err.message}`);
      }
    });
    this.activeBots.telegram = bot;
  }

  startSlack(botToken, appToken, integrationId) {
    if (!botToken || !appToken) return;
    const app = new App({ token: botToken, appToken: appToken, socketMode: true });
    app.message(async ({ message, say, client }) => {
      // @ts-ignore
      if (message.subtype === "bot_message") return;
      // @ts-ignore
      const userInfo = await client.users.info({ user: message.user });
      const avatarUrl = userInfo.user.profile?.image_512 || userInfo.user.profile?.image_192;
      // @ts-ignore
      await this.saveMessage(integrationId, message.ts, userInfo.user.real_name, message.text, message.channel, message.channel, { ...message, avatar_url: avatarUrl }, message.user, userInfo.user.name, userInfo.user.real_name);
    });
    app.start().catch(err => logger.error(`Slack failed: ${err.message}`));
    this.activeBots.slack = app;
  }

  async handleGitHubEvent(event, payload, deliveryId = null) {
    try {
      const githubEvents = require('./intelligence/github-events');

      if (event === "installation" || event === "installation_repositories") {
        const installationId = payload.installation.id;
        const { data: integrations } = await supabase.from('integrations').select('*').eq('service_name', 'github').contains('credentials', { installation_id: installationId });
        if (integrations?.length > 0) {
          const githubSync = require('./github-sync');
          for (const integration of integrations) await githubSync.syncRepositories(integration.id, installationId, integration.user_id);
        }
        await githubEvents.record(event, payload, deliveryId);
        return;
      }

      await githubEvents.record(event, payload, deliveryId);

      if (event === "push" && payload.repository) {
        const branch = payload.ref ? payload.ref.split("/").pop() : "unknown";
        const commitCount = payload.commits?.length || 0;
        logger.info(`GitHub push captured: ${commitCount} commit(s) to ${payload.repository.full_name}/${branch}`);
      } else if (event === "pull_request" && payload.repository) {
        logger.info(`GitHub PR captured: ${payload.action} ${payload.pull_request?.html_url || ""}`);
      }
    } catch (err) {
      logger.error(`GitHub error: ${err.message}`);
    }
  }

  async broadcastToSocialChannels(message) {
    if (this.activeBots.discord) {
      const target = this.activeBots.discord.channels.cache.filter(c => c.type === 0).first();
      if (target) target.send(message);
    }
  }
}

module.exports = new BotManager();
