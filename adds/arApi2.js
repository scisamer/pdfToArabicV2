const request = require('request-promise');

async function translate(en) {
  var body = en.map( k => {
    return {Text:k}
  });
	const options = {
  method: 'POST',
  url: 'https://microsoft-translator-text.p.rapidapi.com/translate',
  qs: {
    'to[0]': 'ar',
    'api-version': '3.0',
    from: 'en',
    profanityAction: 'NoAction',
    textType: 'html'
  },
  headers: {
    'content-type': 'application/json',
    'X-RapidAPI-Key': 'fae2020b3bmsh74316646196d127p135c40jsn464127014c11',
    'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com'
  },
  body: body,
  json: true
};
	var error = false;
try {
	var result = await request(options);
} catch(e) {
  throw e;
  error = true;
}

	try {
		var ar = result.map( k => {
      return k.translations[0].text;
    })
	} catch(e) {error = true};

	return {ar, error};


}

module.exports = translate;