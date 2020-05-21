import {
  Client,
  ClientOptions,
  Constants,
  RequestTypes,
  RestClientEvents,
} from 'detritus-client-rest';

const { RestEvents } = Constants;

import { ShardClient } from '../client';
import { BaseCollection } from '../collections/basecollection';
import { ClientEvents } from '../constants';

import {
  Application,
  ApplicationNews,
  AuditLog,
  Channel,
  ChannelDM,
  ConnectedAccount,
  createChannelFromData,
  Emoji,
  Gift,
  Guild,
  GuildMe,
  Integration,
  Invite,
  Member,
  Message,
  Oauth2Application,
  Oauth2ApplicationAsset,
  PremiumSubscription,
  Profile,
  Role,
  StoreApplicationAsset,
  StoreListing,
  Team,
  TeamMember,
  Template,
  User,
  UserMe,
  VoiceRegion,
  Webhook,
} from '../structures';

import { RestResponses } from './types';


export class RestClient extends Client {
  readonly client: ShardClient;

  constructor(
    token: string,
    options: ClientOptions,
    client: ShardClient,
  ) {
    super(token, options);

    this.client = client;
    Object.defineProperty(this, 'client', {enumerable: false, writable: false});

    this.on(RestEvents.REQUEST, (payload: RestClientEvents.RequestPayload) => this.client.emit(ClientEvents.REST_REQUEST, payload));
    this.on(RestEvents.RESPONSE, (payload: RestClientEvents.ResponsePayload) => this.client.emit(ClientEvents.REST_RESPONSE, payload));
  }

  async acceptTemplate(
    templateId: string,
    options: RequestTypes.AcceptTemplate,
  ): Promise<Guild> {
    const data = await super.acceptTemplate(templateId, options);
    let guild: Guild;
    if (this.client.guilds.has(data.id)) {
      guild = <Guild> this.client.guilds.get(data.id);
      guild.merge(data);
    } else {
      guild = <Guild> new Guild(this.client, data);
      this.client.guilds.insert(guild);
    }
    return guild;
  }

  async createChannelInvite(
    channelId: string,
    options: RequestTypes.CreateChannelInvite = {},
  ): Promise<Invite> {
    const data = await super.createChannelInvite(channelId, options);
    return new Invite(this.client, data);
  }

  async editChannelOverwrite(
    channelId: string,
    overwriteId: string,
    options: RequestTypes.EditChannelOverwrite = {},
  ): Promise<any> {
    return super.editChannelOverwrite(channelId, overwriteId, options);
  }

  async createApplicationNews(
    options: RequestTypes.CreateApplicationNews,
  ): Promise<ApplicationNews> {
    const data = await super.createApplicationNews(options);
    return new ApplicationNews(this.client, data);
  }

  async createDm(
    options: RequestTypes.CreateDm = {},
  ): Promise<ChannelDM> {
    const data = await super.createDm(options);
    let channel: ChannelDM;
    if (this.client.channels.has(data.id)) {
      channel = <ChannelDM> this.client.channels.get(data.id);
      channel.merge(data);
      // this should never happen lmao
    } else {
      channel = <ChannelDM> createChannelFromData(this.client, data);
      this.client.channels.insert(channel);
    }
    return channel;
  }

  async createGuild(
    options: RequestTypes.CreateGuild,
  ): Promise<Guild> {
    const data = await super.createGuild(options);
    let guild: Guild;
    if (this.client.guilds.has(data.id)) {
      guild = <Guild> this.client.guilds.get(data.id);
      guild.merge(data);
    } else {
      guild = <Guild> new Guild(this.client, data);
      this.client.guilds.insert(guild);
    }
    return guild;
  }

  async createGuildChannel(
    guildId: string,
    options: RequestTypes.CreateGuildChannel,
  ): Promise<Channel> {
    const data = await super.createGuildChannel(guildId, options);
    let channel: Channel;
    if (this.client.channels.has(data.id)) {
      channel = <Channel> this.client.channels.get(data.id);
      channel.merge(data);
      // this should never happen lmao
    } else {
      channel = createChannelFromData(this.client, data);
      this.client.channels.insert(channel);
    }
    return channel;
  }

  async createGuildEmoji(
    guildId: string,
    options: RequestTypes.CreateGuildEmoji,
  ): Promise<Emoji> {
    const data = await super.createGuildEmoji(guildId, options);

    let emoji: Emoji;
    if (this.client.emojis.has(guildId, data.id)) {
      emoji = <Emoji> this.client.emojis.get(guildId, data.id);
      emoji.merge(data);
    } else {
      data.guild_id = guildId;
      emoji = new Emoji(this.client, data);
      this.client.emojis.insert(emoji);
    }
    return emoji;
  }

  async createGuildRole(
    guildId: string,
    options: RequestTypes.CreateGuildRole = {},
  ): Promise<Role> {
    const data = await super.createGuildRole(guildId, options);
    data.guild_id = guildId;
    const role = new Role(this.client, data);
    if (this.client.guilds.has(guildId)) {
      (<Guild> this.client.guilds.get(guildId)).roles.set(role.id, role);
    }
    return role;
  }

  async createGuildTemplate(
    guildId: string,
    options: RequestTypes.CreateGuildTemplate,
  ): Promise<Template> {
    const data = await super.createGuildTemplate(guildId, options);
    return new Template(this.client, data);
  }

  async createMessage(
    channelId: string,
    options: RequestTypes.CreateMessage | string = {},
  ): Promise<Message> {
    const data = await super.createMessage(channelId, options);
    if (this.client.channels.has(data.channel_id)) {
      const channel = <Channel> this.client.channels.get(data.channel_id);
      if (channel.guildId) {
        data.guild_id = channel.guildId;
      }
    }
    const message = new Message(this.client, data);
    this.client.messages.insert(message);
    return message;
  }

  async createOauth2ApplicationAsset(
    applicationId: string,
    options: RequestTypes.CreateOauth2ApplicationAsset,
  ): Promise<Oauth2ApplicationAsset> {
    const data = await super.createOauth2ApplicationAsset(applicationId, options);
    data.application_id = applicationId;
    return new Oauth2ApplicationAsset(this.client, data);
  }

  async createStoreApplicationAsset(
    applicationId: string,
    options: RequestTypes.CreateStoreApplicationAsset,
  ): Promise<StoreApplicationAsset> {
    const data = await super.createStoreApplicationAsset(applicationId, options);
    data.application_id = applicationId;
    return new StoreApplicationAsset(this.client, data);
  }

  async createWebhook(
    channelId: string,
    options: RequestTypes.CreateWebhook,
  ): Promise<Webhook> {
    const data = await super.createWebhook(channelId, options);
    return new Webhook(this.client, data);
  }

  async deleteChannel(channelId: string, options: RequestTypes.DeleteChannel = {}): Promise<Channel> {
    const data = await super.deleteChannel(channelId, options);
    let channel: Channel;
    if (this.client.channels.has(data.id)) {
      channel = <Channel> this.client.channels.get(data.id);
      this.client.channels.delete(data.id);
      channel.merge(data);
    } else {
      channel = createChannelFromData(this.client, data);
    }
    return channel;
  }

  async deleteInvite(code: string, options: RequestTypes.DeleteInvite = {}): Promise<Invite> {
    const data = await super.deleteInvite(code, options);
    return new Invite(this.client, data);
  }

  /* Issue with merging data with these edited objects is that the gateway event wont have differences then */
  async editChannel(
    channelId: string,
    options: RequestTypes.EditChannel = {},
  ): Promise<Channel> {
    const data = await super.editChannel(channelId, options);
    let channel: Channel;
    if (this.client.channels.has(data.id)) {
      channel = <Channel> this.client.channels.get(data.id);
      channel.merge(data);
    } else {
      channel = createChannelFromData(this.client, data);
      // insert? nah
    }
    return channel;
  }

  async editGuild(
    guildId: string,
    options: RequestTypes.EditGuild = {},
  ): Promise<Guild> {
    const data = await super.editGuild(guildId, options);
    let guild: Guild;
    if (this.client.guilds.has(data.id)) {
      guild = <Guild> this.client.guilds.get(data.id);
      guild.merge(data);
    } else {
      guild = new Guild(this.client, data);
    }
    return guild;
  }

  async editGuildEmoji(
    guildId: string,
    emojiId: string,
    options: RequestTypes.EditGuildEmoji = {},
  ): Promise<Emoji> {
    const data = await super.editGuildEmoji(guildId, emojiId, options);

    let emoji: Emoji;
    if (this.client.emojis.has(guildId, data.id)) {
      emoji = <Emoji> this.client.emojis.get(guildId, data.id);
      emoji.merge(data);
    } else {
      data.guild_id = guildId;
      emoji = new Emoji(this.client, data);
    }
    return emoji;
  }

  async editGuildRole(
    guildId: string,
    roleId: string,
    options: RequestTypes.EditGuildRole = {},
  ): Promise<Role> {
    const data = await super.editGuildRole(guildId, roleId, options);
    let role: Role;
    if (this.client.guilds.has(guildId)) {
      const guild = <Guild> this.client.guilds.get(guildId);
      if (guild.roles.has(data.id)) {
        role = <Role> guild.roles.get(data.id);
        role.merge(data);
      } else {
        data.guild_id = guildId;
        role = new Role(this.client, data);
        guild.roles.set(role.id, role);
      }
    } else {
      data.guild_id = guildId;
      role = new Role(this.client, data);
    }
    return role;
  }

  async editGuildRolePositions(
    guildId: string,
    roles: RequestTypes.EditGuildRolePositions,
    options: RequestTypes.EditGuildRolePositionsExtra = {}
  ): Promise<BaseCollection<string, Role>> {
    const data = await super.editGuildRolePositions(guildId, roles, options);

    const collection = new BaseCollection<string, Role>();
    if (this.client.guilds.has(guildId)) {
      const guild = <Guild> this.client.guilds.get(guildId);
      guild.roles.clear();
      for (let raw of data) {
        raw.guild_id = guildId;
        const role = new Role(this.client, raw);
        guild.roles.set(role.id, role);
        collection.set(role.id, role);
      }
    } else {
      for (let raw of data) {
        raw.guild_id = guildId;
        const role = new Role(this.client, raw);
        collection.set(role.id, role);
      }
    }
    return collection;
  }

  async editMe(
    options: RequestTypes.EditMe = {},
  ): Promise<UserMe> {
    const data = await super.editMe(options);
    let user: UserMe;
    if (this.client.user !== null) {
      user = <UserMe> this.client.user;
      user.merge(data);
    } else {
      user = new UserMe(this.client, data);
    }
    return user;
  }

  async editMessage(
    channelId: string,
    messageId: string,
    options: RequestTypes.EditMessage | string = {},
  ): Promise<Message> {
    const data = await super.editMessage(channelId, messageId, options);
    let message: Message;
    if (this.client.messages.has(data.id)) {
      message = <Message> this.client.messages.get(data.id);
      message.merge(data);
      // should we really merge? the message_update event wont have differences then
    } else {
      message = new Message(this.client, data);
      this.client.messages.insert(message);
    }
    return message;
  }

  async editTeam(
    teamId: string,
    options: RequestTypes.EditTeam = {},
  ): Promise<any> {
    return super.editTeam(teamId, options);
  }

  async editUser(options: RequestTypes.EditMe = {}) {
    return this.editMe(options);
  }

  async editWebhook(
    webhookId: string,
    options: RequestTypes.EditWebhook = {},
  ): Promise<Webhook> {
    const data = await super.editWebhook(webhookId, options);
    return new Webhook(this.client, data);
  }

  async editWebhookToken(
    webhookId: string,
    token: string,
    options: RequestTypes.EditWebhook = {},
  ): Promise<Webhook> {
    const data = await super.editWebhookToken(webhookId, token, options);
    return new Webhook(this.client, data);
  }

  async executeWebhook(
    webhookId: string,
    token: string,
    options: RequestTypes.ExecuteWebhook | string = {},
    compatibleType?: string,
  ): Promise<Message | null> {
    const data = await super.executeWebhook(webhookId, token, options, compatibleType);
    if (typeof(options) !== 'string' && options.wait) {
      const message = new Message(this.client, data);
      this.client.messages.insert(message);
      return message;
    }
    return data;
  }

  async fetchApplicationNews(
    applicationIds?: Array<string> | string,
  ): Promise<BaseCollection<string, ApplicationNews>> {
    const data = await super.fetchApplicationNews(applicationIds);
    const collection = new BaseCollection<string, ApplicationNews>();
    for (let raw of data) {
      const applicationNews = new ApplicationNews(this.client, raw);
      collection.set(applicationNews.id, applicationNews);
    }
    return collection;
  }

  async fetchApplicationNewsId(newsId: string): Promise<ApplicationNews> {
    const data = await super.fetchApplicationNewsId(newsId);
    return new ApplicationNews(this.client, data);
  }

  async fetchApplication(
    applicationId: string,
  ): Promise<Application> {
    const data = await super.fetchApplication(applicationId);
    return new Application(this.client, data);
  }

  async fetchApplicationsDetectable(): Promise<BaseCollection<string, Application>> {
    const data = await super.fetchApplicationsDetectable.call(this);
    const collection = new BaseCollection<string, Application>();
    for (let raw of data) {
      const application = new Application(this.client, raw);
      collection.set(application.id, application);
    }
    return collection;
  }

  async fetchChannel(channelId: string): Promise<Channel> {
    const data = await super.fetchChannel(channelId);
    let channel: Channel;
    if (this.client.channels.has(data.id)) {
      channel = <Channel> this.client.channels.get(data.id);
      channel.merge(data);
    } else {
      channel = createChannelFromData(this.client, data);
    }
    return channel;
  }

  async fetchChannelInvites(
    channelId: string,
  ): Promise<BaseCollection<string, Invite>> {
    const data: Array<any> = await super.fetchChannelInvites(channelId);
    const collection = new BaseCollection<string, Invite>();
    for (let raw of data) {
      const invite = new Invite(this.client, raw);
      collection.set(invite.code, invite);
    }
    return collection;
  }

  async fetchChannelStoreListing(channelId: string): Promise<StoreListing> {
    const data = await super.fetchChannelStoreListing(channelId);
    return new StoreListing(this.client, data);
  }

  async fetchChannelWebhooks(
    channelId: string,
  ): Promise<BaseCollection<string, Webhook>> {
    const data = await super.fetchChannelWebhooks(channelId);
    const collection = new BaseCollection<string, Webhook>();
    for (let raw of data) {
      const webhook = new Webhook(this.client, raw);
      collection.set(webhook.id, webhook);
    }
    return collection;
  }

  async fetchDms(
    userId: string = '@me',
  ): Promise<BaseCollection<string, Channel>> {
    const data: Array<any> = await super.fetchDms(userId);
    const collection = new BaseCollection<string, Channel>();
    for (let raw of data) {
      let channel: Channel;
      if (this.client.channels.has(raw.id)) {
        channel = <Channel> this.client.channels.get(raw.id);
        channel.merge(raw);
      } else {
        channel = createChannelFromData(this.client, raw);
      }
      collection.set(channel.id, channel);
    }
    return collection;
  }

  async fetchGiftCode(
    code: string,
    options: RequestTypes.FetchGiftCode = {},
  ): Promise<Gift> {
    const data = await super.fetchGiftCode(code, options);
    return new Gift(this.client, data);
  }

  async fetchGuild(guildId: string): Promise<Guild> {
    const data = await super.fetchGuild(guildId);

    let guild: Guild;
    if (this.client.guilds.has(data.id)) {
      guild = <Guild> this.client.guilds.get(data.id);
      guild.merge(data);
    } else {
      guild = new Guild(this.client, data, {emojis: {}, members: {}, roles: {}});
    }
    guild.hasMetadata = true;
    return guild;
  }

  async fetchGuildAuditLogs(
    guildId: string,
    options: RequestTypes.FetchGuildAuditLogs = {},
  ): Promise<BaseCollection<string, AuditLog>> {
    const data = await super.fetchGuildAuditLogs(guildId, options);
    const collection = new BaseCollection<string, AuditLog>();
    for (let raw of data.audit_log_entries) {
      let target: null | User | Webhook = null;
      if (this.client.users.has(raw.target_id)) {
        target = <User> this.client.users.get(raw.target_id);
        // target.merge(data.users.find((user) => user.id === raw.target_id));
      } else {
        let rawTarget = data.users.find((user: any) => user.id === raw.target_id);
        if (rawTarget !== undefined) {
          target = new User(this.client, rawTarget);
        } else {
          rawTarget = data.webhooks.find((webhook: any) => webhook.id === raw.target_id);
          if (rawTarget !== undefined) {
            target = new Webhook(this.client, rawTarget);
          }
        }
      }

      let user: null | User = null;
      if (this.client.users.has(raw.user_id)) {
        user = <User> this.client.users.get(raw.user_id);
      } else {
        const rawUser = data.users.find((u: any) => u.id === raw.user_id);
        if (rawUser !== undefined) {
          user = new User(this.client, rawUser);
        }
      }

      raw.guild_id = guildId;
      raw.target = target;
      raw.user = user;
      const auditLog = new AuditLog(this.client, raw);
      collection.set(auditLog.id, auditLog);
    }
    return collection;
  }

  async fetchGuildBans(
    guildId: string,
  ): Promise<RestResponses.FetchGuildBans> {
    const data = await super.fetchGuildBans(guildId);
    const collection: RestResponses.FetchGuildBans = new BaseCollection();
    for (let raw of data) {
      let user: User;
      if (this.client.users.has(raw.user.id)) {
        user = <User> this.client.users.get(raw.user.id);
        user.merge(raw.user);
      } else {
        user = new User(this.client, raw.user);
      }
      collection.set(user.id, {
        reason: raw.reason,
        user,
      });
    }
    return collection;
  }

  async fetchGuildChannels(
    guildId: string,
  ): Promise<BaseCollection<string, Channel>> {
    const data = await super.fetchGuildChannels(guildId);
    const collection = new BaseCollection<string, Channel>();

    for (let raw of data) {
      let channel: Channel;
      if (this.client.channels.has(raw.id)) {
        channel = <Channel> this.client.channels.get(raw.id);
        channel.merge(raw);
      } else {
        channel = createChannelFromData(this.client, raw);
      }
      collection.set(channel.id, channel);
    }
    return collection;
  }

  async fetchGuildEmoji(
    guildId: string,
    emojiId: string,
  ): Promise<Emoji> {
    const data = await super.fetchGuildEmoji(guildId, emojiId);

    let emoji: Emoji;
    if (this.client.emojis.has(guildId, data.id)) {
      emoji = <Emoji> this.client.emojis.get(guildId, data.id);
      emoji.merge(data);
    } else {
      data.guild_id = guildId;
      emoji = new Emoji(this.client, data);
    }
    return emoji;
  }

  async fetchGuildEmojis(
    guildId: string,
  ): Promise<BaseCollection<string, Emoji>> {
    const data = await super.fetchGuildEmojis(guildId);

    if (this.client.guilds.has(guildId)) {
      const guild = <Guild> this.client.guilds.get(guildId);
      guild.merge({emojis: data});
      return guild.emojis;
    } else {
      const collection = new BaseCollection<string, Emoji>();
      for (let raw of data) {
        let emoji: Emoji;
        if (this.client.emojis.has(guildId, raw.id)) {
          emoji = <Emoji> this.client.emojis.get(guildId, raw.id);
          emoji.merge(raw);
        } else {
          raw.guild_id = guildId;
          emoji = new Emoji(this.client, raw);
        }
        collection.set(emoji.id || emoji.name, emoji);
      }
      return collection;
    }
  }

  async fetchGuildIntegrations(
    guildId: string,
  ): Promise<BaseCollection<string, Integration>> {
    const data = await super.fetchGuildIntegrations(guildId);
    const collection = new BaseCollection<string, Integration>();

    for (let raw of data) {
      raw.guild_id = guildId;
      const integration = new Integration(this.client, raw);
      collection.set(integration.id, integration);
    }
    return collection;
  }

  async fetchGuildInvites(
    guildId: string,
  ): Promise<BaseCollection<string, Invite>> {
    const data = await super.fetchGuildInvites(guildId);
    const collection = new BaseCollection<string, Invite>();

    for (let raw of data) {
      const invite = new Invite(this.client, raw);
      collection.set(invite.code, invite);
    }
    return collection;
  }

  async fetchGuildMember(
    guildId: string,
    userId: string,
  ): Promise<Member> {
    const data = await super.fetchGuildMember(guildId, userId);
    let member: Member;
    if (this.client.members.has(guildId, userId)) {
      member = <Member> this.client.members.get(guildId, userId);
      member.merge(data);
    } else {
      data.guild_id = guildId;
      member = new Member(this.client, data);
      this.client.members.insert(member);
    }
    return member;
  }

  async fetchGuildMembers(
    guildId: string,
    options: RequestTypes.FetchGuildMembers = {},
  ): Promise<BaseCollection<string, Member>> {
    const data = await super.fetchGuildMembers(guildId, options);
    const collection = new BaseCollection<string, Member>();

    for (let raw of data) {
      let member: Member;
      if (this.client.members.has(guildId, raw.user.id)) {
        member = <Member> this.client.members.get(guildId, raw.user.id);
        member.merge(raw);
      } else {
        raw.guild_id = guildId;
        member = new Member(this.client, raw);
        this.client.members.insert(member);
      }
      collection.set(member.id, member);
    }
    return collection;
  }

  async fetchGuildPremiumSubscriptions(
    guildId: string,
  ): Promise<BaseCollection<string, PremiumSubscription>> {
    const data = await super.fetchGuildPremiumSubscriptions(guildId);
    const subscriptions = new BaseCollection<string, PremiumSubscription>();
    for (let raw of data) {
      const subscription = new PremiumSubscription(this.client, raw);
      subscriptions.set(subscription.id, subscription);
    }
    return subscriptions;
  }

  async fetchGuildRoles(
    guildId: string,
  ): Promise<BaseCollection<string, Role>> {
    const data = await super.fetchGuildRoles(guildId);
    const collection = new BaseCollection<string, Role>();

    if (this.client.guilds.has(guildId)) {
      const guild = <Guild> this.client.guilds.get(guildId);
      for (let [roleId, role] of guild.roles) {
        if (!data.some((r: Role) => r.id === roleId)) {
          guild.roles.delete(roleId);
        }
      }

      for (let raw of data) {
        let role: Role;
        if (guild.roles.has(raw.id)) {
          role = <Role> guild.roles.get(raw.id);
          role.merge(raw);
        } else {
          raw.guild_id = guildId;
          role = new Role(this.client, raw);
          guild.roles.set(role.id, role);
        }
        collection.set(role.id, role);
      }
    } else {
      for (let raw of data) {
        raw.guild_id = guildId;
        const role = new Role(this.client, raw);
        collection.set(role.id, role);
      }
    }
    return collection;
  }

  async fetchGuildTemplates(
    guildId: string,
  ): Promise<BaseCollection<string, Template>> {
    const data = await super.fetchGuildTemplates(guildId);
    const collection = new BaseCollection<string, Template>();

    for (let raw of data) {
      const template = new Template(this.client, raw);
      collection.set(template.code, template);
    }
    return collection;
  }

  async fetchGuildWebhooks(
    guildId: string,
  ): Promise<BaseCollection<string, Webhook>> {
    const data = await super.fetchGuildWebhooks(guildId);
    const collection = new BaseCollection<string, Webhook>();

    for (let raw of data) {
      const webhook = new Webhook(this.client, raw);
      collection.set(webhook.id, webhook);
    }
    return collection;
  }

  async fetchInvite(
    code: string,
    options: RequestTypes.FetchInvite = {},
  ): Promise<Invite> {
    const data = await super.fetchInvite(code, options);
    return new Invite(this.client, data);
  }

  async fetchMe(options: RequestTypes.FetchMe = {}): Promise<UserMe> {
    const data = await super.fetchMe.call(this, options);
    return new UserMe(this.client, data);
  }

  async fetchMeChannels(): Promise<BaseCollection<string, Channel>> {
    const data = await super.fetchMeChannels();
    const collection = new BaseCollection<string, Channel>();

    for (let raw of data) {
      let channel: Channel;
      if (this.client.channels.has(raw.id)) {
        channel = <Channel> this.client.channels.get(raw.id);
        channel.merge(raw);
      } else {
        channel = createChannelFromData(this.client, raw);
      }
      collection.set(channel.id, channel);
    }
    return collection;
  }

  async fetchMeConnections(): Promise<BaseCollection<string, ConnectedAccount>> {
    const data = await super.fetchMeConnections.call(this);
    const collection = new BaseCollection<string, ConnectedAccount>();
    for (let raw of data) {
      const account = new ConnectedAccount(this.client, raw);
      collection.set(account.key, account);
    }
    return collection;
  }

  async fetchMeGuilds(
    options: RequestTypes.FetchMeGuilds = {},
  ): Promise<BaseCollection<string, GuildMe>> {
    const data = await super.fetchMeGuilds(options);
    const collection = new BaseCollection<string, GuildMe>();

    for (let raw of data) {
      const guild = new GuildMe(this.client, raw);
      collection.set(guild.id, guild);
    }
    return collection;
  }

  async fetchMessage(
    channelId: string,
    messageId: string,
  ): Promise<Message> {
    const data = await super.fetchMessage(channelId, messageId);

    let guildId: string | undefined;
    if (this.client.channels.has(data.channel_id)) {
      const channel = <Channel> this.client.channels.get(data.channel_id);
      if (channel.guildId) {
        guildId = channel.guildId;
      }
    }

    let message: Message;
    if (this.client.messages.has(data.id)) {
      message = <Message> this.client.messages.get(data.id);
      message.merge(data);
    } else {
      data.guild_id = guildId;
      message = new Message(this.client, data);
    }
    return message;
  }

  async fetchMessages(
    channelId: string,
    options: RequestTypes.FetchMessages = {},
  ): Promise<BaseCollection<string, Message>> {
    const data = await super.fetchMessages(channelId, options);

    let guildId: string | undefined;
    if (data.length) {
      const raw = data[0];
      if (this.client.channels.has(raw.channel_id)) {
        const channel = <Channel> this.client.channels.get(raw.channel_id);
        if (channel.guildId) {
          guildId = channel.guildId;
        }
      }
    }

    const collection = new BaseCollection<string, Message>();
    for (let raw of data) {
      let message: Message;
      if (this.client.messages.has(raw.id)) {
        message = <Message> this.client.messages.get(raw.id);
        message.merge(raw);
      } else {
        raw.guild_id = guildId;
        message = new Message(this.client, raw);
      }
      collection.set(message.id, message);
    }
    return collection;
  }

  async fetchOauth2Applications(): Promise<BaseCollection<string, Oauth2Application>> {
    const data = await super.fetchOauth2Applications.call(this);

    const collection = new BaseCollection<string, Oauth2Application>();
    for (let raw of data) {
      const oauth2Application = new Oauth2Application(this.client, raw);
      collection.set(oauth2Application.id, oauth2Application);
    }
    return collection;
  }

  async fetchOauth2Application(
    userId: string = '@me',
  ): Promise<Oauth2Application> {
    const data = await super.fetchOauth2Application(userId);

    let oauth2Application: Oauth2Application;
    if (userId === '@me') {
      if (this.client.application) {
        oauth2Application = this.client.application;
        oauth2Application.merge(data);
      } else {
        oauth2Application = new Oauth2Application(this.client, data);
        this.client.application = oauth2Application;
      }
      if (oauth2Application.owner) {
        this.client.owners.clear();
        this.client.owners.set(oauth2Application.owner.id, oauth2Application.owner);
        if (oauth2Application.team) {
          for (let [userId, member] of oauth2Application.team.members) {
            this.client.owners.set(userId, member.user);
          }
        }
      }
    } else {
      oauth2Application = new Oauth2Application(this.client, data);
    }
    return oauth2Application;
  }

  async fetchOauth2ApplicationAssets(
    applicationId: string,
  ): Promise<BaseCollection<string, Oauth2ApplicationAsset>> {
    const data = await super.fetchOauth2ApplicationAssets(applicationId);

    const collection = new BaseCollection<string, Oauth2ApplicationAsset>();
    for (let raw of data) {
      raw.application_id = applicationId;
      const asset = new Oauth2ApplicationAsset(this.client, raw);
      collection.set(asset.id, asset);
    }
    return collection;
  }

  async fetchPinnedMessages(
    channelId: string,
  ): Promise<BaseCollection<string, Message>> {
    const data = await super.fetchPinnedMessages(channelId);

    let guildId: null | string = null;
    if (data.length) {
      const raw = data[0];
      if (this.client.channels.has(raw.channel_id)) {
        const channel = <Channel> this.client.channels.get(raw.channel_id);
        guildId = channel.guildId;
      }
    }

    const collection = new BaseCollection<string, Message>();
    for (let raw of data) {
      let message: Message;
      if (this.client.messages.has(raw.id)) {
        message = <Message> this.client.messages.get(raw.id);
        message.merge(raw);
      } else {
        raw.guild_id = guildId;
        message = new Message(this.client, raw);
      }
      collection.set(message.id, message);
    }
    return collection;
  }

  async fetchStoreApplicationAssets(
    applicationId: string,
  ): Promise<BaseCollection<string, StoreApplicationAsset>> {
    const data = await super.fetchStoreApplicationAssets(applicationId);

    const collection = new BaseCollection<string, StoreApplicationAsset>();
    for (let raw of data) {
      raw.application_id = applicationId;
      const asset = new StoreApplicationAsset(this.client, raw);
      collection.set(asset.id, asset);
    }
    return collection;
  }

  async fetchReactions(
    channelId: string,
    messageId: string,
    emoji: string,
    options: RequestTypes.FetchReactions = {},
  ): Promise<BaseCollection<string, User>> {
    const data = await super.fetchReactions(channelId, messageId, emoji, options);
    const collection = new BaseCollection<string, User>();
    for (let raw of data) {
      let user: User;
      if (this.client.users.has(raw.id)) {
        user = <User> this.client.users.get(raw.id);
        user.merge(raw);
      } else {
        user = new User(this.client, raw);
      }
      collection.set(user.id, user);
    }
    return collection;
  }

  async fetchTeam(teamId: string): Promise<Team> {
    const data = await super.fetchTeam(teamId);
    return new Team(this.client, data);
  }

  async fetchTeamMembers(teamId: string): Promise<BaseCollection<string, TeamMember>> {
    const data: Array<any> = await super.fetchTeamMembers(teamId);
    const collection = new BaseCollection<string, TeamMember>();
    for (let raw of data) {
      collection.set(raw.user.id, new TeamMember(this.client, raw));
    }
    return collection;
  }

  async fetchTeamMember(teamId: string, userId: string): Promise<TeamMember> {
    const data = await super.fetchTeamMember(teamId, userId);
    return new TeamMember(this.client, data);
  }

  async fetchTemplate(templateId: string): Promise<Template> {
    const data = await super.fetchTemplate(templateId);
    return new Template(this.client, data);
  }

  async fetchUser(
    userId: string,
  ): Promise<User> {
    const data = await super.fetchUser(userId);
    let user: User;
    if (this.client.users.has(data.id)) {
      user = <User> this.client.users.get(data.id);
      user.merge(data);
    } else {
      user = new User(this.client, data);
    }
    return user;
  }

  async fetchUserProfile(userId: string): Promise<Profile> {
    const data = await super.fetchUserProfile(userId);
    return new Profile(this.client, data);
  }

  async fetchVoiceRegions(
    guildId?: string,
  ): Promise<BaseCollection<string, VoiceRegion>> {
    const data = await super.fetchVoiceRegions(guildId);
    const regions = new BaseCollection<string, VoiceRegion>();
    for (let raw of data) {
      const region = new VoiceRegion(this.client, raw);
      regions.set(region.id, region);
    }
    return regions;
  }

  async fetchWebhook(
    webhookId: string,
  ): Promise<Webhook> {
    const data = await super.fetchWebhook(webhookId);
    return new Webhook(this.client, data);
  }

  async fetchWebhookToken(
    webhookId: string,
    token: string,
  ): Promise<Webhook> {
    const data = await super.fetchWebhookToken(webhookId, token);
    return new Webhook(this.client, data);
  }
}
