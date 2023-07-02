const { Context, session, Telegraf, Markup } = require('telegraf');
const fs = require("fs");
const db = require('../db');
const request = require('request-promise');
const { parse, HTMLElement  } = require('node-html-parser');

const pdfparse = require('pdf-parse');
var htmlpdf = require('html-pdf');
const htmlToPdf = require("../adds/html-pdf");
const translate = require('../adds/arApi2');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function base(ctx, next) {
	var text = ctx.message.text;
	var uid = ctx.message.from.id;
	console.log(uid);


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
	var pars = text.split(/[.!?]/);
	 pars = pars.map(line => line.trim()).filter(line => line !== '');
	console.log('pars done');
	pars = pars.map(key => { return key.replace(/\n/g, ' ') });
	var pars_ar = [];
	pars_ar = [
		'تأكيد تقديم DV-2024: تم استلام الإدخال بنجاح',
		'تم استلام مشاركتك لبرنامج تأشيرة التنوع لعام 2024 يوم السبت 8 أكتوبر 2022 الساعة 12:42:06 مساء بتوقيت شرق الولايات المتحدة',
		'يرجى عدم إغلاق هذه النافذة حتى تقوم بطباعة صفحة التأكيد هذه أو تسجيل رقم التأكيد الخاص بك',
		'اسم المشارك: كاظم، سامر جاسم رقم التأكيد: 20245CJDAFO22BHR سنة الميلاد: 1999 التوقيع الرقمي: FFD368EF0C1DD9CFF8729CA2D13A5978F3C7D05E شكرا لك على مشاركتك في برنامج تأشيرة التنوع لعام 2024',
		'يرجى إما طباعة هذه الصفحة أو تسجيل رقم التأكيد قبل إغلاق هذه النافذة',
		'لن تتمكن من استرداد هذا الرقم بعد إغلاق هذه النافذة',
		'يجب عليك الاحتفاظ برقم التأكيد الخاص بك من أجل التحقق من حالة دخولك عبر التحقق من حالة المشارك بين 6 مايو 2023 و 30 سبتمبر 2024 لتحديد ما إذا كان قد تم اختيار مشاركتك لمزيد من المعالجة في برنامج تأشيرة التنوع لعام 2024',
		'سيطلب منك إدخال رقم التأكيد الخاص بك مع معلومات شخصية أخرى للتحقق من حالة الدخول الخاصة بك',
		'لن يتلقى المختارون إشعارات أو رسائل مختارة عن طريق البريد العادي من مركز كنتاكي القنصلي (KCC)',
		'لا تقدم نماذج دخول إضافية مع هذا الشخص باعتباره المشارك الأساسي',
		'ستؤدي المشاركات المتعددة إلى استبعاد المشارك من المشاركة في برنامج تأشيرة التنوع لعام 2024'
	  ];

	// for (let o in pars) {
	// 	var en = pars[o];
	// 	var t = await translate(en);
	// 	if (t.error) t.ar = 'حدث خطأ في الترجمة!!';

	// 	pars_ar.push(t.ar);
	// 	//await delay(100);
	// }

	// ====================================
	// var t = await translate(pars);
	// if (t.error) {
	// 	for (let i in pars) {
	// 		pars_ar[i] = "تعتذرت الترجمة !!";
	// 	}
	// }
	// else pars_ar = t.ar;
	// pars_ar = pars_ar.map(key => { return key.replace(/\n/g, '<br>') });

	console.log('pars_ar done');
	//box-shadow: 1px 1px 9px 0px #888888;

	// HTML
	var html = fs.readFileSync("./accest/pdf.html", "UTF-8");
	const root = parse(html);
	var mainDiv = root.querySelector("#root");
	var en_spanM = root.querySelector("#en");
	var ar_spanM = root.querySelector("#ar");
	for (let o in pars) {
		console.log(en_spanM);
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

			sendFileAsHtml();
			console.log('done');
			ctx.replyWithDocument({ source: pdfbuffer, filename: `${name}.pdf` });

	} catch (e) {
		sendFileAsHtml();
	}



	return next();
}

module.exports = base;