const puppeteer = require('puppeteer');
const { interpolate } = require('react-spring');

/* Course obj should have the following args: courseName, courseNumber, FaculltyId, semester, profName */

//Todo: need to add option to choose semester
async function scrapeBidingClosingScore(courseObj){
    var maxClosingScore = 1;
    var maxClosingScoreSameProf = -1;
    var i;
    //for debug change to  puppeteer.launch({headless:false})
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.ims.tau.ac.il/Bidd/Stats/Stats_P.aspx");
    await page.select('select[name = "lstFacBidd"]', "0300")
    await page.type('input[name = "txtKurs"]', "03683079");
    await page.click('.btnblues');
    const elem = await page.$("#frmgrid")
    let results = await elem.$eval('table tbody', tbody => [...tbody.rows].map(r => [...r.cells].map(c => c.innerText)))
    var lastProf = "";
    for (i = 1; i < results.length - 2; ++i){
        if(results[i][9].trim() !== ''){
            lastProf = results[i][9].trim();
        }
        if(lastProf == 'ד"ר דוד מובשוביץ' && results[i][2].trim() !== '' && 
            parseInt(results[i][2]) > maxClosingScoreSameProf){
            maxClosingScoreSameProf = results[i][2];
        }

        if (results[i][2].trim() !== '' && parseInt(results[i][2]) > maxClosingScore){
            maxClosingScore = results[i][2];
           
        }
    }
    console.log(maxClosingScore);

    await browser.close();

    if( maxClosingScoreSameProf > -1){
        return maxClosingScoreSameProf
    }

    return maxClosingScore;
}

//scrapeBidingClosingScore();

