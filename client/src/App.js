import React from 'react';
import 'animate.css';
import BidingAdvicor from './BidingAdvicor';
import Weekly from './Weekly';

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

function App(){
  //const examplaeCourse = new course("product security and digital", "03683079", "0300", "a", "", "#accc");
  //const linearExample = new course("linear algebra 1a", "03661111", "0300", "a", "", "#accc");

  /* states */
  const [slideArrowDisplay, setArrowDisplay] = React.useState("none"); //display slide arrows in biding advicor section
  const [removeFromTotalScore, refreshTotalScore] = React.useState({"a":[], "b":[]}); //courses that should be removed from total sbiding advicor score
  const [userInput, setInput] = React.useState("type course number"); //new course input
  const [semester, viewSemester] = React.useState("a");
  const [courseList, updateCourseList] = React.useState({"a": {list:[], ids:[]}, "b": {list:[], ids:[]}});
  const [optionsDisplay, setDispaly] = React.useState({});
  const [colors, updateColors] = React.useState(["#B9E9E3","#F8C8DC","#9DBBEA", "#FFFFD8","#FF9AA2", "#FFDAC1","#B5EAD7", "#C7CEEA", "#C6F1FE"]);
  const [inputError, setErrorMsg] = React.useState(["none", ""]);
  /* input helpers */

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

  function addNewEntry(){
    if (userInput.length === 8 && !courseList[semester].ids.includes(userInput)){
      const requestInfo = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"number": userInput, "semester": semester})
      };
  
      fetch("/courseDetails", requestInfo)
      .then((res) => res.json())
        .then((data) => {
          if (data.length === 0){
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
            const newColors = colors.map(color => color);
            const myColor = newColors.pop();
            newColors.unshift(myColor);
            updateColors(newColors);
            var newCourse = new course(data["0"]["courseName"], data["0"]["courseNumber"], data["0"]["facId"], semester, 
                                    data["0"]["lesson"]["profName"], myColor);
            for(var i=0; i < data.length; i++){
              newCourse.timeOptions.push([data[i]["lesson"], data[i]["practice"]]);
            }
            var newCourseList = {};
            Object.assign(newCourseList, courseList);
            const newList = courseList[semester].list.concat(newCourse);
            const newIds = courseList[semester].ids.concat(newCourse.number);
            newCourseList[semester] = {list: newList, ids: newIds};
            updateCourseList(newCourseList);
            var newDisplay = {};
            Object.assign(newDisplay, optionsDisplay); //copying optionsDisplay dict
            newDisplay[newCourse.number] = "none";
            setDispaly(newDisplay);
            console.log("new course obj ", newCourse);
          }
          
        });

        if(courseList[semester].ids.length > 5){
          setArrowDisplay("block");
        }
    }

    setInput("type course number");
    
  }

  function removeEntry(entry){
    var newColors = colors.map(color => color);
    newColors.push(entry.color);
    updateColors(newColors);
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
    if (courseList[semester].ids.length < 8){
      setArrowDisplay("none");
    }
    var newRemoveFromTotalScore = {"a":[], "b":[]};
    newRemoveFromTotalScore[semester] = [entry.number];
    refreshTotalScore([newRemoveFromTotalScore]);
    console.log("--" + newRemoveFromTotalScore[semester]);
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
  }


  return(
    <div>
      <div id="headline-container">
        <h1 id="main-headline"> Semester Planner </h1>
        <div id="under-line"></div>
      </div>
      <div id="section1">
        <div id="weekly"> <Weekly /> </div>
        <div id="courses-list">
          <div id="headline-container">
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
                  <span key={item.number} id="listEntries" onClick={() => changeOptionsDisplay(item.number)} style={{backgroundColor: item.color}}> {item.name} - {item.number}
                    
                    <ul>{item.timeOptions.map((option) =>
                          <div className="animate__animated animate__flipInX" id="option" style={{display:optionsDisplay[item.number]}}>
                            <p id="lesson"> {option[0]["groupId"]}: {option[0]["profName"]} (שיעור) </p>
                            {option[1].map((practice) => <p id="practice">  {practice["groupId"]}: {practice["profName"]} (תרגול) </p>
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
      <div id="exams-calender"> exams calender </div>
      <div id="exams-list"> exams list</div>
    </div>
    <div id="section3">
      <p id="section3-headline">Biding Advicor</p>
      <div id="biding-advicor"> <BidingAdvicor data={courseList[semester]} arrows={slideArrowDisplay} removeFromTotalScore={removeFromTotalScore} refreshTotalScore={refreshTotalScore} semester={semester}/> </div>
    </div>
      


    </div>
  )
}

export default App
