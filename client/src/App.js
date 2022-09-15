import React from 'react'

class course{
  constructor(name, number, faculltyId, semester, profName, color){
  this.name = name;
  this.number = number;
  this.faculltyId = faculltyId;
  this.semester = semester;
  this.profName = profName;
  this.color = color;
  }
}

function App(){

  const examplaeCourse = new course("product security and digital", "03683079", "0300", "a", "", "#accc");
  const linearExample = new course("linear algebra 1a", "03661111", "0300", "a", "", "#accc")

  function getBidingScore(myCourse){
    const requestInfo = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({"name": myCourse.name, "number": myCourse.number, "faculltyId": myCourse.faculltyId,
      "semester": myCourse.semester, "profName": myCourse.profName })
    };

    console.log("fetching /bidingScore")
   // fetch("/bidingScore", requestInfo).then(res => res.json()).then(data => console.log(data))

    fetch("/courseDetails", requestInfo).then(res => res.json()).then(data => console.log(data))
    
    
  }


  return(
    <div>

      <button id="biding" onClick={() => getBidingScore(linearExample)}> recomended score </button>

    </div>
  )
}

export default App
