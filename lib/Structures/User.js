const BaseStructure = require('./BaseStructure.js');

const Utils = require('../Utils');
const Constants = Utils.Constants;

const def = {
    id: null,
    username: '...',
    discriminator: '0000',
    avatar: null,
    bot: false
};

class User extends BaseStructure
{
    constructor(client, raw)
    {
        super(client, Object.assign({}, def, raw));
    }

    get createdAt()
    {
        return new Date(this.createdAtUnix);
    }

    get createdAtUnix()
    {
        return Utils.Snowflake.timestamp(this.id);
    }

    get mention()
    {
        return `<@${this.id}>`;
    }

    get defaultAvatarURL()
    {
        return `${Constants.Endpoints.CDN.URL}${Constants.Endpoints.CDN.AVATAR_DEFAULT(this.discriminator % 5)}`;
    }

    get avatarURL()
    {
        return this.avatarURLFormat();
    }

    avatarURLFormat(format)
    {
        const hash = this.avatar;
        if (!hash) {return this.defaultAvatarURL;}

        if (!format) {
            format = this.client.options.imageFormat || 'png';
            if (hash.slice(0, 2) === 'a_') {
                format = 'gif';
            }
        }
        format = format.toLowerCase();
        
        const valid = ['png', 'jpeg', 'jpg', 'webp', 'gif'];
        if (!valid.includes(format)) {
            throw new Error(`Invalid format: '${format}', valid: ${JSON.stringify(valid)}`);
        }
        return `${Constants.Endpoints.CDN.URL}${Constants.Endpoints.CDN.AVATAR(this.id, hash, format)}`;
	}

	createDm()
	{
		return this.client.rest.endpoints.createDm(this.id);
	}
	
	sendMessage(data)
	{
		return new Promise((resolve, reject) => {
			const channel = this.client.channels.find((c) => {
				return c.isDmSingle && c.recipients.has(this.id);
			});

			if (channel) {
				resolve(channel);
			} else {
				this.createDm().then(resolve).catch(reject);
			}
		}).then((channel) => {
			return channel.createMessage(data);
		});
	}

    toString()
    {
        return `${this.username}#${this.discriminator}`;
    }
}

module.exports = User;