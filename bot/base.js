const fs = require("fs");
const db = require('../db');
const request = require('request-promise');
const { parse, HTMLElement  } = require('node-html-parser');

const pdfparse = require('pdf-parse');
const htmlToPdf = require("../adds/html-pdf");
const translate = require('../adds/arApi2');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function base(ctx, next) {
	if (!ctx.message) return next();
	var text = ctx.message.text;
	var uid = ctx.message.from.id;

	if (text == "/help") return ctx.reply(`حساب الدعم والمساعدة: @snapdox`);
	if (ctx.session.isWorking) return ctx.reply(`لم يترجم الملف: انتظر انتهاء العملية الجارية`);

	if (text == "/start") return ctx.reply(`ارسل الملف بصيغة PDF او قم بتحويل اي ملف الي`);

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
	// var words = text.split(/ +/);
	// var pars = [];
	// var limit = 27;
	// for (let i = 0; i < words.length; i += limit) {
	// 	let t = [];
	// 	for (let o = 0; o < limit; o++) {
	// 		if (words[o + i] === undefined) break;
	// 		t.push(words[o + i]);
	// 	}
	// 	pars.push(t.join(' '));
	// }
	var arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFBC2\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFC\uFE70-\uFE74\uFE76-\uFEFC]/g;
	var pars = text.split(/[.!?]/);
	 pars = pars.map(line => line.trim()).filter(line => line !== '');
	console.log('pars done');
	pars = pars.map(key => {
		return key.replace(/\n/g, ' ')
				.replace(arabicPattern, "");
	 });
	var pars_ar = [];

	// for (let o in pars) {
	// 	var en = pars[o];
	// 	var t = await translate(en);
	// 	if (t.error) t.ar = 'حدث خطأ في الترجمة!!';

	// 	pars_ar.push(t.ar);
	// 	//await delay(100);
	// }

	// ====================================
	var t = await translate(pars);
	if (t.error) {
		for (let i in pars) {
			pars_ar[i] = "تعتذرت الترجمة !!";
		}
	}
	else pars_ar = t.ar;
	pars_ar = pars_ar.map(key => { return key.replace(/\n/g, '<br>') });

	console.log('pars_ar done');
	//box-shadow: 1px 1px 9px 0px #888888;

	// HTML
	var html = fs.readFileSync("./accest/pdf.html", "UTF-8");
	const root = parse(html);
	var mainDiv = root.querySelector("#root");
	var en_spanM = root.querySelector("#en");
	var ar_spanM = root.querySelector("#ar");
	for (let o in pars) {
		let ar_div = ar_spanM.clone();
		let en_div = en_spanM.clone();

		ar_div.querySelector("span").set_content(pars_ar[o]);
		en_div.querySelector("span").set_content(pars[o]);

		mainDiv.appendChild(en_div);
		mainDiv.appendChild(ar_div);

	}

	en_spanM.remove();
	ar_spanM.remove();
	html = root.toString();


	//console.log(pages[0]);


	const sendFileAsHtml = () => {
		//console.log('done html');
		var htmlbuffer = Buffer.from(html, "utf8");
		ctx.replyWithDocument({ source: htmlbuffer, filename: `${name}.html` });
	}
	try {
		ctx.session.isWorking = false;
		// console.log(html);
		var pdfbuffer = await htmlToPdf(html);
		// htmlpdf.create(html, { format: 'A4' }).toBuffer(function(err, buffer) {
		// 	if (err) return sendFileAsHtml();

		// 	//fs.writeFileSync('demopdf.pdf', buffer)
		// 	sendFileAsHtml();
		// 	console.log('done');
		// 	ctx.replyWithDocument({ source: buffer, filename: `${name}.pdf` });

		// });

			// sendFileAsHtml();
			console.log('done');
			await ctx.replyWithDocument({ source: pdfbuffer, filename: `${name}.pdf` });

	} catch (e) {
		sendFileAsHtml();
	}



	return next();
}

module.exports = base;