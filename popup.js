import {html, render} from './node_modules/lit-html/lit-html.js';
import {unsafeHTML} from './node_modules/lit-html/directives/unsafe-html.js';


async function updateSpeiseplan() {
    var speiseplanHtml = await getSpeiseplanHtml();

    var htmlDoc = $.parseHTML(speiseplanHtml);  

    var blocks = $(htmlDoc).find('.ce_table');
    
    var speiseplan = [];

    blocks.each((index, block) => {
        var dateString = $(block).find('h4')[0].innerText;
        var dateTokens = dateString.split(' ')[1].split('.');
        var parseableDate = dateTokens[2] + '-' + dateTokens[1] + '-' + dateTokens[0] + 'T00:00:00';
        var date = new Date(parseableDate);

        var speiseplanDay = {
            day: $(block).find('h4')[0].innerHTML,
            date: date,
            readableDate: formatDay(date),
            food: []
        };

        var table = $(block).find('.table.table-responsive').first();

        var rows = $(table).find('tr');

        rows.each((rowIndex, row) =>  {
            var columns = $(row).find('td');

            speiseplanDay.food.push({
                content1: columns[0].innerText,
                content2: columns[1].innerText,
                calories: columns[2].innerText,
                price: columns[3].innerText
            });
        });

        speiseplan.push(speiseplanDay);
    });
    
    chrome.storage.local.set({ "speiseplan": speiseplan });
    render(mainTemplate(speiseplan), document.body);
}

function loadSpeiseplan() {
    chrome.storage.local.get('speiseplan', (items) => {
        if (!items.speiseplan) return;
        render(mainTemplate(items.speiseplan), document.body);
        console.log("today: " + formatDay(new Date()));
        scrollToToday();
    });
}


function getSpeiseplanHtml() {
    return new Promise((resolve, reject) => {
            $.get('https://fautzcatering.de/speiseplan/', (speiseplanHtml) => {
                resolve(speiseplanHtml)
            });
        })
}


function isSameDay(date1, date2) {
    return (date1.getFullYear() == date2.getFullYear() &&
            date1.getMonth() == date2.getMonth() &&
            date1.getDate() == date2.getDate())
}

function isToday(readableDate) {
    return readableDate == formatDay(new Date());
}

function formatDay(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-'+ date.getDate();
}

function scrollToToday() {
    var readableDate = formatDay(new Date());
    console.log('Scrolling to ' + readableDate + ' @ ' + $('#' + readableDate).offset().top + 'px')
    $('#speiseplan').animate({
        scrollTop: $('#' + readableDate).offset().top-55
    },200);
}

const foodTemplate = (food) => html`
    <tr>
        <td class="content"><b>${food.content1}</b> ${food.content2}</td>
        <td class="calories">${food.calories}</td>
        <td class="price">${unsafeHTML(food.price.replace("\n", "<br />"))}</td>
    </tr>
`;

const dayTemplate = (day) => html`
    <thead id="${day.readableDate}" class="${isToday(day.readableDate)? 'current' : ''}">
        <tr>
            <td colspan="3"><h4>${day.day} ${isToday(day.readableDate)? '- Heute' : ''}</h4></td>
        </tr>
    </thead>
    <tbody  class="${isToday(day.readableDate)? 'current' : ''}">
        ${day.food.map(food => foodTemplate(food))}
    </tbody>`;

const mainTemplate = (speiseplan) => html`
    <div class="header">
        <a href="https://fautzcatering.de/speiseplan/"></a><img class="logo" src="img/logo-32.png"></a>
        <h4 class="main">Speiseplan</h4>
    </div>
    <div id="speiseplan" class="speiseplan">
        <table>
            ${speiseplan.map(day => dayTemplate(day))}
        </table>
    </div>
`;

loadSpeiseplan();
updateSpeiseplan();