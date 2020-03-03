const cheerio = require('cheerio');

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

module.exports = function (googleData, pageHTML) {
    const $ = cheerio.load(pageHTML);
    let homepage = $('.homepage a').attr('href')
    let profiles = [googleData.link];

    if (homepage) {
        profiles.push(homepage);
    }

    $('.social_rating .info .meta .description a').map((i, item) => profiles.push( $(item).attr('href') ));

    let userData = {
        name: $('.user_name a').text(),
        nickname: $('.avatar img').attr('alt'),
        image: $('.avatar img').attr('src'),
        position: $('div.profession').text(),
        age: parseInt($('.experience_and_age .row:nth-child(2) .value').text()) || false,
        experience: parseInt($('.experience_and_age .row:nth-child(3) .value').text()) || false,
        location: $('.location .geo').text(),
        profiles: profiles,
        about: $('.about_user_text').text(),
        skills: $('.skills .skill').map( (i, item) =>$(item).text() ).get().filter(onlyUnique)
    };

    return userData;
};