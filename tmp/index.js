import React from 'react';
import ReactDOM from 'react-dom/client';

//'use strict';

//const e = React.createElement;

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
  
  const examplaeCourse = new course("algo and social media", "03683079", "0300", "a", "", "#accc");
  const root = ReactDOM.createRoot(document.getElementById('biding'));
  root.render(
    <React.StrictMode>
      <div>
          <p> recomended biding score: </p>
  
      </div>
    </React.StrictMode>
  );
  