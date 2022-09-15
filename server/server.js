const puppeteer = require('puppeteer');
const express = require('express')
var bodyParse = require('body-parser');
const { json } = require('body-parser');
const app = express()
const PORT = 5000

app.use(express.json());
app.use(bodyParse.json())

/* represents one choice option for the course (lesston + practice time slot option) */
let courseTimeSlot = class{
    constructor(cousreNumber, semester, facName, facId, lesson, practice){
        this.cousreNumber = cousreNumber;
        this.semester = semester;
        this.facName = facName;
        this.facId;
        this.lesson = lesson; //timeSlot object
        this.practice = practice; // list of timeSlot objects
    }

    setPractice(practice){
        this.practice = practice
    }
}

let timeSlot = class{
    constructor(groupId, time, profName){
        this.groupId = groupId;
        this.time = time; // a list of [day, hours] lists
        this.profName = profName;
    }
}

/* respond with the recomended score when a POST request is made to the bidingScore */
app.post('/bidingScore' , async (req, res) => {
    var maxClosingScore = 1;
    var maxClosingScoreSameProf = -1;
    var i;
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.ims.tau.ac.il/Bidd/Stats/Stats_P.aspx");
    await page.select('select[name = "lstFacBidd"]', req.body.faculltyId)
    await page.type('input[name = "txtKurs"]', req.body.number);
    await page.select('select[name = "lstPageSize"]', "35")
    await page.click('.btnblues');
    const elem = await page.$("#frmgrid")
    let results = await elem.$eval('table tbody', tbody => [...tbody.rows].map(r => [...r.cells].map(c => c.innerText)))
    var lastProf = "";
    for (i = 1; i < results.length - 2; ++i){
        if(results[i][9].trim() !== ''){
            lastProf = results[i][9].trim();
        }
        if(lastProf == req.body.profName && results[i][2].trim() !== '' && 
            parseInt(results[i][2]) > maxClosingScoreSameProf){
            maxClosingScoreSameProf = results[i][2];
        }
        if (results[i][2].trim() !== '' && parseInt(results[i][2]) > maxClosingScore){
            maxClosingScore = results[i][2];           
        }
    } 
    if (maxClosingScoreSameProf > -1){
        res.json(maxClosingScoreSameProf)
    } else{
        res.json(maxClosingScore)
    }
})

/* uses course number to extract the following details about the course:
   course name, proffesors, faculty name, semester, class schedule*/
app.post('/courseDetails' , async (req, res) => {
    var i = 1, index = 0, name, profName, facName, semester, groupId, lesson, prevRecord, currRecord;
    var isLesson = true, hasPractices = false;
    var output = [], practice = [], times = [];
    const semesterTrans = {"א'" : "a", "ב'":"b", "ג'": "c"};
    const facIds = {"מדעים מדויקים": "0300", "רפואה": "0100", "מדעי החיים": "0400", "הנדסה": "0500", 
                    "רוח": "0600", "חינוך": "0700", "אמנויות": "0800", "מדעי החברה": "1000",
                    "עבודה סוציאלית": "1100", "ניהול": "1200", "תכניות לימוד מיוחדות": "1880"}
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.ims.tau.ac.il/tal/kr/search_p.aspx");
    await page.type('input[name = "txtKurs"]', req.body.number);
    await page.click('#search');
    const elem = await page.$("#frmgrid");
    let data = await elem.$eval('table tbody', tbody => [...tbody.rows].map(r => [...r.cells].map(c => c.innerText)));
 
    while (i < data.length){
        if (data[i].length != 1 && data[i][0].slice(0,6) == 'סילבוס'){ 
            index = -1;
            if(semester == req.body.semester){
                if (isLesson){
                    lesson = new timeSlot(groupId, times, profName);
                    record = new courseTimeSlot(req.body.number, req.body.semester, facName, facIds[facName], lesson, null);
                    output.push(record);
                    if (hasPractices){
                        //last record has practices
                        currRecord = output.pop();
                        prevRecord = output.pop();
                        prevRecord.setPractice(practice);
                        output.push(prevRecord);
                        output.push(currRecord);
                        practice = [];
                        hasPractices = false;
                    }
                } else{
                    //add practice to practice list
                    practice.push(new timeSlot(groupId, times, profName));
                    hasPractices = true;
                }
            }
            times = []
            
        } else{
            if (index == 1){
                groupId = data[i][0].slice(-2);
                name = data[i][1];
            }
            else if (index == 2){
                var slashIndex = JSON.stringify(data[i][1]).indexOf("/");
                if(slashIndex != -1){
                    facName = data[i][1].slice(0, slashIndex-1);
                } else{
                    facName = data[i][1];
                }
            }
            else if (index >= 4){
                if (index == 4){
                    profName = JSON.stringify(data[i][0]);
                }
                if (data[i][1] == 'שיעור'){
                    isLesson = true;
                } else{
                    isLesson = false;
                }
                var day = data[i][4];
                var time = data[i][5];
                times.push([day, time]); //one lesson/practice can be seperated to multiple days
                semester = semesterTrans[data[i][6]];                
            }
            ++index;
        }

        ++i;
    }

    if(hasPractices){
        prevRecord = output.pop();
        prevRecord.setPractice(practice);
        output.push(prevRecord);
    }

    res.json(output);
})



app.listen(PORT, () => {console.log("server started on port", PORT)})


