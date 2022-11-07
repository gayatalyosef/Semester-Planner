import React from 'react';
import 'animate.css';
import Calendar from 'react-calendar';
//import 'react-calendar/dist/Calendar.css';
import BidingAdvisor from './BidingAdvisor';
import {MdOutlineArrowDropDown} from 'react-icons/md'


class course{
  constructor(name, number, faculltyId, semester, profName, color){
  this.name = name;
  this.number = number;
  this.faculltyId = faculltyId;
  this.semester = semester;
  this.profName = profName;
  this.color = color;
  this.timeOptions = [];
  }
}

class weeklyEvent{
  constructor(groupId, courseName, courseNumber, rowStart, rowEnd, colStart, color){
    this.groupId = groupId;
    this.courseName = courseName;
    this.courseNumber = courseNumber;
    this.rowStart = rowStart; //start hour
    this.rowEnd = rowEnd; //end hour
    this.colStart = colStart; //day
    this.colEnd = colStart + 1;
    this.color = color;
    this.overlap = 1;
    this.overlapMargin = "1px";
    this.colWidth = 10.65;
    this.text = String(groupId + " - " + courseName);
  }
}

class exam{
  constructor(moed, day, month, year, courseName, courseNumber, color){
      this.moed = moed;
      this.day = day;
      this.month = month;
      this.year = year;
      this.courseName = courseName;
      this.courseNumber = courseNumber;
      this.color = color;
  }
}

function App(){
  /* states */
  //dropDown menu
  const [dropDownDisplay, setDropDownDisplay] = React.useState("none")
  //Biding Advisor
  const [slideArrowDisplay, setArrowDisplay] = React.useState({"a":"none", "b":"none"}); //display slide arrows in biding advisor section
  const [removeFromTotalScore, refreshTotalScore] = React.useState({"a":[], "b":[]}); //courses that should be removed from total sbiding advisor score
  //Course List
  const [userInput, setInput] = React.useState("type course number"); //new course input
  const [semester, viewSemester] = React.useState("a");
  const [courseList, updateCourseList] = React.useState({"a": {list:[], ids:[]}, "b": {list:[], ids:[]}});
  const [optionsDisplay, setDispaly] = React.useState({});
  const colors = ["#C6F1FE", "#C7CEEA", "#B5EAD7", "#FFDAC1",  "#FF9AA2", "#FFFFD8", "#9DBBEA","#F8C8DC","#B9E9E3"];
  const [colorIndexManager, updateColorIndex] = React.useState({"a":[0,1,2,3,4,5,6,7,8], "b":[0,1,2,3,4,5,6,7,8]});
  var colorListIndex = 0;
  const [inputError, setErrorMsg] = React.useState(["none", ""]);
  //Weekly
  const columsIndexs = ["1","2","3","4","5","6"];
  const [weeklyEvents, updateWeekly] = React.useState({"a":[], "b":[]});
  const [selectedOptionsWeekly, updateSelectedWeeklyOptions] = React.useState({"a":{}, "b":{}});
  const [hoursCounter, setHoursCount] = React.useState({"a": "-", "b":"-"});
  //Exam-List
  const [sortedExamsList, updateExamList] = React.useState({"a":[], "b":[]});
  //Exam-Calender
  const [isFirstExam, updateIsFirstExam] = React.useState({"a": true, "b":true});
  const [calendarDate, setExamCalendarDate] = React.useState(new Date());
  const calendarRef = React.useRef(null);


  /* Course List functions */
  
  // input helpers
  function handleChange(event){
      var res = event.target.value.replace(/\D/g, ''); //allows only numbers
      setInput(res);
  }

  function clearInput(event){
    if(event.target.value === "type course number"){
      setInput("")
    }
  }

  function enterPress(e){
    if(e.key === "Enter"){
      addNewEntry()
    }
  }

  //course list
  function addNewEntry(){
    if(courseList[semester].ids.includes(userInput)){
      setErrorMsg(["block", "This course is already in the list "]);
      setTimeout(() => {
        setErrorMsg(["none", ""]);
      }, 3000);
    }
    else if (userInput.length === 8){
      const requestInfo = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"number": userInput, "semester": semester})
      };
  
      fetch("/courseDetails", requestInfo)
      .then((res) => res.json())
        .then((data) => {
          if (data.length === 1){
            console.log("This course is not taught in semester " + semester);
            setErrorMsg(["block", "This course is not taught in semester " + semester]);
            setTimeout(() => {
              setErrorMsg(["none", ""]);
            }, 3000);
          
          }
          else if (data["0"] === "course not found error"){
            console.log("course not found");
            setErrorMsg(["block", "course not found"]);
            setTimeout(() => {
              setErrorMsg(["none", ""]);
            }, 2000);
          } else{
            //console.log(data);
            colorListIndex = (courseList[semester].ids.length < colors.length) ? courseList[semester].ids.length:(courseList[semester].ids.length - colors.length);
            const myColor = colors[colorIndexManager[semester][0]]; 
            var newColorIndex = {};
            Object.assign(newColorIndex, colorIndexManager);
            var firstIndex = newColorIndex[semester].shift();
            newColorIndex[semester].push(firstIndex);
            updateColorIndex(newColorIndex);
            var newCourse = new course(data["0"]["courseName"], data["0"]["courseNumber"], data["0"]["facId"], semester, 
                                    data["0"]["lesson"]["profName"], myColor);
            for(var i=0; i < data.length - 1; i++){
              newCourse.timeOptions.push([data[i]["lesson"], data[i]["practice"]]);
            }
            var newExamsList = {};
            Object.assign(newExamsList, sortedExamsList);
            for(i=0; i < data[data.length-1].length; i++){
              var newExam = new exam(data[data.length-1][i].moed, data[data.length-1][i].day, data[data.length-1][i].month, data[data.length-1][i].year, newCourse.name, newCourse.number, newCourse.color);
              newExamsList[semester].push(newExam);
              if(isFirstExam[semester]){
                var newIsFirstExam = {};
                Object.assign(newIsFirstExam, isFirstExam);
                newIsFirstExam[semester] = false;
                updateIsFirstExam(newIsFirstExam);
                setExamCalendarDate(new Date(newExam.year, newExam.month-1, 1));
              }
            }
            //sort the examList
            newExamsList[semester].sort((exam1, exam2) => {
              return exam1.day - exam2.day;
            });
            newExamsList[semester].sort((exam1, exam2) => {
              return exam1.month - exam2.month;
            });
            newExamsList[semester].sort((exam1, exam2) => {
              return exam1.year - exam2.year;
            });
            updateExamList(newExamsList);
            
            var newCourseList = {};
            Object.assign(newCourseList, courseList);
            const newList = courseList[semester].list.concat(newCourse);
            const newIds = courseList[semester].ids.concat(newCourse.number);
            newCourseList[semester] = {list: newList, ids: newIds};
            updateCourseList(newCourseList);
            var newDisplay = {};
            Object.assign(newDisplay, optionsDisplay); 
            newDisplay[newCourse.number] = "none";
            setDispaly(newDisplay);
            console.log("new course obj ", newCourse);
            //updates for weekly
            var newSelectedOptionsWeekly = {};
            Object.assign(newSelectedOptionsWeekly, selectedOptionsWeekly); 
            newSelectedOptionsWeekly[semester][newCourse.number] = {};
            for(i=0; i < newCourse.timeOptions.length; i++){
              newSelectedOptionsWeekly[semester][newCourse.number][newCourse.timeOptions[i]["0"].groupId]="";
              for(var j=0; j < newCourse.timeOptions[i]["1"].length; j++){
                newSelectedOptionsWeekly[semester][newCourse.number][newCourse.timeOptions[i]["1"][j].groupId]="";
              }
            }
            updateSelectedWeeklyOptions(newSelectedOptionsWeekly);

          }
        });

        if(courseList[semester].ids.length > 5){
          var newArrowDispaly = {};
          Object.assign(newArrowDispaly, slideArrowDisplay); 
          newArrowDispaly[semester] = "block";
          setArrowDisplay(newArrowDispaly);
        }   
    }
    setInput("type course number");
    
  }

  function removeEntry(entry){
    var newColorIndex = {};
    Object.assign(newColorIndex, colorIndexManager);
    if(courseList[semester].ids[courseList[semester].ids.length-1] === entry.number){
      //deleting the last entry
      console.log("last elem");
      newColorIndex[semester].unshift(colorIndexManager[semester].pop());
    }
    console.log(newColorIndex);

    var newCourseList = {};
    Object.assign(newCourseList, courseList);
    const newList = courseList[semester].list.filter(item => item.number !== entry.number);
    const newIds = courseList[semester].ids.filter(id => id !== String(entry.number));
    newCourseList[semester] = {list: newList, ids: newIds};
    updateCourseList(newCourseList);
    //removig item from optionsDisplay list
    const newDisplay = {};
    Object.assign(newDisplay, optionsDisplay); //copying optionsDisplay dict
    delete newDisplay[entry.number];
    setDispaly(newDisplay);
    //updates for bidind advisor
    if (courseList[semester].ids.length < 8){
      var newArrowDispaly = {};
      Object.assign(newArrowDispaly, slideArrowDisplay); 
      newArrowDispaly[semester] = "none";
      setArrowDisplay(newArrowDispaly);
    }
    var newRemoveFromTotalScore = {"a":[], "b":[]};
    newRemoveFromTotalScore[semester] = [entry.number];
    refreshTotalScore([newRemoveFromTotalScore]);
    //updates for weekly
    var newHoursCount = {};
    Object.assign(newHoursCount, hoursCounter);
    weeklyEvents[semester].filter((event) => event.courseNumber === entry.number).forEach(event => {
      newHoursCount[semester] -= (event.rowEnd - event.rowStart);
    });
    if (newHoursCount[semester] === 0){
      newHoursCount[semester] = "-";
    }
    setHoursCount(newHoursCount);
    var newWeekly = {};
    Object.assign(newWeekly, weeklyEvents);
    handleUnOverlap(entry.number, null, newWeekly);
    newWeekly[semester] = weeklyEvents[semester].filter((event) => event.courseNumber !== entry.number);
    updateWeekly(newWeekly);
    var newSelectedOptionsWeekly = {};
    Object.assign(newSelectedOptionsWeekly, selectedOptionsWeekly);
    delete newSelectedOptionsWeekly[semester][entry.number];
    updateSelectedWeeklyOptions(newSelectedOptionsWeekly);
    //updates for exams-list
    var newExamsList = {};
    Object.assign(newExamsList, sortedExamsList);
    newExamsList[semester] = newExamsList[semester].filter((examObj) => examObj.courseNumber !== entry.number);
    updateExamList(newExamsList);
  }

  function changeOptionsDisplay(number){
    var newDisplay = {};
    Object.assign(newDisplay, optionsDisplay); //copying optionsDisplay dict
    if (newDisplay[number] === "none"){
      for (const key of Object.keys(newDisplay)){
          newDisplay[key] = "none";
      }
      newDisplay[number] = "block";
    } else{
      newDisplay[number] = "none";
    }
    setDispaly(newDisplay);
  }

  function switchSemester(newSemester){
    viewSemester(newSemester);
    const semA = document.getElementById("semA-btn");
    const semB = document.getElementById("semB-btn");

    if (newSemester === "a"){
      semA.style.backgroundColor = "white";
      semA.style.fontWeight = "400";
      semA.style.borderWidth = "0.8px";
      semB.style.backgroundColor = "whitesmoke";
      semB.style.fontWeight = "200";
      semB.style.borderWidth = "0.5px";
    } else{
      semB.style.backgroundColor = "white";
      semB.style.fontWeight = "400";
      semB.style.borderWidth = "0.8px";
      semA.style.backgroundColor = "whitesmoke";
      semA.style.fontWeight = "200";
      semA.style.borderWidth = "0.5px";
    }
    if(sortedExamsList[newSemester].length > 0){
      setExamCalendarDate(new Date(sortedExamsList[newSemester][0].year, sortedExamsList[newSemester][0].month-1, 1));
    } else{
      setExamCalendarDate(new Date());
    }
  }

  function dropDown(){
    console.log("dropDown function");
    if(dropDownDisplay === "none"){
      setDropDownDisplay("block");
    } else{
      setDropDownDisplay("none");
    }
  }

  /* Weekly functions*/
  function createWeeklyEvent(timeOption, color){
    if(timeOption.time === null){
      console.log("course has no classes");
      setErrorMsg(["block", "course has no classes"]);
      setTimeout(() => {
        setErrorMsg(["none", ""]);
      }, 2000);
      return;
    }
    const dayToColStart = {'א':2, 'ב':3, 'ג':4, 'ד':5, 'ה':6, 'ו':7};
    const hourToRow = {'08':2 , '09':3, '10':4, '11':5, '12':6, '13':7, '14':8, '15':9, '16':10, '17':11, '18':12, '19':13, '20':14, '21':15};
    var event, rowStart, rowEnd, colStart;
    var newSelectedOptionsWeekly = {};
    Object.assign(newSelectedOptionsWeekly, selectedOptionsWeekly);
    var newWeekly = {};
    Object.assign(newWeekly, weeklyEvents);
    var newHoursCount = {};
    Object.assign(newHoursCount, hoursCounter);

    if (selectedOptionsWeekly[semester][timeOption.courseNumber][timeOption.groupId] === ""){
      //show option in weekly calender
      newSelectedOptionsWeekly[semester][timeOption.courseNumber][timeOption.groupId] = "rgba(228, 220, 220, 0.596)";
      if (hoursCounter[semester] === "-"){
        newHoursCount[semester]= 0;
      }
      for (var i=0; i< timeOption.time.length; i++){
        colStart = dayToColStart[timeOption.time[i][0]];
        var hours = timeOption.time[i][1];
        rowStart = hourToRow[hours.slice(0, hours.indexOf(":"))];
        hours = hours.slice(hours.indexOf("-")+1, -1);
        rowEnd = hourToRow[hours.slice(0, hours.indexOf(":"))];
        event = new weeklyEvent(timeOption.groupId, timeOption.courseName, timeOption.courseNumber, rowStart, rowEnd, colStart, color);
        newWeekly[semester].push(event);
        handleOverlap(event, true, false);
        updateWeekly(newWeekly);
        newHoursCount[semester] += (rowEnd - rowStart);
      }
    } else{
      //remove option from weekly
      newSelectedOptionsWeekly[semester][timeOption.courseNumber][timeOption.groupId] = "";
      //update hours counter
      newWeekly[semester].filter((event) => (event.courseNumber === timeOption.courseNumber && event.groupId === timeOption.groupId)).forEach(event => {
        newHoursCount[semester] -= (event.rowEnd - event.rowStart);
      });
      if (newHoursCount[semester] === 0){
        newHoursCount[semester] = "-";
      }
      //remove option from calender
      newWeekly[semester] = newWeekly[semester].filter((event) => !(event.courseNumber === timeOption.courseNumber && event.groupId === timeOption.groupId));
      handleUnOverlap(timeOption.courseNumber, timeOption.groupId, newWeekly);
    } 
    updateSelectedWeeklyOptions(newSelectedOptionsWeekly);
    setHoursCount(newHoursCount);
  }

  function handleOverlap(myEvent, isNewEvent, isDeleteEntireCourse){
    var overlapChain = [], partialOverlap = [], eventsThatDay = [];
    var minRowStart = 15, maxRowEnd = 1;
    var maxPartialWidth, partialLeftMarginCounter, isPartialFlag, fullText;
    weeklyEvents[semester].map((event) => {
      if(event.colStart === myEvent.colStart){
        eventsThatDay.push(event);
        if((event.rowStart <= myEvent.rowStart && event.rowEnd > myEvent.rowStart) ||
         (myEvent.rowStart <= event.rowStart && myEvent.rowEnd > event.rowStart)){
        //there is an overlap
          minRowStart = (event.rowStart < minRowStart) ? event.rowStart: minRowStart;
          maxRowEnd = (event.rowEnd > maxRowEnd) ? event.rowEnd: maxRowEnd;
          overlapChain.push(event);
        }
      }  
      return event;  
    }); 
    //complete overlapChain
    for(var i=0; i < eventsThatDay.length; i++){
      if(((eventsThatDay[i].rowStart > minRowStart && eventsThatDay[i].rowStart < maxRowEnd) ||
        (eventsThatDay[i].rowEnd > minRowStart && eventsThatDay[i].rowEnd < maxRowEnd))
        && !overlapChain.includes(eventsThatDay[i])){
        overlapChain.push(eventsThatDay[i]);
      } 
    }
    if(!isNewEvent){
      overlapChain = overlapChain.filter((event) => !(event.courseNumber === myEvent.courseNumber && event.groupId === myEvent.groupId));
    }

    //sort overlapchain by rowEnd
    overlapChain.sort((event1, event2) => {
      return event1.rowStart - event2.rowStart;
    });
    overlapChain.sort((event1, event2) => {
      return event2.rowEnd - event1.rowEnd;
    });

    //create partialOverlap from overlapchain
    for (i=0; i < overlapChain.length; i++){
      partialLeftMarginCounter = 0;
      maxPartialWidth = 0;
      isPartialFlag = false;
      for(var j=0; j < overlapChain.length; j++){
        if(i !== j && overlapChain[i].rowStart >= overlapChain[j].rowEnd){
          //overlapChain[i] is partial overlap with overlapChain[j]
          isPartialFlag = true;
          maxPartialWidth ++;
        }
        else if (i !== j){
          //overlapChain[i] regular overlap with overlapChain[j]
          partialLeftMarginCounter ++;
        }
      }
      if(isPartialFlag){
        partialOverlap.push(overlapChain[i]);
        overlapChain.splice(i,1);
        i = (i > 1) ? i-2: 0;
        partialOverlap[partialOverlap.length -1].overlap = maxPartialWidth;
        partialOverlap[partialOverlap.length -1].overlapMargin = partialLeftMarginCounter;
      }
    }
    //position overlapChain events
    for (i=0; i < overlapChain.length; i++){
      if (i === 0){
        overlapChain[0].overlapMargin = "1px";
      } else{
        overlapChain[i].overlapMargin = String((10.6/overlapChain.length)*i) +"vw";
      }
      overlapChain[i].overlap = overlapChain.length;
      overlapChain[i].colWidth = 10.45;
      fullText = overlapChain[i].groupId + " - " + overlapChain[i].courseName;
      if (fullText > 79 || overlapChain.length >= 3 || ((overlapChain[i].rowEnd - overlapChain[i].rowStart < 2) && overlapChain.length >= 2)
      || (fullText.length > 40 && overlapChain.length > 1)){
        overlapChain[i].text = overlapChain[i].groupId;
      } else {
        overlapChain[i].text = fullText;
      }
    }
    //sort partialOverlap
    partialOverlap.sort((event1, event2) => {
      return event1.overlapMargin - event2.overlapMargin;
    });
    var colWidth = 10.45;

    //position partialOverlap events
    for (i=0; i < partialOverlap.length; i++){
      if (i===0){
        colWidth = 10.45 - (partialOverlap[0].overlapMargin * (10.6/overlapChain.length));
        partialOverlap[i].overlapMargin = String((10.7/overlapChain.length) * partialOverlap[i].overlapMargin) +"vw";
        partialOverlap[i].overlapMargin = (partialOverlap[i].overlapMargin === "0vw") ? "1px" : partialOverlap[i].overlapMargin;
      } else{
        partialOverlap[i].overlapMargin = String((10.75 - colWidth) + ((colWidth/partialOverlap.length) * i)) +"vw";
      }
      partialOverlap[i].colWidth = colWidth;
      partialOverlap[i].overlap = partialOverlap.length;
      
      fullText = partialOverlap[i].groupId + " - " + partialOverlap[i].courseName;
      if (partialOverlap[i].overlap >= 3 || ((partialOverlap[i].rowEnd - partialOverlap[i].rowStart < 2) && (partialOverlap[i].overlap >= 2 || colWidth < 10.65))
      || (fullText > 40 && partialOverlap[i].overlap > 1)){
        partialOverlap[i].text =  partialOverlap[i].groupId;
      } else{
        partialOverlap[i].text = fullText;
      }
    } 
    if(isDeleteEntireCourse){
      //need to remove event from weeklyEvents
      weeklyEvents[semester] = weeklyEvents[semester].filter((event) => !(event.courseNumber === myEvent.courseNumber && event.groupId === myEvent.groupId));
      updateWeekly(weeklyEvents);
    }
  }

  function handleUnOverlap(courseNumber, groupId, newWeekly){
    if(groupId == null){
      //remove all events for that course
      for(var i=0; i < newWeekly[semester].length; i++){
        if(newWeekly[semester][i].courseNumber === courseNumber){
          handleOverlap(newWeekly[semester][i], false, true);
        }
      }
    } else{
      //remove spesific event
      for(i=0; i < weeklyEvents[semester].length; i++){
        if(weeklyEvents[semester][i].courseNumber === courseNumber && weeklyEvents[semester][i].groupId === groupId){
          handleOverlap(weeklyEvents[semester][i], false, false);
        }
      }
    }
    updateWeekly(newWeekly);
    
  }

  /* Exam Calendar functions */
  //Note: need to handle overlap
  function addTileClassName(date){
    const sem = ["a", "b"];
    for(var i=0; i < sem.length; i++){
      for(var j=0; j < sortedExamsList[sem[i]].length; j++){
        var month = sortedExamsList[sem[i]][j].month;
        if(sortedExamsList[sem[i]][j].month[0] === "0"){
          month = sortedExamsList[sem[i]][j].month[1];
        } 
        if(parseInt(date.date.getDate()) === parseInt(sortedExamsList[sem[i]][j].day) && (parseInt(date.date.getMonth())+1) === parseInt(month) && parseInt(date.date.getUTCFullYear()) === parseInt(sortedExamsList[sem[i]][j].year)){
          return String("selected" + sortedExamsList[sem[i]][j].color.slice(1) );
        }
      }
    }
    return "null";
  }


  return(
    <div>
      <div id="headline-container">
        <div id="dropDown-menu" onClick={dropDown}>
          <p id="dropDown-info"> Info </p>
          <MdOutlineArrowDropDown id="dropDownArrow" size={25}/>
        </div>
        <h1 id="main-headline"> Semester Planner </h1>
      </div>
      <div id="dropDown" className="animate__animated animate__fadeIn" style={{display: dropDownDisplay}}> The information is current for: 2022/2023 תשפ"ג</div>

      <div id="section1">
        <div id="weekly"> 
        <p id="hours-counter">  Hours: {hoursCounter[semester]}</p>
            <div id="week-calender"> 
                <div> </div> 
                <div className="day">  Sunday <div id="divider-line"></div></div>
                <div className="day"> Monday <div id="divider-line"></div></div>
                <div className="day"> Tuesday <div id="divider-line"></div></div>
                <div className="day"> Wednesday <div id="divider-line"></div></div>
                <div className="day"> Thursday <div id="divider-line"></div></div>
                <div className="day"> Friday <div id="divider-line"></div></div>
                <div className="hour"> 8:00 </div>
                {columsIndexs.map((colIndex) => 
                 <div className="free-cell" row="1" col={colIndex}></div>
                )}
                <div className="hour"> 9:00 </div>
                {columsIndexs.map((colIndex) => 
                 <div className="free-cell" row="2" col={colIndex}></div>
                )}
                <div className="hour"> 10:00 </div>
                {columsIndexs.map((colIndex) => 
                 <div className="free-cell" row="3" col={colIndex}></div>
                )}
                <div className="hour"> 11:00 </div>
                {columsIndexs.map((colIndex) => 
                 <div className="free-cell" row="4" col={colIndex}></div>
                )}
                <div className="hour"> 12:00 </div>
                {columsIndexs.map((colIndex) => 
                 <div className="free-cell" row="5" col={colIndex}></div>
                )}
                <div className="hour"> 13:00 </div>
                {columsIndexs.map((colIndex) => 
                 <div className="free-cell" row="6" col={colIndex}></div>
                )}
                <div className="hour"> 14:00 </div>
                {columsIndexs.map((colIndex) => 
                 <div className="free-cell" row="7" col={colIndex}></div>
                )}
                <div className="hour"> 15:00 </div>
                {columsIndexs.map((colIndex) => 
                 <div className="free-cell" row="8" col={colIndex}></div>
                )}
                <div className="hour"> 16:00 </div>
                {columsIndexs.map((colIndex) => 
                 <div className="free-cell" row="9" col={colIndex}></div>
                )}
                <div className="hour"> 17:00 </div>
                {columsIndexs.map((colIndex) => 
                 <div className="free-cell" row="10" col={colIndex}></div>
                )}
                <div className="hour"> 18:00 </div>
                {columsIndexs.map((colIndex) => 
                 <div className="free-cell" row="11" col={colIndex}></div>
                )}
                <div className="hour"> 19:00 </div>
                {columsIndexs.map((colIndex) => 
                 <div className="free-cell" row="12" col={colIndex}></div>
                )}
                <div className="hour"> 20:00 </div>
                {columsIndexs.map((colIndex) => 
                 <div className="free-cell" row="13" col={colIndex}></div>
                )}
                <div className="hour" id="last-line"> 21:00 </div>
                {columsIndexs.map((colIndex) => 
                 <div className="free-cell" row="14" col={colIndex} id="last-line"></div>
                )}

                {weeklyEvents[semester].map((evnt) => 
                    <div id="event" className="animate__animated animate__flipInX" style={{backgroundColor:evnt.color, gridRowStart: evnt.rowStart, gridRowEnd: evnt.rowEnd, gridColumnStart: evnt.colStart, gridColumnEnd: evnt.colEnd, width:String(evnt.colWidth/evnt.overlap)+"vw", marginLeft: evnt.overlapMargin, maxHeight: String((evnt.rowEnd - evnt.rowStart)*26)+"px"}}>
                      <p id="event-content"> {evnt.text} </p>
                    </div> 
                )}
                
            </div>
        </div>
        <div id="courses-list">
          <div id="courses-container">
            <p id="list-headline"> Courses List </p>
            <button id="semA-btn" onClick={() => switchSemester("a")}> semester A </button>
            <button id="semB-btn" onClick={() => switchSemester("b")}> semester B </button>
          </div>
          <div id="list">
            <input id="input-course" type="text" value={userInput} onChange={handleChange}
              onClick={(e) => {clearInput(e)}} onKeyDown={(e) => enterPress(e)} maxLength="8" />
            <i className="fa-regular fa-square-plus fa-xl" id="plus-icon" onClick={addNewEntry}></i><br></br>
           <div id="errMsg" className="animate__animated animate__fadeIn" style={{display: inputError[0]}}> <i class="fa-solid fa-triangle-exclamation"></i> {inputError[1]} </div>
            <ul id="entries-container">
              {courseList[semester].list.map((item) => (
                <div id="entry" className="animate__animated animate__slideInDown">
                  <span key={item.number} id="listEntries" style={{backgroundColor: item.color}}> 
                    <p id="entry-course-name" onClick={() => changeOptionsDisplay(item.number)}> {item.name} - {item.number} </p>
                    
                    <ul>{item.timeOptions.map((option) =>
                          <div className="animate__animated animate__flipInX" id="option" style={{display:optionsDisplay[item.number]}}>
                            <p id="lesson" onClick={() => createWeeklyEvent(option[0], item.color)} style={{backgroundColor: selectedOptionsWeekly[semester][item.number][option[0]["groupId"]]}}> {option[0]["groupId"]}: {option[0]["profName"]} (שיעור) </p>
                            {option[1].map((practice) => <p id="practice" onClick={() => createWeeklyEvent(practice, item.color)} style={{backgroundColor: selectedOptionsWeekly[semester][item.number][practice["groupId"]]}}>  {practice["groupId"]}: {practice["profName"]} (תרגול) </p>
                            )}
                           
                          </div>)}
                    </ul>

                  </span>
                  <i className="fa-solid fa-circle-minus" id="remove-entry" onClick={() => removeEntry(item)}></i>
                </div>
              ))}
            </ul>
          </div>
       </div>
     </div>

     <div id="section2">
      <div id="exams-calender">
        <p id="exam-calnedar-headline"> Exam calendar </p>
        <div className='calendar-container'>
          <Calendar
            onChange={setExamCalendarDate}
            value={calendarDate}
            showDoubleView={true}
            locale={"ENG"}
            calendarType={'Hebrew'}
            minDetail='year'
            tileClassName={(date) => addTileClassName(date)}
            ref={calendarRef}/>
        </div>
      </div>
      <div id="exams-list"> 
        <p id="exams-list-headline"> Exam schedule </p>
        <div id="exams-list-container">
          {sortedExamsList[semester].map((exam) => (
              <ul id="exam-entry" style={{backgroundColor: exam.color}}> 
                <span id="exam-list-text-container" className="animate__animated animate__flipInX">
                  <p> {exam.courseName} - {exam.year}/{exam.month}/{exam.day}  (מועד {exam.moed})</p>
                </span>
              </ul>
          ))}
        </div>
      </div>
    </div>
    <div id="section3">
      <p id="section3-headline">Biding Advisor</p>
      <div id="biding-advisor"> <BidingAdvisor data={courseList[semester]} arrows={slideArrowDisplay} removeFromTotalScore={removeFromTotalScore} refreshTotalScore={refreshTotalScore} semester={semester}/> </div>
    </div>
      


    </div>
  )
}

export default App
