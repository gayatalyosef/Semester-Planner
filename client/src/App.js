import React from 'react';
import 'animate.css';
import { animate } from 'framer-motion';

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
  const examplaeCourse = new course("product security and digital", "03683079", "0300", "a", "", "#accc");
  //const linearExample = new course("linear algebra 1a", "03661111", "0300", "a", "", "#accc");

  /* states */
  const [userInput, setInput] = React.useState("type course number");
  const [semesterAlist, updateAList] = React.useState({
    list: [],
    ids: []});
  const [optionsDisplay, setDispaly] = React.useState({});
  const [colors, updateColors] = React.useState(["#9DBBEA", "#FFFFD8","#FF9AA2", "#FFDAC1","#B5EAD7", "#C7CEEA", "#C6F1FE"]);

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
    if (userInput.length === 8 && !semesterAlist.ids.includes(userInput)){
      const requestInfo = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({"number": userInput, "semester": "a"})
      };
  
      fetch("/courseDetails", requestInfo)
      .then((res) => res.json())
        .then((data) => {
          if (data["0"] === "course not found error"){
            console.log("there was an error");
          } else{
            const newColors = colors.map(color => color);
            const myColor = newColors.pop();
            newColors.unshift(myColor);
            updateColors(newColors);
            console.log(colors);
            var newCourse = new course(data["0"]["courseName"], data["0"]["courseNumber"], data["0"]["facId"],null, 
                                    data["0"]["lesson"]["profName"], myColor);
            for(var i=0; i < data.length; i++){
              newCourse.timeOptions.push([data[i]["lesson"], data[i]["practice"]]);
            }
            const newList = semesterAlist.list.concat(newCourse);
            const newIds = semesterAlist.ids.concat(newCourse.number);
            updateAList({list: newList, ids: newIds});
            var newDisplay = {};
            Object.assign(newDisplay, optionsDisplay); //copying optionsDisplay dict
            newDisplay[newCourse.number] = "none";
            console.log(newDisplay);
            setDispaly(newDisplay);


            console.log("new course obj ", newCourse);
          }
          
        });
    }

    setInput("type course number");
    
  }

  function removeEntry(entry){
    var newColors = colors.map(color => color);
    newColors.push(entry.color);
    updateColors(newColors);
    const newList = semesterAlist.list.filter(item => item.number !== entry.number);
    const newIds = semesterAlist.ids.filter(id => id !== String(entry.number));
    updateAList({list: newList, ids: newIds});
    //removig item from optionsDisplay list
    const newDisplay = {};
    Object.assign(newDisplay, optionsDisplay); //copying optionsDisplay dict
    delete newDisplay[entry.number];
    setDispaly(newDisplay);
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

 


  function getBidingScore(myCourse){
    const requestInfo = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({"name": myCourse.name, "number": myCourse.number, "faculltyId": myCourse.faculltyId,
      "semester": myCourse.semester, "profName": myCourse.profName })
    };

    console.log("fetching /bidingScore")
    fetch("/bidingScore", requestInfo).then(res => res.json()).then(data => console.log(data));
  }

  return(
    <div>
      <div id="headline-container">
        <h1 id="main-headline"> Semester Planner </h1>
        <div id="under-line"></div>
      </div>
      <div id="section1">
        <div id="weekly"> weekly </div>
        <div id="courses-list">
          <p id="list-headline"> Courses List </p>
          <div id="list">
            <input id="input-course" type="text" value={userInput} onChange={handleChange}
              onClick={(e) => {clearInput(e)}} onKeyDown={(e) => enterPress(e)} maxLength="8" />
            <i className="fa-regular fa-square-plus fa-xl" id="plus-icon" onClick={addNewEntry}></i>
            <ul id="entries-container">
              {semesterAlist.list.map((item) => (
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
      <div id="biding-advicor"> </div>
    </div>
      

    <button id="biding" onClick={() => getBidingScore(examplaeCourse)}> recomended score </button>

    </div>
  )
}

export default App
