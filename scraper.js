//linked Node Modules
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const Json2csvParser = require('json2csv').Parser;

//declared global variables
// variables include dates for usage in when the links were gotten and file creation

const links = [];
const today = new Date();
const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
const time = new Date().toLocaleTimeString();
const shirtinfo = [];
const fields = ['Title', 'Price', 'Link', 'ImageURL', 'Time'];
const errorMessage = `[${today}] There’s been a 404 error. Cannot connect to http://shirts4mike.com.`;


function errorMessageLogger() {
    console.log(errorMessage);
    fs.appendFile(`scraper-error.log`, errorMessage, function (err) {
        if (err) {
            console.log(err);
        }
        console.log("The error file was saved!");
        console.log(errorMessage);
    });
}

//Scraper

//First request goes to site


request('http://shirts4mike.com/shirts.php', function (error, response, html) {
    if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        //finds each link
        $('ul.products li').each(function (i, element) {
            const link = $(this).children().attr('href');
            //pushes each link for t shirt into array
            links.push(link);
        });
    } else {
        errorMessageLogger()
    }

    const start = new Date().getTime();

    //loop to scrape each link for tshirt details
    //loops over each link
    //starts a timer for scraping
    links.forEach((link) => {


        request(`http://shirts4mike.com/` + link, function (error, response, html) {
            if (!error && response.statusCode == 200) {
                const $link = cheerio.load(html);
                //finds links, prices, titles, imageurls, and creates an object for each
                let Link = `http://shirts4mike.com/${link}`;
                let price = $link('.price').text();
                let Title = $link('.shirt-details h1').text().slice(4);
                let ImageURL = $link('.shirt-picture span img').attr('src');
                metadata = {
                    Title: Title,
                    Price: price,
                    Link: Link,
                    ImageURL: ImageURL,
                    Time: time + " " + date
                };
            } else {
                errorMessageLogger()

            }
            //pushes each object to the shirt info array

            shirtinfo.push(metadata);

        });
    })

    //ends timer so that array is only saved when finished
    const end = new Date().getTime();

    if (!error && response.statusCode == 200) {
        const time = end - start;
        //takes the returned array and parses it with the set fields as column headers
        //only runs when the scraping is done
        setTimeout(() => {
            const json2csvParser = new Json2csvParser({ fields });
            const csv = json2csvParser.parse(shirtinfo);
            //creates a file with the name of the date. if its the same date as original, 
            //such as if it is run twice it overwrites, but if its a new date it creates 
            //a new file
            fs.writeFile(`data/${date}.csv`, csv, function (err) {
                if (err) {
                    errorMessageLogger()
                }

                console.log("The file was saved!");
                console.log(today);
            });
        }, time * 1000);
    }
});







