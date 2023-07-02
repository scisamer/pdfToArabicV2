// libs
const { Context, Telegraf, Markup } = require('telegraf');
const { session } = require('telegraf');
const { Keyboard } = require('telegram-keyboard');
var fs = require("fs");
const db = require('./db');

// vars
const admin = require('./admin');
const base = require('./base');
const security = require('./security');


const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());

// bot.use(ctx => {
// 	fs.writeFileSync( './results.json', JSON.stringify( ctx, null, 4 ), 'UTF-8' );
// })

// نقطة امان
bot.use( security );

//ملفات الاضافات
bot.use( admin );
bot.use( base );

//================  Admin Conpnel ======================
bot.launch();