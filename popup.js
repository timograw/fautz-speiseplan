    import {html, render} from './node_modules/lit-html/lit-html.js';
import {unsafeHTML} from './node_modules/lit-html/directives/unsafe-html.js';


async function updateSpeiseplan() {
    var currentSpeiseplan = await parseSpeiseplan('https://fautzcatering.de/speiseplan/');
    var nextSpeiseplan = await parseSpeiseplan('https://fautzcatering.de/speiseplan-naechste-woche/');

    var speiseplan = currentSpeiseplan.concat(nextSpeiseplan);
    
    chrome.storage.local.set({ "speiseplan": speiseplan });
    render(mainTemplate(speiseplan), $('#speiseplan').get(0));
    scrollToToday(200);
}


async function parseSpeiseplan(url) {
    var speiseplanHtml = await getHtml(url);

    var htmlDoc = $.parseHTML(speiseplanHtml);  

    var blocks = $(htmlDoc).find('.ce_table');
    
    var speiseplan = [];

    blocks.each((index, block) => {
        var dateString = $(block).find('h4')[0].innerText;
        var dateTokens = dateString.match(/\d{2}\.\d{2}\.\d{4}/)[0].split('.');
        var parseableDate = dateTokens[2] + '-' + dateTokens[1] + '-' + dateTokens[0] + 'T00:00:00';
        var date = new Date(parseableDate);

        var speiseplanDay = {
            day: $(block).find('h4')[0].innerHTML,
            date: date,
            readableDate: formatDay(date),
            food: [],
            endOfWeek: (index == 4)
        };

        var table = $(block).find('.table.table-responsive').first();

        var rows = $(table).find('tr');

        rows.each((rowIndex, row) =>  {
            var columns = $(row).find('td');

            if (columns[0].innerHTML && columns[0].innerHTML != '&nbsp;')
                speiseplanDay.food.push({
                    content1: columns[0].innerText,
                    content2: columns[1].innerText.replace('&nbsp;', ' '),
                    calories: columns[2].innerText.replace('p>','').replace(' *a', ''),
                    price: columns[3].innerText
                });
        });

        speiseplan.push(speiseplanDay);
    });

    return speiseplan;
}


function getHtml(url) {
    return new Promise((resolve, reject) => {
            $.get(url, (speiseplanHtml) => {
                resolve(speiseplanHtml)
            });
        })
}


function loadSpeiseplan() {
    chrome.storage.local.get('speiseplan', (items) => {
        if (!items.speiseplan) return;
        render(mainTemplate(items.speiseplan), $('#speiseplan').get(0));
        scrollToToday(0);
    });
}


function foodIconNameForContent(content) {
    content = content.toLowerCase();

    if (content.includes("spaghetti"))
        return "spaghetti.svg";

    if (content.includes("tacco"))
        return "taco.svg";

    if (content.includes("burger"))
        return "hamburger.svg";

    if (content.includes("hot dog") || content.includes("frikandel"))
        return "hot-dog.svg";

    if (content.includes("currywurst"))
        return "currywurst.png";

    if (content.includes("pizza") && !content.includes("pizzasuppe"))
        return "pizza.svg";

    if (content.includes("curry") &&
        !content.includes("wurst") &&
        !content.includes("vegetarisch") &&
        !content.includes("currydip") &&
        !content.includes("curryreis") &&
        !content.includes("curryketchup"))
        return "curry-rice.svg";

    if (content.includes("rind") ||
        content.includes("hackfleisch") ||
        (content.includes("steak") && !content.includes("hähnchensteak") && !content.includes("schweinesteak")) ||
        content.includes("pfannenfrikadelle") ||
        content.includes("gulasch"))
        return "cut-of-meat.svg";

    if (content.includes("hähnchen") ||
        content.includes("hänchen") ||
        content.includes("huhn") ||
        content.includes("geflügel") ||
        content.includes("pute") ||
        content.includes("hühner") ||
        content.includes("döner"))
        return "poultry-leg.svg";

    if (content.includes("schwein") ||
        content.includes("krüstchen") ||
        content.includes("schinken") ||
        content.includes("wurst") ||   
        content.includes("gyros") ||
        content.includes("käsegriller") ||
        content.includes("leberkäse") ||
        content.includes("würstchen") ||
        content.includes("spanferkel") ||
        content.includes("kasseler") ||
        content.includes("mett"))
        return "meat-on-bone.svg";

    if (content.includes("fisch") ||
        content.includes("lachs") ||
        content.includes("hering") ||
        content.includes("rotbarsch") ||
        content.includes("scholle") ||
        content.includes("forelle") ||
        content.includes("meeresfrüchte") ||
        content.includes("kibbelinge") ||
        content.includes("barsch") ||
        content.includes("seehecht"))
        return "fish.svg";

    if (content.includes("wild"))
        return "boar.svg";

    if (content.split("|")[0].includes("salat"))
        return "green-salad.svg";

    if (content.includes("vegetarisch") || content.includes("kartoffelpuffer"))
        return "seedling.svg";

    if (content.includes("feiertag"))
        return "party-popper.svg"

    if (content.includes("ostertage") || content.includes("ostermontag"))
        return "rabbit.svg";

    if (content.includes("pfingstmontag"))
        return "ghost.svg";

    if (content.includes("reformationstag"))
        return "jack-o-lantern.svg";

    return "seedling.svg";
}


const formatDay = (date) =>
    date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

const isToday = (readableDate) => (readableDate == formatDay(new Date()))


function scrollToToday(delay) {
    var readableDate = formatDay(new Date());
    $('#content').animate({
        scrollTop: $('#' + readableDate).position().top
    }, delay);
}


const foodTemplate = (food) => html`
    <tr>
        <td class="icon"><img src="img/food/${foodIconNameForContent(food.content1 + "|" + food.content2)}"></img></td>
        <td class="content"><b>${DOMPurify.sanitize(food.content1)}</b> ${DOMPurify.sanitize(food.content2.replace('&nbsp;',' '))}</td>
        <td class="calories">${DOMPurify.sanitize(food.calories).replace('&nbsp;',' ')}</td>
        <td class="price">${unsafeHTML(DOMPurify.sanitize(food.price).replace("\n", "<br />"))}</td>
    </tr>
`;

const dayTemplate = (day) => html`
    <thead id="${day.readableDate}" class="${isToday(day.readableDate)? 'current' : ''}">
        <tr>
            <td colspan="4"><h4>${DOMPurify.sanitize(day.day)} ${isToday(day.readableDate)? '- Heute' : ''}</h4></td>
        </tr>
    </thead>
    <tbody  class="${isToday(day.readableDate)? 'current' : ''}">
        ${day.food.map(food => foodTemplate(food))}
    </tbody>
    ${(day.endOfWeek)? endOfWeekTemplate():''}`;

const endOfWeekTemplate = () => html`
    <thead>
        <tr>
            <td colspan="4" class="weekend"><h4>Wochenende</h4></td>
        </tr>
    </thead>
`;

const mainTemplate = (speiseplan) => html`
    <table>
        ${speiseplan.map(day => dayTemplate(day))}
    </table>
`;

loadSpeiseplan();
updateSpeiseplan();
