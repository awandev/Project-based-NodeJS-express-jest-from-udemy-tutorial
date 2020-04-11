const express = require('express');
const app = express();
const path = require('path')
const puppeteer = require('puppeteer')
const cheerio = require('cheerio')

let browser;

app.set('views', path.join(__dirname, 'views'))
app.set('view engine','ejs')
app.use(express.static('public'))

async function scrapeData(url, page) {
    try {
        await page.goto(url, {waitUntil: 'load', timeout: 0});
        const html = await page.evaluate(() => document.body.innerHTML);
        const $ = cheerio.load(html);

        let title = $("h2").text();
        let releaseDate = $(".release_date").text();
        let overview = $(".overview > p").text();
        let userScore = $(".user_score_chart").attr("data-percent");
        let imgUrl = $("#original_header > div.poster_wrapper.true > div.poster > div.image_content.backdrop > img").attr("src")


        
 
        let crewLength = $("#original_header > div.header_poster_wrapper.true > section > div.header_info > ol > li").length;

        let crew = []
        for(let i=1; i<=crewLength; i++) {
            let name = $("#original_header > div.header_poster_wrapper.true > section > div.header_info > ol > li:nth-child("+i+") > p:nth-child(1) > a").text()

            let role = $("#original_header > div.header_poster_wrapper.true > section > div.header_info > ol > li:nth-child("+i+") > p.character").text()

            crew.push({
                "name" : name,
                "role" : role
            });
        }

        browser.close();

        return {
            title,
            releaseDate,
            overview,
            userScore,
            imgUrl,
            crew
        }
    } catch (error) {
        console.log(error)
    }
}



app.get('/results', async(req, res) => {
    let url = req.query.search;

    browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox'],
        executablePath: '/usr/bin/google-chrome-stable'
    });
    const page = await browser.newPage();

    let data = await scrapeData(url, page);
    res.render('results', {data:data})
})

app.get('/search', (req,res) => {
    res.render('search')
})



app.listen(3000, () => {
    console.log('Server started at port 3000')
})

