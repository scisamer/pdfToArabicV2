// libs
const { Context, Telegraf, Markup } = require('telegraf');
const { session } = require('telegraf');
const { Keyboard } = require('telegram-keyboard');
var fs = require("fs");
const db = require('./db');

// vars
const admin = require('./bot/admin');
const base = require('./bot/base');
const security = require('./bot/security');
const anlysis = require('./bot/anlysis');

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
});

// const bot = new Telegraf(process.env.BOT_TOKEN);
const bot = new Telegraf('5666253039:AAG_6VG8zmpsNeJile7Tm3LcdXK2p2tN3bE');


bot.use(session());

// bot.use(ctx => {
// 	fs.writeFileSync( './results.json', JSON.stringify( ctx, null, 4 ), 'UTF-8' );
// })

// نقطة امان
bot.use( security );
bot.use( anlysis );
//ملفات الاضافات
bot.use( admin );
bot.use( base );



//================  Admin Conpnel ======================
bot.launch();