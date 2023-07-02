const rp = require('request-promise');
const request = rp.defaults({
	headers: {
		"accept": "*/*",
		"accept-language": "ar,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
		"content-type": "application/x-www-form-urlencoded",
		"sec-ch-ua": "\" Not;A Brand\";v=\"99\", \"Microsoft Edge\";v=\"103\", \"Chromium\";v=\"103\"",
		"sec-ch-ua-arch": "\"x86\"",
		"sec-ch-ua-bitness": "\"64\"",
		"sec-ch-ua-full-version": "\"103.0.1264.37\"",
		"sec-ch-ua-mobile": "?0",
		"sec-ch-ua-model": "",
		"sec-ch-ua-platform": "\"Windows\"",
		"sec-ch-ua-platform-version": "\"7.0.0\"",
		"sec-fetch-dest": "empty",
		"sec-fetch-mode": "cors",
		"sec-fetch-site": "same-origin",
		"x-edge-shopping-flag": "1",
		'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.53 Safari/537.36 Edg/103.0.1264.37',

	}
})


var Cookie = require('request-cookies').Cookie;

async function translate(en) {

	//################### Get Headers ##################################
	var res = await request.get({
		url: 'https://www.bing.com/translator',
		resolveWithFullResponse: true
	});
	var IG = res.body.match(/IG:"(.+?)"/);

	if (IG === null) return { error: 'IG' };

	var parm = res.body.match(/params_RichTranslateHelper = \[(.+?),"(.+?)"/);
	if (parm === null) return { error: 'parm' };
	var key = parm[1];
	var token = parm[2];
	var rawcookies = res.headers["set-cookie"];
	//console.log(res.headers["set-cookie"]);
	var text = "";
	for (var i in rawcookies) {
		var cookie = new Cookie(rawcookies[i]);
		text += `${cookie.key}=${cookie.value}`;
		if (text !== "") text += "; ";
	}
	// console.log(text, i);
	// console.log(IG[1]);

	//#######################3
	var url = `https://www.bing.com/ttranslatev3?isVertical=1&&IG=${IG[1]}&IID=translator.5023.3`;
	try {
		
	
	var data = await request.post({
		url: url,
		headers: {
			"Referer": "https://www.bing.com/translator",
			"Referrer-Policy": "origin-when-cross-origin",
			"Cookie": text,

		},
		body: `&fromLang=en&text=${en.trim()}&to=ar&token=${token}&key=${key}`,
		json: true,
	});
	} catch(e) {
		data = [];
	}

	if (data[0] === undefined) return { error: true };

	return { ar: data[0].translations[0].text, error: false };








}





module.exports = translate;