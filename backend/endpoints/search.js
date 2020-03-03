const {google} = require('googleapis');
const axios = require('axios');
const customsearch = google.customsearch('v1');
const parser = require('../parsers');

async function fetchAllUrls(urls) {
    let axisosRequests = urls.map( url => axios.get(url) );
    return axios.all(axisosRequests);
}
async function runSearch(options) {
    const searchResponse = await customsearch.cse.list({
        cx: options.cx,
        q: options.q,
        auth: options.apiKey,
    });

    let googleItems = searchResponse.data.items;
    let urls = googleItems.map( item => item.link );

    let scrapResults = await fetchAllUrls(urls);
    let scrapData = scrapResults.map( (response, index) => {
        let pageHTML = response.data;
        let googleData = googleItems[index];

        return parser(googleData, pageHTML);
    });

    return scrapData;
}
function makeBooleanRequest(options) {
    const siteSpecificQueries = {
        'moikrug.ru': 'site:moikrug.ru AND -inurl:*/vacancies/* AND -inurl:*/companies* AND -inurl:*/resumes* AND -inurl:*/courses*'
    };

    const cityAliases = {
        'Москва': ['Москва', 'Moscow', 'Msk', 'Мск']
    };

    let booleanRequestParts = [];

    if (options.site) {
        options.site.forEach((site) => {
            booleanRequestParts.push(siteSpecificQueries[site] || 'site:'+site);
        });
    }

    if (options.location) {
        let cityQuery = cityAliases[options.location]
            ? cityAliases[options.location].join(' OR ')
            : options.location;

        booleanRequestParts.push( cityQuery );
    }

    if (options.profession) {
        booleanRequestParts.push( '\"' + options.profession.join('\" OR \"') + '\"');
    }

    if (options.skills) {
        booleanRequestParts.push( '\"' + options.skills.join('\" AND \"') + '\"');
    }

    let booleanQuery = "(" + booleanRequestParts.join(") AND (") + ")";

    return booleanQuery;
}
function isEmptyKey(key, object) {
    let isUndefined = object[key] == 'undefined';
    if (isUndefined) {
        return true;
    }

    let isEmptyArray = object[key] && object[key] instanceof Array && object[key].length === 0;
    if (isEmptyArray) {
        return true;
    }

    return !Boolean(object[key]);
}

module.exports = async function (ctx, next) {
    /*let requestOptions = {
        site: 'moikrug.ru',
        skills: ['Sharepoint', 'HTML', 'CSS', 'JavaScript', 'C#', 'ASP.NET'],
        profession: ['Разработчик', 'Программист', 'Консультант', 'Developer', 'Инженер', 'Архитектор'],
        location: "Москва"
    };*/

    let requestOptions = ctx.request.body;
    console.log(requestOptions);

    let isEmpty = !requestOptions || (
        isEmptyKey('site', requestOptions) &&
        isEmptyKey('skills', requestOptions) &&
        isEmptyKey('profession', requestOptions) &&
        isEmptyKey('location', requestOptions)
    );

    if (isEmpty) {
        ctx.body = {error: 'request is empty'};
        return;
    }

    let booleanRequest = makeBooleanRequest(requestOptions);

    const options = {
        q: booleanRequest,
        apiKey: process.env.GOOGLE_CSE_API_KEY,
        cx: process.env.GOOGLE_CSE_CX,
    };

    let peopleData = await runSearch(options).catch(console.error);

    ctx.body = peopleData;
};

