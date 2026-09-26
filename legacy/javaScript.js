const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");

let gameOver = false;
let foodX , foodY;
let snakeBody = [];
let snakeX = 5 , snakeY = 10;
let moveX = 0 , moveY = 0;
let setIntervalId;
let score = 0;


// Save Score
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;


const handleGameOver = ()=> {
    clearInterval(setIntervalId);
    alert("Game Over , Press Ok!");
    location.reload()
}


// change food position
const changeFood = ()=> {
    foodX = Math.floor(Math.random() * 30 ) + 1;
    foodY = Math.floor(Math.random() * 30 ) + 1;
}


const initGame = ()=> {
    if(gameOver) return handleGameOver();
    let htmlMarkup = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

    // checking if the snake eate the food
    if(snakeX === foodX && snakeY === foodY){
        changeFood();
        snakeBody.push([foodX , foodY]);//pushing food position to snake's body array
        score ++;
        highScore = score >= highScore ? score : highScore;
        localStorage.setItem("high-score" , highScore)
        scoreElement.innerHTML = `Score: ${score}`;
        highScoreElement.innerHTML = `High Score: ${highScore}`;
    }


    // Shiftting element by one
    for (let i= snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
        
    }

    // updating The snake's position
    snakeX+=moveX;
    snakeY+=moveY;
    
    snakeBody[0] = [snakeX , snakeY]

    

    if(snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30){
        gameOver = true;
    }

    for (let i = 0; i < snakeBody.length; i++) {
        htmlMarkup += `<div class="snake" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
        if(i !== 0 && snakeBody[0][1] === snakeBody[i][1] && snakeBody[0][0] === snakeBody[i][0]){
            gameOver = true;  //game over if the snake hits her body
        }
    }
    playBoard.innerHTML = htmlMarkup;
}


const changeDirection = (e) => {
    if(e.key === "ArrowUp" && moveY != 1){
        moveX = 0;
        moveY = -1;
    }else if(e.key === "ArrowDown" && moveY != -1){
        moveX = 0;
        moveY = 1;
    }else if(e.key === "ArrowLeft" && moveX != 1){
        moveX = -1;
        moveY = 0;
    }else if(e.key === "ArrowRight" && moveX != 1){
        moveX = 1;
        moveY = 0;
    }

   initGame()


}











changeFood();
setIntervalId = setInterval(initGame() , 125);
document.addEventListener("keydown" , changeDirection)