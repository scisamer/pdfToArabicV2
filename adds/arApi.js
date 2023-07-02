const request = require('request-promise');

async function translate(en) {
	const options = {
  method: 'POST',
  url: 'https://deep-translate1.p.rapidapi.com/language/translate/v2',
  headers: {
    'content-type': 'application/json',
    'X-RapidAPI-Key': 'fae2020b3bmsh74316646196d127p135c40jsn464127014c11',
    'X-RapidAPI-Host': 'deep-translate1.p.rapidapi.com',
    useQueryString: true
  },
  body: {q: en, source: 'en', target: 'ar'},
  json: true
};
	var error = false;
try {
	var result = await request(options);
} catch(e) {error = true;}

	try {
		var ar = result.data.translations.translatedText;
	} catch(e) {error = true};

	return {ar, error};
	

}

module.exports = translate;