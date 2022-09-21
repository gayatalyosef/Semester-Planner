import React from 'react';
import 'animate.css';



function BidingAdvicor(coursesInfo){
    //coursesInfo.data.list.map((course) => getBidingScore(course)); //initial viding scores

    const [bidingScore, setBidingScore] = React.useState({});
    const idlst = coursesInfo.data.ids;

    const animateCSS = (element, animation, prefix = 'animate__') =>
        // We create a Promise and return it
        new Promise((resolve, reject) => {
            const animationName = `${prefix}${animation}`;
            //const node = document.querySelector(element);
            const node = element;
            node.classList.add(`${prefix}animated`, animationName);
            // When the animation ends, we clean the classes and resolve the Promise
            function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve('Animation ended');
            }
            node.addEventListener('animationend', handleAnimationEnd, {once: true});
         });

    
    
    function getBidingScore(course){
        const requestInfo = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({"name": course.name, "number": course.number, "faculltyId": course.faculltyId,
            "semester": course.semester, "profName": course.profName })
        };
        console.log("fetching /bidingScore")
        fetch("/bidingScore", requestInfo).then(res => res.json()).then(data =>{
            var newBidingScore = {};
            Object.assign(newBidingScore, bidingScore);
            newBidingScore[course.number] = data;
            setBidingScore(newBidingScore);
        });
        
    }

    function flipCoin(coin, id){
        getBidingScore(coin);

        const elem = document.getElementById(id);
        const d = elem.getAttribute("direction");
        if (d === "front"){
            elem.setAttribute("direction", "back");
        } else{
            elem.setAttribute("direction", "front");
        }

        animateCSS(elem, "flipInY");
    }


    return(
        <div> 
            <p id="biding-advicor-explain"> The biding advicor tool calculates the recomended number of points for each course for the biding.<br></br>
                The recommended score is determined by the statistics of the closing scores from previous years with the same lecturer.<br></br>
                In the event that a lecturer teaches the course for the first time, the tool will return the maximum closing score from the last few years. </p>
            <div id="slider">      
                {coursesInfo.data.list.map((course) =>
                    <div className="biding-coin" id={idlst.indexOf(course.number)} onClick={() => flipCoin(course, idlst.indexOf(course.number))} direction="front">
                            <div id="biding-circle" className="animate__animated animate__flipInY" style={{backgroundColor: course.color}}> 
                                <div id="coin-front"> <p id="coin-course-name">{course.name}</p> </div>
                                <div id="coin-back" > <h3 id="coin-score"> {bidingScore[course.number]}</h3></div>
                            </div>
  
                    </div>
                )}

            </div> 


        
        </div>
    )

}


export default BidingAdvicor;
