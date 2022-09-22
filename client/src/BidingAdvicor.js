import React from 'react';
import 'animate.css';
import {MdChevronLeft, MdChevronRight} from 'react-icons/md'

function BidingAdvicor(coursesInfo){
    const darkerColors = {"#C6F1FE":"#add3de", "#C7CEEA":"#b1b7d2", "#B5EAD7":"#99c7b6","#FFDAC1":"#e9c6b0", "#FF9AA2":"#FF9AA2", "#FFFFD8":"#FFFFD8", "#9DBBEA":"#9DBBEA",
    "#F8C8DC":"#F8C8DC", "#B9E9E3":"#B9E9E3" };
    const [bidingScore, setBidingScore] = React.useState({"a":{}, "b":{}});
    const [totalScore, setTotalScore] = React.useState({"a": "-", "b": "-"});
    const idlst = coursesInfo.data.ids;
    const semester = coursesInfo.semester;

    React.useEffect(() => {
        if(totalScore[semester] !== "-"){
            var newTotalScore = {};
            Object.assign(newTotalScore, totalScore);
            newTotalScore[semester] = totalScore[semester] - bidingScore[semester][coursesInfo.removeFromTotalScore["0"][semester][0]];
            if (newTotalScore[semester] === 0){
                newTotalScore[semester] = "-";
                setTotalScore(newTotalScore);
            } else{
                setTotalScore(newTotalScore);
            }
            var newBidingScore = {};
            Object.assign(newBidingScore, bidingScore);
            delete(newBidingScore[semester][coursesInfo.removeFromTotalScore["0"][semester][0]]);
            setBidingScore(newBidingScore); 
        } 
    } , [coursesInfo.removeFromTotalScore]);

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
            newBidingScore[semester][course.number] = data;
            setBidingScore(newBidingScore);
            var newTotalScore = {};
            Object.assign(newTotalScore, totalScore);
            if (totalScore[semester] === "-"){
                newTotalScore[semester] = data;
                setTotalScore(newTotalScore);
            } else{
                newTotalScore[semester] = parseInt(totalScore[semester]) + parseInt(data);
                setTotalScore(newTotalScore);
            }
        });
        
    }

    function flipCoin(coin, id){
        //calc score at backend
        if (!(coin.number in bidingScore[semester])){
            getBidingScore(coin);
        }
        //flip the coin
        const elem = document.getElementById(id);
        const d = elem.getAttribute("direction");
        if (d === "front"){
            elem.setAttribute("direction", "back");
        } else{
            elem.setAttribute("direction", "front");
        }
        animateCSS(elem, "flipInY");   
    }

    function slideLeft(){
        var slider = document.getElementById('slider');
        slider.scrollLeft = slider.scrollLeft - 500;
    }

    function slideRight(){
        var slider = document.getElementById('slider');
        slider.scrollLeft = slider.scrollLeft + 500;
    }

    


    return(
        <div> 
            <p id="biding-advicor-explain"> The biding advicor tool calculates the recomended number of points for each course for the biding.<br></br>
                The recommended score is determined by the statistics of the closing scores from previous years with the same lecturer.<br></br>
                In the event that a lecturer teaches the course for the first time, the tool will return the maximum closing score from the last few years. </p>
            
            <div id="slider-container">
                <MdChevronLeft id="slider-arrows" size={30} onClick={slideLeft} style={{display: coursesInfo.arrows}}/>
                <div id="slider">      
                    {coursesInfo.data.list.map((course) =>
                        <div className="biding-coin" id={idlst.indexOf(course.number)} onClick={() => flipCoin(course, idlst.indexOf(course.number))} direction="front">
                                <div id="biding-circle" className="animate__animated animate__flipInY" style={{backgroundColor: course.color}}> 
                                    <div id="decor" style={{borderColor: course.color }}> </div>
                                    <div id="coin-front"> <p id="coin-course-name">{course.name}</p> </div>
                                    <div id="coin-back" > <h3 id="coin-score"> {bidingScore[semester][course.number]}</h3></div>
                                </div>
    
                        </div>
                    )}

                </div>
                <MdChevronRight id="slider-arrows" size={30} onClick={slideRight} style={{display: coursesInfo.arrows}}/> 
            </div>
            <p id="total-points"> Total points required: {totalScore[semester]} </p>
            <p id="total-points-exp"> <i className="fa-solid fa-circle-info"></i> click on a course to add it to the calculation </p>
        
        </div>
    )

}


export default BidingAdvicor;
