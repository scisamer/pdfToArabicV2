const { Context, session, Telegraf, Markup } = require('telegraf');
const fs = require("fs");
const db = require('./db');
const axios = require('axios');
const request = require('request-promise');

const pdfparse = require('pdf-parse');
var htmlpdf = require('html-pdf')
const translate = require('./adds/arApi');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));



async function base(ctx, next) {

	var text = ctx.message.text;
	var uid = ctx.message.from.id;

	if (ctx.session.isWorking) return ctx.reply(`لم يترجم الملف: انتظر انتهاء العملية الجارية`);

	if (text == "/start") return ctx.reply(`ارسل الملف بصيغة pdf`);

	// ================================= اذا مو ملف =============================== //
	if (!ctx.message.document) return ctx.reply(`لقد ارسلت رسالة نصية يجب عليك ارسال ملف (مستند) لترجمته`);
	// ================================ اذا نوع الملف مو PDF ============================= //
	if (ctx.message.document.mime_type !== "application/pdf") {
		return ctx.reply(`لقد ارسلت ملف غير مدعوم، يمكنك حاليًا ترجمة ملفات PDF فقط`);
	}

	//console.log(ctx.message.document);
	//======================= اذا حجم الملف اكبر من 12 ميكا ======================================
	var file_size = ctx.message.document.file_size / 1000000;
	if (file_size > 12) return ctx.reply(`المستند المرسل كبير جدًا، يجب ارسل ملف لا يتجاوز حجمه 12MB`);
	var name = ctx.message.document.file_name
		.replace('.pdf', '_ar');

	//================================ رسالة انتظار  ==========================================
	ctx.reply(`يتم ترجمة الملف الآن، انتظر ...`);
	ctx.session.isWorking = true;

	//===================== احضار رابط الملف من خلال الايدي =================================
	var url = await ctx.telegram.getFileLink(ctx.message.document.file_id);

	//=========================== احضار المف من خلال الرابط =================================
	const response = await request.get(url.href, { encoding: null });
	//console.log(response);

	var result = await pdfparse(response);
	var text = result.text
		.trim();

	if (!text || text.match(/[a-z]/g) == null) {
		ctx.session.isWorking = false;
		return ctx.reply(`لم يتم العثور على اي نص باللغة الانكيزية`);
	}
	var words = text.split(/ +/);
	var pars = [];
	var limit = 27;
	for (let i = 0; i < words.length; i += limit) {
		let t = [];
		for (let o = 0; o < limit; o++) {
			if (words[o + i] === undefined) break;
			t.push(words[o + i]);
		}
		pars.push(t.join(' '));
	}
	console.log('pars done');
	pars = pars.map(key => { return key.replace(/\n/g, '<br>') });
	var pars_ar = [];

	for (let o in pars) {
		var en = pars[o];
		var t = await translate(en);
		if (t.error) t.ar = 'حدث خطأ في الترجمة!!';

		pars_ar.push(t.ar);
		//await delay(100);

	}
	pars_ar = pars_ar.map(key => { return key.replace(/\n/g, '<br>') });
	console.log('pars_ar done');
	//box-shadow: 1px 1px 9px 0px #888888;
	var span = "";
	for (let o in pars) {
		span += `<span style="font-size: 12pt; border: 1px solid #cc0000; display: inline-block; padding: 10px; ">${pars[o]}</span>`;

		span += `<br>
<br>`;


		span += `<div style="text-align: center;""><span style="font-size: 12pt; border: 1px solid #3399ff; display: inline-block; padding: 10px; ">${pars_ar[o]}</span></div>`;
		span += `<hr>`;

	}

	var botstyle = `<div style="text-align: center;">
<a href="https://t.me/scicc9"><span style="background-color:blue; color:#9966ff; font-size:11pt; padding: 10px; box-shadow: 1px 1px 9px 0px #888888;">Bot Name</span></a>
</div>`;




	//console.log(pages[0]);
	// HTML
	var html = `<!DOCTYPE html>
<html lang="ar">
	<head>
		<meta charset="UTF-8" />
		<title>Document</title>
	</head>
	<body>
${span}<br><br>${botstyle}
 </body>
</html>`;

	const sendFileAsHtml = () => {
		//console.log('done html');
		var htmlbuffer = Buffer.from(html, "utf8");
		ctx.replyWithDocument({ source: htmlbuffer, filename: `${name}.html` });
	}
	try {
		ctx.session.isWorking = false;
		console.log(html);
		htmlpdf.create(html, { format: 'A4' }).toBuffer(function(err, buffer) {
			if (err) return sendFileAsHtml();

			//fs.writeFileSync('demopdf.pdf', buffer)
			console.log('done');
			ctx.replyWithDocument({ source: buffer, filename: `${name}.pdf` });

		});

	} catch (e) {
		sendFileAsHtml();
	}



	return next();
}

module.exports = base;