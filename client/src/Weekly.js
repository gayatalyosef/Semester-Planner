import React from 'react';
import 'animate.css';

class calenderEvent{
    constructor(day, startTime, endTime, name, id){
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
        this.name = name;
        this.id = id;
    }
}


function Weekly(){
    const test = new calenderEvent("Sunday", "9", "11", "לינארית", "1");

   
   /* elem.style.gridRowStart = 3;
    elem.style.gridRowEnd = 6;
    elem.style.gridColumnStart = 2;
    elem.style.gridColumnEnd = 3;
    elem.style.backgroundColor = "red";*/
    

    return(
        <div>
            <p id="hours-counter">  Hours: </p>
            <div id="week-calender"> 
                <div> </div>
                <div className="day"> Sunday </div>
                <div className="day"> Monday </div>
                <div className="day"> Tuesday </div>
                <div className="day"> Wednesday </div>
                <div className="day"> Thursday </div>
                <div className="day"> Friday </div>
                <div className="hour"> 8:00 </div>
                <div className="free-cell" row="1" col="1"></div>
                <div className="free-cell" row="1" col="2"></div>
                <div className="free-cell" row="1" col="3"></div>
                <div className="free-cell" row="1" col="4"></div>
                <div className="free-cell" row="1" col="5"></div>
                <div className="free-cell" row="1" col="6"></div>
                <div className="hour"> 9:00 </div>
                <div className="free-cell" row="2" col="1"></div>
                <div className="free-cell" row="2" col="2"></div>
                <div className="free-cell" row="2" col="3"></div>
                <div className="free-cell" row="2" col="4"></div>
                <div className="free-cell" row="2" col="5"></div>
                <div className="free-cell" row="2" col="6"></div>
                <div className="hour"> 10:00 </div>
                <div className="free-cell" row="3" col="1"></div>
                <div className="free-cell" row="3" col="2"></div>
                <div className="free-cell" row="3" col="3"></div>
                <div className="free-cell" row="3" col="4"></div>
                <div className="free-cell" row="3" col="5"></div>
                <div className="free-cell" row="3" col="6"></div>
                <div className="hour"> 11:00 </div>
                <div className="free-cell" row="4" col="1"></div>
                <div className="free-cell" row="4" col="2"></div>
                <div className="free-cell" row="4" col="3"></div>
                <div className="free-cell" row="4" col="4"></div>
                <div className="free-cell" row="4" col="5"></div>
                <div className="free-cell" row="4" col="6"></div>
                <div className="hour"> 12:00 </div>
                <div className="free-cell" row="5" col="1"></div>
                <div className="free-cell" row="5" col="2"></div>
                <div className="free-cell" row="5" col="3"></div>
                <div className="free-cell" row="5" col="4"></div>
                <div className="free-cell" row="5" col="5"></div>
                <div className="free-cell" row="5" col="6"></div>
                <div className="hour"> 13:00 </div>
                <div className="free-cell" row="6" col="1"></div>
                <div className="free-cell" row="6" col="2"></div>
                <div className="free-cell" row="6" col="3"></div>
                <div className="free-cell" row="6" col="4"></div>
                <div className="free-cell" row="6" col="5"></div>
                <div className="free-cell" row="6" col="6"></div>
                <div className="hour"> 14:00 </div>
                <div className="free-cell" row="7" col="1"></div>
                <div className="free-cell" row="7" col="2"></div>
                <div className="free-cell" row="7" col="3"></div>
                <div className="free-cell" row="7" col="4"></div>
                <div className="free-cell" row="7" col="5"></div>
                <div className="free-cell" row="7" col="6"></div>
                <div className="hour"> 15:00 </div>
                <div className="free-cell" row="8" col="1"></div>
                <div className="free-cell" row="8"col="2"></div>
                <div className="free-cell" row="8" col="3"></div>
                <div className="free-cell" row="8" col="4"></div>
                <div className="free-cell" row="8" col="5"></div>
                <div className="free-cell" row="8" col="6"></div>
                <div className="hour"> 16:00 </div>
                <div className="free-cell" row="9" col="1"></div>
                <div className="free-cell" row="9" col="2"></div>
                <div className="free-cell" row="9" col="3"></div>
                <div className="free-cell" row="9" col="4"></div>
                <div className="free-cell" row="9" col="5"></div>
                <div className="free-cell" row="9" col="6"></div>
                <div className="hour"> 17:00 </div>
                <div className="free-cell" row="10" col="1"></div>
                <div className="free-cell" row="10" col="2"></div>
                <div className="free-cell" row="10" col="3"></div>
                <div className="free-cell" row="10" col="4"></div>
                <div className="free-cell" row="10" col="5"></div>
                <div className="free-cell" row="10" col="6"></div>
                <div className="hour"> 18:00 </div>
                <div className="free-cell" row="11" col="1"></div>
                <div className="free-cell" row="11" col="2"></div>
                <div className="free-cell" row="11" col="3"></div>
                <div className="free-cell" row="11" col="4"></div>
                <div className="free-cell" row="11" col="5"></div>
                <div className="free-cell" row="11" col="6"></div>
                <div className="hour"> 19:00 </div>
                <div className="free-cell" row="12" col="1"></div>
                <div className="free-cell" row="12" col="2"></div>
                <div className="free-cell" row="12" col="3"></div>
                <div className="free-cell" row="12" col="4"></div>
                <div className="free-cell" row="12" col="5"></div>
                <div className="free-cell" row="12" col="6"></div>
                <div className="hour"> 20:00 </div>
                <div className="free-cell" row="13" col="1"></div>
                <div className="free-cell" row="13" col="2"></div>
                <div className="free-cell" row="13" col="3"></div>
                <div className="free-cell" row="13" col="4"></div>
                <div className="free-cell" row="13" col="5"></div>
                <div className="free-cell" row="13" col="6"></div>
                <div className="hour" id="last-line"> 21:00 </div>
                <div className="free-cell" id="last-line" row="14" col="1"></div>
                <div className="free-cell" id="last-line" row="14" col="2"></div>
                <div className="free-cell" id="last-line" row="14" col="3"></div>
                <div className="free-cell" id="last-line" row="14" col="4"></div>
                <div className="free-cell" id="last-line" row="14" col="5"></div>
                <div className="free-cell" id="last-line" row="14" col="6"></div>
                

                <div id="event">  </div>
                

            </div>
        </div>
    )


}

export default Weekly;
