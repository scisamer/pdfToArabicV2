// libs
const { Context, Telegraf, Markup } = require('telegraf');
const { session } = require('telegraf');
const db = require('../db');

async function security(ctx, next) {
	if (ctx.session == undefined) ctx.session = {};

	if ( !ctx.message ) return next();
	var uid = ctx.message.from.id;

	var usr = await db.users.asyncFindOne({ id: uid });
	if (usr !== null) ctx.session.group = usr.group;
	ctx.session.isAdmin = ctx.session.group == 'admin' || ctx.session.group == 'dev';
	ctx.session.isDev = ctx.session.group == 'dev';

	next();
}

module.exports = security;