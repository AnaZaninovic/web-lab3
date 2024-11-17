const canvas = document.getElementById("myCanvas");
const content = canvas.getContext("2d");

playerSore = 0;

let bricks = [];
let brick = {
    width: 100,  
    height: 33,  
    rowcount: 5,  
    columncount: 10,  
    padding: 10,  
    lside: 30,  
    rside: 30  
};

let colorOrder = ["red", "orange", "yellow", "green", "blue", "purple"];

let player = {
    x: window.innerWidth / 2 - 75, 
    y: window.innerHeight - 30, 
    width: 150, 
    height: 20, 
    dx: 5
};

let ball = {
    x: player.x + 75,  
    y: player.y - 10, 
    radius: 10, 
    vx: 10, 
    vy: -2,  
    dx: 5, 
    dy: -5
};

let gameDone = false;
let win = false;

// crtanje palice igraca
function drawPlayer() {
    content.fillStyle = "red";
    content.shadowColor = "gray";
    content.shadowOffsetX = 5;
    content.shadowOffsetY = 5;
    content.fillRect(player.x, player.y, player.width, player.height);
}

//crtranje nablice za score i highscore
function drawScoreTable() {
    content.font = "36px Arial ";
    content.fillStyle = "black";
    
    // highscore inicijalizacija
    if (localStorage.getItem("highScore") === null) {
        localStorage.setItem("highScore", 0);
    }

    //novi highscore
    if (playerSore >= localStorage.getItem("highScore")) {
        localStorage.setItem("highScore", playerSore);
    }

    //pobjeda
    if (playerSore === brick.rowcount * brick.columncount) {
        win = true;
        gameDone = true;
    }

    //ispis highscore-a i score-a
    content.fillText("High Score: " + localStorage.getItem("highScore"), canvas.width - 300, 80);
    content.fillText("Score: " + playerSore, canvas.width - 300, 40);

    //ispis pobjede
    if (win) {
        content.fillText("YOU WIN, CONGRATULATIONS!", canvas.width / 2 - 100, canvas.height / 2);
        localStorage.setItem("highScore", playerSore);
    }
}

// namjestanje kuta loptice
function angleBall() {
    let randomAngle = Math.random() * Math.PI / 2 + Math.PI / 4;
    let speed = 5;
    
    ball.dx = speed * Math.cos(randomAngle);
    ball.dy = -speed * Math.sin(randomAngle);
}

//crtanje loptice
function drawBall() {
  content.fillStyle = "blue";
  content.beginPath();
  content.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  content.fill();
  content.closePath();
}

//inicijalizacija cigli
function createBricks() {
  for (let i = 0; i < brick.rowcount; i++) {
    bricks[i] = [];
    for (let j = 0; j < brick.columncount; j++) {
      bricks[i][j] = { x: 0, y: 0, state: 1 };
    }
  }
}

//crtanje pojedinacnih cigli
function drawBricks() {
  for (let i = 0; i < brick.rowcount; i++) {
    for (let j = 0; j < brick.columncount; j++) {
      if (bricks[i][j].state == 1) {
        let brickX = (j * (brick.width + brick.padding)) + brick.lside;
        let brickY = (i * (brick.height + brick.padding)) + brick.rside;
        bricks[i][j].x = brickX;
        bricks[i][j].y = brickY;
        content.fillStyle = colorOrder[i];
        content.fillRect(brickX, brickY, brick.width, brick.height);
        content.strokeStyle = "black";
        content.strokeRect(brickX, brickY, brick.width, brick.height);
      }
    }
  }
}

//crtanje elemenata
function draw() {
    if (gameDone) return;
  
    content.clearRect(0, 0, canvas.width, canvas.height);
    
    // crtanje elemenata
    drawPlayer();
    drawBall();
    drawBricks();
    drawScoreTable();
  
    //loptica - kretanje
    ball.x += ball.dx;
    ball.y += ball.dy;
  
    //loptica - zid kolizija
    if (ball.y + ball.dy < ball.radius) {
      ball.dy = -ball.dy; // Reflect the ball when it hits the top
    }
    if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
      ball.dx = -ball.dx; // Reflect the ball when it hits the left or right walls
    }
  
    // loptica - palica kolizija
    if (ball.y + ball.radius > canvas.height - player.height) {
      if (ball.x > player.x && ball.x < player.x + player.width) {
        ball.dy = -ball.dy; // Ball bounces off the paddle
      } else {
        gameDone = true;
        content.font = "36px Arial ";
        content.fillStyle = "black";
        content.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2);
      }
    }
  
    // loptica - cigle kolizija
    for (let i = 0; i < brick.rowcount; i++) {
      for (let j = 0; j < brick.columncount; j++) {
        let b = bricks[i][j];
        if (b.state == 1) {  

          if (ball.x > b.x && ball.x < b.x + brick.width && ball.y > b.y && ball.y < b.y + brick.height) {
            ball.dy = -ball.dy; 
            b.state = 0; 
            playerSore += 1; // promjena score-a
          }
        }
      }
    }
  
    // palica - kretanje
    if (rightPressed && player.x < canvas.width - player.width) {
        player.x += (shiftPressed ? player.dx * 2 : player.dx);  
    } else if (leftPressed && player.x > 0) {
        player.x -= (shiftPressed ? player.dx * 2 : player.dx);  
    }
  
    // novi frame
    requestAnimationFrame(draw);
  }


let rightPressed = false;
let leftPressed = false;
let shiftPressed = false;

// Key event listeneri za palicu
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

//pritisak tipke
function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      leftPressed = true;
    }
    if (e.key === "Shift" || e.key === "ShiftLeft" || e.key === "ShiftRight") {
      shiftPressed = true;  
    }
  }

//otpustanje tipke
function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        leftPressed = false;
    }
    if (e.key === "Shift" || e.key === "ShiftLeft" || e.key === "ShiftRight") {
        shiftPressed = false;
    }
}


// inicijalizacija parametara ovisnih o velicini ekrana
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

brick.width = (canvas.width - brick.lside - brick.rside - brick.padding * (brick.columncount - 1)) / brick.columncount;
brick.height = canvas.height / 20;

player.width = canvas.width / 10;
player.height = canvas.height / 40;

// inicijalizacija igre
createBricks();
angleBall();
draw();
