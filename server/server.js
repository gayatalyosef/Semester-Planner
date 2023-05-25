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
    constructor(courseNumber, courseName, semester, facName, facId, lesson, practice){
        this.courseNumber = courseNumber;
        this.courseName = courseName;
        this.semester = semester;
        this.facName = facName;
        this.facId = facId;
        this.lesson = lesson; //timeSlot object
        this.practice = practice; // list of timeSlot objects
    }

    setPractice(practice){
        this.practice = practice
    }
}

let timeSlot = class{
    constructor(groupId, time, profName, courseName, courseNumber){
        this.groupId = groupId;
        this.time = time; // a list of [day, hours] lists
        this.profName = profName;
        this.courseName = courseName;
        this.courseNumber = courseNumber;
    }
}

let exam = class{
    constructor(moed, day, month, year){
        this.moed = moed;
        this.day = day;
        this.month = month;
        this.year = year;
    }
}

/* respond with the recomended score when a POST request is made to the bidingScore */
app.post('/bidingScore' , async (req, res) => {
    console.log("heyyyyyyyy from biding search");
    var maxClosingScore = 1;
    var maxClosingScoreSameProf = -1;
    var i;
    if( req.body.faculltyId === undefined){
        res.json("missing data...");
        return;
    }
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.ims.tau.ac.il/Bidd/Stats/Stats_P.aspx");
    await page.select('select[name = "lstFacBidd"]', req.body.faculltyId);
    await page.type('input[name = "txtKurs"]', req.body.number);
    await page.select('select[name = "lstPageSize"]', "35");
    await page.click('.btnblues');
    console.log("opend biding serach page");
    try{
        const elem = await page.$("#frmgrid");
        console.log(" got frmgrid try");
    } catch{
        console.log(" failed");
    }
    const elem = await page.$("#frmgrid");
    console.log("got frmgrid");

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
    console.log("after the for");
    if (maxClosingScoreSameProf > -1){
        res.json(maxClosingScoreSameProf)
    } else{
        res.json(maxClosingScore)
    }
})

/* uses course number to extract the following details about the course:
   course name, proffesors, faculty name, semester, class schedule and exames dates*/
app.post('/courseDetails' , async (req, res) => {
    var i = 1, index = 0, name, profName="", facName, semester, groupId, lesson, prevRecord, currRecord, elem, numOfExamLinks = 0;
    var isLesson = true, hasPractices = false, hasExamExtracted = false;
    var output = [], practice = [], times = [], exams = [];
    const semesterTrans = {"א'" : "a", "ב'":"b", "ג'": "c"};
    const facIds = {"מדעים מדויקים": "0300", "רפואה": "0100", "מדעי החיים": "0400", "הנדסה": "0500", 
                    "רוח": "0600", "חינוך": "0700", "אמנויות": "0800", "מדעי החברה": "1000",
                    "עבודה סוציאלית": "1100", "ניהול": "1200", "תכניות לימוד מיוחדות": "1880", "תכנית הלימודים הרב-תחומית": "0600"}
    const browser = await puppeteer.launch({headless:true});
    const page = await browser.newPage();
    await page.goto("https://www.ims.tau.ac.il/tal/kr/search_p.aspx");
    await page.type('input[name = "txtKurs"]', req.body.number);
    await page.click('#search');
    console.log("opened page ");
    try{
        elem = await page.$("#frmgrid");
        console.log(" got frmgrid in first try");

    } catch{
        console.log("failed");
        elem = await page.$("#frmgrid");
    }
    //const elem = await page.$("#frmgrid");
    if (await elem.$('div[class = "msgerrs rounddiv"]') !== null){
        output.push("course not found error");
        console.log("course not found");
        res.json(output);
    } else{
        let data = await elem.$eval('table tbody', tbody => [...tbody.rows].map(r => [...r.cells].map(c => c.innerText)));
        while (i < data.length){
            if (data[i].length != 1 && data[i][0].slice(0,6) == 'סילבוס'){ 
                index = -1;
                if(isLesson){
                    numOfExamLinks ++;
                }
                if(semester == req.body.semester){
                    if(isLesson){
                        if(!hasExamExtracted && data[i][0].includes("בחינה") ){
                            //extract exames dates (happens only once for each course)
                            const examLinks = await page.$$('a[title= "בחינה"]');
                            hasExamExtracted = true;
                            const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));	
                            await examLinks[(parseInt(numOfExamLinks - 1))].click();
                            //await page.click('a[title= "בחינה"]');
                            const examPage = await newPagePromise;
                            try{
                                let examTableElem = await examPage.$('.tableblds');
                                let examData = await examTableElem.$eval('table tbody', tbody => [...tbody.rows].map(r => [...r.cells].map(c => c.innerText)));
                                for (let i=1; i < examData.length; i++){
                                    var fullDate = examData[i][1];
                                    var newExamRecord = new exam(examData[i][0], fullDate.slice(0, 3), fullDate.slice(4,6), fullDate.slice(7,fullDate.length));
                                    console.log(JSON.stringify(newExamRecord));
                                    exams.push(newExamRecord);
                                }
                                await examPage.close();                        
                            } catch{
                                console.log("failed to fetch exam data");
                                await examPage.close();                        
                            } 
                        }
                        //creating new record
                        if(times.length === 0){
                            times = null;
                        } 
                        lesson = new timeSlot(groupId, times, profName, name, req.body.number);
                        record = new courseTimeSlot(req.body.number, name, req.body.semester, facName, facIds[facName], lesson, []);
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
                        practice.push(new timeSlot(groupId, times, profName, name, req.body.number));
                        hasPractices = true;
                    }
                    profName = "";
                }
                times = [];                
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
                    if (index !== 4 && profName !== "" && data[i][1] === ""){
                        //there more than one teacher
                        var additionalProf = JSON.stringify(data[i][0]);
                        additionalProf = additionalProf.slice(1,-1);
                        additionalProf = additionalProf.replace(/\\/g, "");
                        if (!profName.includes(additionalProf)){
                            profName += ", " + additionalProf;
                        }
                        
                    } else{
                        if (index == 4){
                            profName = JSON.stringify(data[i][0]);
                            profName = profName.slice(1,-1);
                            profName = profName.replace(/\\/g, "");
                        }
                        if (data[i][1] == 'שיעור' || data[i][1] == 'שיעור ותרגיל' || data[i][1] =='פרוייקט'){
                            isLesson = true;
                        } else{
                            isLesson = false;
                        }
                        var day = data[i][4];
                        var time = data[i][5];
                        if (day !== "" && time !== ""){
                            times.push([day, time]); //one lesson/practice can be seperated to multiple days
                        }
                        semester = semesterTrans[data[i][6]]; 
                    }
                    
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

        output.push(exams);
        console.log("this is output " + JSON.stringify(output));
        res.json(output);
    }
}) 



app.listen(PORT, () => {console.log("server started on port", PORT)});


