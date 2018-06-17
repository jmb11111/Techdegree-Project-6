
var fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const Json2csvParser = require('json2csv').Parser;
let links =[];
const today = new Date(); 
const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
const d = new Date().toLocaleTimeString();
// var jsonexport = require('jsonexport');
const shirtinfo =[];
 

request('http://shirts4mike.com/shirts.php', function (error, response, html) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(html);
    $('ul.products li').each(function(i, element){
      const link = $(this).children().attr('href');
      links.push(link);
    });
  } else{
      console.log(`There’s been a 404 error. Cannot connect to http://shirts4mike.com.`)
  }

const start = new Date().getTime();

const fields = ['Title','Price','Link','ImageURL', 'Time'];
links.forEach((link)=> {
    

request(`http://shirts4mike.com/` +link, function (error, response, html) {
  if (!error && response.statusCode == 200) {
    var $link = cheerio.load(html);
    let Link = `http://shirts4mike.com/${link}`;
    let price = $link('.price').text();
    let Title = $link('.shirt-details h1').text().slice(4);
    let ImageURL = $link('.shirt-picture span img').attr('src');
    metadata = {
        Title: Title,
        Price: price,
        Link: Link,
        ImageURL:ImageURL,
        Time: d +" "+ date
      };
      
      
     
  }
  shirtinfo.push(metadata);
  
});})
const end = new Date().getTime();

if (!error && response.statusCode == 200) {
const time = end - start;
console.log('Execution time: ' + time);
setTimeout(() => {
    const json2csvParser = new Json2csvParser({ fields });
    const csv = json2csvParser.parse(shirtinfo);
    console.log(shirtinfo);
   
    console.log(date);
    fs.writeFile(`data/${date}.csv`, csv, function(err) {
        if(err) {
            console.log(err);
        }
    
        console.log("The file was saved!");
    }); 
}, time*1000);
}});







