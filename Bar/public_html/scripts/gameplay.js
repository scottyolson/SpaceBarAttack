/*jslint browser: true, white: true, plusplus: true */
/*global GAME, console, KeyEvent, requestAnimationFrame, performance */
GAME.screens['game-play'] = (function() {
    'use strict';

    var myKeyboard = GAME.input.Keyboard(),
            cancelNextRequest = false,
            outerRect = null,
            innerRect = null,
            playerRect = null,
            explosion = null,
            themeSong = null,
            explode = null,
            themeSongTimer = 0,
            score = 1,
            level = 1,
            scoreText = null,
            gameOverText = null,
            maxLevel = 6,
            stop = false,
            scoreMultiplier = 1.0,
            pause = 0,
            gameOverCount = 0,
            gameOver = false,
            explode = new Audio('sounds/explode.wav'),
            levelUp = new Audio('sounds/levelUp.mp3');
            
    var inGreen = function(xMin, xMax, xSelf) {
        if(xSelf >= xMin && xSelf <= xMax)
            return true;
        else
            return false;
    };
    
    var updateStop = function(){
        stop = true;
        pause = 0;
    };
    
    var movePlayer = function(elapsedTime){
        if (!stop)
            playerRect.updatePlayer(outerRect.getX() - 300, outerRect.getX() + 450, elapsedTime);
        else {
            var playOn = inGreen(innerRect.getX() - (innerRect.getWidth() / 2), innerRect.getX() + (innerRect.getWidth() / 2), playerRect.getX());
            if (playOn) {
                //shrink inner box and set stop to false, add score to box
                if (pause >= 1500) {
                    scoreText.updateScore(scoreMultiplier);
                    levelUp.play();
                    if (level !== 6) {
                        scoreMultiplier += .2;
                        level++;
                        innerRect.setWidth(innerRect.getWidth() / 1.7);
                    }
                    else
                        scoreMultiplier = 2.0;
                    stop = false;
                }
            }
            else {
                //show game over and show particle system
                explosion.updatePos(playerRect.getX(), playerRect.getY()-20);
                for (var i = 0; i < 30; i++)
                    explosion.create();
                explode.play();
                stop = true;
                gameOver = true;
            }
        }
        
    };

    function initialize() {
        console.log('game initializing...');

        //
        // Create the keyboard input handler and register the keyboard commands
        myKeyboard.registerCommand(KeyEvent.DOM_VK_ESCAPE, function() {
            //
            // Stop the game loop by canceling the request for the next animation frame
            cancelNextRequest = true;
            //
            // Then, return to the main menu
            GAME.game.showScreen('main-menu');
        });
        
        outerRect = GAME.graphics.Texture( {
            image : GAME.images['images/blue.png'],
            center : { x : GAME.screenWidth/2, y : GAME.screenHeight/2 },
            width : 1000, height : 600,
            rotation : 0,
            moveRate : 200,			// pixels per second
            rotateRate : 3.14159	// Radians per second
	});

        innerRect = GAME.graphics.Texture({
            image: GAME.images['images/green.png'],
            center: {x: outerRect.getX(), y: outerRect.getY()},
            width: 800, height: 600,
            rotation: 0,
            moveRate: 200, // pixels per second
            rotateRate : 3.14159	// Radians per second
	});
        
        playerRect = GAME.graphics.Texture({
            image: GAME.images['images/yellow.png'],
            center: {x: outerRect.getX() - 300, y: outerRect.getY()},
            width: 20, height: 600,
            rotation: 0,
            moveRate: 650, // pixels per second
            rotateRate : 3.14159	// Radians per second
        });
        
        scoreText = GAME.graphics.Text({
            text: 1,
            font: '60px Arial, sans-serif',
            fill: 'rgba(0, 0, 225, 1)',
            stroke: 'rgba(255, 255, 255, 1)',
            pos: {x: 50, y: 20},
            rotation: 0
        });
        
        gameOverText = GAME.graphics.Text({
            text: 'GAME OVER!!!',
            font: '90px Arial, sans-serif',
            fill: 'rgba(255, 0, 0, 1)',
            stroke: 'rgba(255, 255, 255, 1)',
            pos: {x: GAME.screenWidth/2 - 200, y: 20},
            rotation: 0
        });
        
        
        
        explosion = particleSystem({
            image: GAME.images['images/yellowBall.png'],
            center: {x: playerRect.getX(), y: playerRect.getY()},
            size: {mean: 100, std: 10},
            speed: {mean: 20, stdev: 2},
            lifetime: {mean: 2, stdev: 1}  
        }, GAME.graphics
        );
        
        themeSong = GAME.audio({
            sound: 'sounds/superMario.mp3',
            duration: 85,
            volume: .9
        });
        
//        themeSong.play();
    }

    //This is the main update function where various frameworks can be updated
    //
    function gameUpdate(elapsedTime) {
        myKeyboard.update(elapsedTime);
        
//        themeSongTimer += elapsedTime;
//        if(themeSongTimer >= themeSong.duration){
//            themeSong.play();
//            themeSongTimer = 0;
//	}
        
        pause += elapsedTime;
        
        if(gameOver)
            //start counting up this counter
            gameOverCount += elapsedTime;
        
        if(gameOverCount >= 3000){
            //go back to main menu after 3 seconds
             // Stop the game loop by canceling the request for the next animation frame
            cancelNextRequest = true;
            //
            // Then, return to the main menu
            location.reload();
        }
        
        //move player
        if(!gameOver){
            movePlayer(elapsedTime);
        }
        
        //update particle system
        explosion.update(elapsedTime/1000);
    }

    //This is the main render function where various frameworks are rendered
    //
    function gameRender(elapsedTime) {
        GAME.graphics.clear();

        //draw outer and inner boxes
        outerRect.draw();
        innerRect.draw();
        if(!gameOver)
            playerRect.draw();
        else{
            gameOverText.draw();
        }
        
        //draw score
        scoreText.draw();
        
        //draw particle system
        explosion.render();
    }

    //------------------------------------------------------------------
    //
    // This is the Game Loop function!
    //
    //------------------------------------------------------------------
    function gameLoop(time) {
        GAME.elapsedTime = time - GAME.lastTimeStamp;
        GAME.lastTimeStamp = time;

        gameUpdate(GAME.elapsedTime);
        gameRender(GAME.elapsedTime);

        if (!cancelNextRequest) {
            requestAnimationFrame(gameLoop);
        }
    }

    function run() {
        GAME.lastTimeStamp = performance.now();
        //
        // Start the animation loop
        myKeyboard.registerCommand(KeyEvent.DOM_VK_SPACE, updateStop);
        
        cancelNextRequest = false;
        requestAnimationFrame(gameLoop);
    }

    return {
        initialize: initialize,
        run: run
    };
}());
