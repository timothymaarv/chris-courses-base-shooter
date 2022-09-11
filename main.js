const canvas = document.querySelector("canvas");
const score = document.getElementById("score");
const restart__wrapper = document.querySelector("#restart__wrapper");
const start__wrapper = document.querySelector("#start__wrapper");
const points = document.querySelector("#points");
const restart = document.querySelector("#restart__button");
const start = document.querySelector("#start__button");
const volumeUp = document.querySelector("#volumeup");
const volumeDown = document.querySelector("#volumedown");

let width = innerWidth;
let height = innerHeight;

canvas.width = width;
canvas.height = height;

// canvas.style.width = `${width}px`;
// canvas.style.height = `${height}px`;

const ctx = canvas.getContext("2d");
const friction = 0.999;
const playerFriction = 0.999;
const gridSpacing = 30;

const mouse = {
  position: {
    x: 0,
    y: 0,
  },
};

let animationID;
let audioInit = false;
let backgroundParticles;
let difficulty = 4000;
let enemies = [];
let frames = 0;
let halfw; // half of the inner width
let halfh; // half of the inner height
let intervalID;
let powerUpInterval;
let scoreNumber = 0;
let spawnPowerUpID;
let particles = [];
let projectiles = [];
let powerUps = [];
let game = {
  active: false,
};
let player;

function init() {
  halfw = canvas.width * 0.5;
  halfh = canvas.height * 0.5;
  animationID;
  backgroundParticles = [];
  enemies = [];
  frames = 0;
  scoreNumber = 0;
  difficulty = 4000;
  particles = [];
  powerUps = [];
  projectiles = [];
  score.textContent = scoreNumber;
  player = new Player(halfw, halfh, 10, "white");
  game = {
    active: true,
  };

  for (let x = 0; x < canvas.width + gridSpacing; x += gridSpacing) {
    for (let y = 0; y < canvas.height + gridSpacing; y += gridSpacing) {
      backgroundParticles.push(
        new BackgroundParticle({
          position: { x, y },
          radius: 3,
        })
      );
    }
  }
}

function createScoreLabel({ text, position }) {
  const label = document.createElement("label");
  label.textContent = text;
  label.style.color = "white";
  label.style.position = "absolute";
  label.style.left = position.x + "px";
  label.style.top = position.y + "px";
  label.style.userSelect = "none";
  label.style.pointerEvents = "none";
  document.body.appendChild(label);

  gsap.to("label", {
    opacity: 0,
    y: -30,
    duration: 0.75,
    onComplete: () => {
      label.parentNode.removeChild(label);
    },
  });
}

function spawnPowerUps() {
  spawnPowerUpID = setInterval(() => {
    powerUps.push(
      new PowerUp({
        position: { x: -30, y: Math.random() * canvas.height },
        velocity: { x: Math.random() * 1, y: 0 },
      })
    );
  }, 20000);
}

function spawnEnemies() {
  intervalID = setInterval(() => {
    const radius = Math.random() * (30 - 10) + 10; //max minus min + min to find a range

    let ex, ey;

    if (Math.random() < 0.5) {
      ex = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      ey = Math.random() * canvas.height;
    } else {
      ex = Math.random() * canvas.width;
      ey = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    const x = player.x - ex;
    const y = player.y - ey;

    const angle = Math.atan2(y, x);

    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    const velocity = {
      x: dx,
      y: dy,
    };

    enemies.push(new Enemy(ex, ey, radius, color, velocity));
  }, difficulty);
}

function animate() {
  frames += 1;
  animationID = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  backgroundParticles.forEach((particle) => {
    particle.draw(ctx);

    const dx = player.x - particle.position.x;
    const dy = player.y - particle.position.y;

    const dist = Math.hypot(dx, dy);

    if (dist < 100) {
      particle.alpha = 0;

      if (dist > 50) {
        particle.alpha = 0.3;
      }
    } else if (dist > 100 && particles.alpha < 0.1) {
      particle.alpha += 0.1;
    } else if (dist > 100 && particle.alpha > 0.1) {
      particle.alpha -= 0.1;
    }
  });

  player.update(ctx);

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerup = powerUps[i];

    if (powerup.position.x > canvas.width) {
      powerUps.splice(i, 1);
    } else {
      powerup.update(ctx);
    }

    const dx = player.x - powerup.position.x;
    const dy = player.y - powerup.position.y;

    const dist = Math.hypot(dx, dy);

    // powerup logic
    if (dist < powerup.img.height / 2 + player.radius) {
      audio.powerup.play();
      //revise
      powerUps.splice(i, 1);
      player.powerUp = "MachineGun";
      player.color = "yellow";

      setTimeout(() => {
        player.powerUp = null;
        player.color = "white";
      }, 5000);
    }
  }

  // machine gun animation

  if (player.powerUp === "MachineGun") {
    const angle = Math.atan2(
      mouse.position.y - player.y,
      mouse.position.x - player.x
    );

    const x = Math.cos(angle) * 3;
    const y = Math.sin(angle) * 3;

    if (frames % 2 === 0) {
      projectiles.push(
        new Projectile(player.x, player.y, 5, "yellow", { x, y })
      );
    }

    if (frames % 5 === 0) {
      audio.shoot.play(); // for every 8 frames
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];

    if (particle.alpha <= 0) {
      particles.slice(i, 1);
    } else {
      particle.update(ctx);
    }
  }

  for (let index = projectiles.length - 1; index >= 0; index--) {
    const projectile = projectiles[index];

    projectile.update(ctx);
    // remove from screen
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      projectiles.splice(index, 1);
    }
  }

  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index];

    enemy.update(ctx);

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    if (dist - enemy.radius - player.radius < 1) {
      restart__wrapper.style.display = "block";
      gsap.fromTo(
        "#restart__wrapper",
        {
          scale: 0.8,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          ease: "expo.out",
        }
      );

      clearInterval(intervalID);
      clearInterval(spawnPowerUpID);
      points.textContent = scoreNumber;
      audio.death.play();
      game.active = false;
      cancelAnimationFrame(animationID);
    }

    for (let pindex = projectiles.length - 1; pindex >= 0; pindex--) {
      const projectile = projectiles[pindex];

      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      // when projectiles touch
      if (dist - enemy.radius - projectile.radius < 1) {
        for (let i = 0; i < enemy.radius * 2; i++) {
          // create explosions
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 10), // negative .5 to .5
                y: (Math.random() - 0.5) * (Math.random() * 10),
              }
            )
          );
        }

        // where enemies get shrinked
        if (enemy.radius - 10 > 5) {
          audio.damage.play();
          scoreNumber += 50;
          score.textContent = scoreNumber;
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          createScoreLabel({
            text: 50,
            position: { x: projectile.x, y: projectile.y },
          });
          projectiles.splice(pindex, 1);
          //  remove enemies
        } else {
          audio.explode.play();
          // waits for the next frame to remove as to avoid flickering
          projectiles.splice(pindex, 1);
          enemies.splice(index, 1);
          scoreNumber += 100;
          score.textContent = scoreNumber;
          createScoreLabel({
            text: 100,
            position: { x: projectile.x, y: projectile.y },
          });

          backgroundParticles.forEach((particle) => {
            gsap.set(particle, {
              color: "white",
              alpha: 0.03,
            });

            gsap.to(particle, {
              color: enemy.color,
              alpha: 0.03,
            });
          });
        }
      }
    }
  }
}

start.addEventListener("click", () => {
  audio.select.play();
  init();
  animate();
  spawnEnemies();
  spawnPowerUps();
  // start__wrapper.style.display = "none";
  gsap.to("#start__wrapper", {
    opacity: 0,
    scale: 0.8,
    duration: 0.2,
    ease: "expo.in",
    onComplete: () => {
      start__wrapper.style.display = "none";
    },
  });
});

restart.addEventListener("click", () => {
  audio.select.play();
  init();
  animate();
  spawnEnemies();
  spawnPowerUps();
  gsap.to("#restart__wrapper", {
    opacity: 0,
    scale: 0.8,
    duration: 0.2,
    ease: "expo.in",
    onComplete: () => {
      restart__wrapper.style.display = "none";
    },
  });
});

function shoot(x, y) {
  const clientX = x;
  const clientY = y;

  if (!audio.background.playing() && !audioInit) {
    audio.background.play();
    audioInit = true;
  }

  if (game.active) {
    const angle = Math.atan2(clientY - player.y, clientX - player.x);

    const x = Math.cos(angle) * 3;
    const y = Math.sin(angle) * 3;

    projectiles.push(new Projectile(player.x, player.y, 5, "white", { x, y }));

    audio.shoot.play();
  }
}

addEventListener("touchmove", (e) => {
  mouse.position.x = e.touches[0].clientX;
  mouse.position.y = e.touches[0].clientY;
});

addEventListener("touchstart", (e) => {
  const touch = e.touches[0];

  const clientX = touch.clientX;
  const clientY = touch.clientY;

  shoot(clientX, clientY);
});

addEventListener("click", (e) => {
  const clientX = e.clientX;
  const clientY = e.clientY;

  shoot(clientX, clientY);
});

// mute everything
volumeUp.addEventListener("click", () => {
  audio.select.play();
  audio.background.pause();
  volumeUp.style.display = "none";
  volumeDown.style.display = "block";

  for (let key in audio) {
    // get keys from audio object

    audio[key].mute(true);
  }
});

volumeDown.addEventListener("click", () => {
  audio.select.play();
  if (audioInit) {
    audio.background.play();
    for (let key in audio) {
      // get keys from audio object

      audio[key].mute(false);
    }
  }
  volumeDown.style.display = "none";
  volumeUp.style.display = "block";
});

addEventListener("mousemove", (e) => {
  mouse.position.x = e.clientX;
  mouse.position.y = e.clientY;
});

addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  init();
});

addEventListener("keydown", (e) => {
  const { key } = e;
  switch (key) {
    case "w":
      player.velocity.y -= 1;
      break;
    case "s":
      player.velocity.y += 1;
      break;
    case "a":
      player.velocity.x -= 1;
      break;
    case "d":
      player.velocity.x += 1;
      break;
    case "ArrowUp":
      player.velocity.y -= 1;
      break;
    case "ArrowDown":
      player.velocity.y += 1;
      break;
    case "ArrowLeft":
      player.velocity.x -= 1;
      break;
    case "ArrowRight":
      player.velocity.x += 1;
      break;
    default:
      break;
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInterval(intervalID);
    clearInterval(spawnPowerUpID);
    // inactive
    // clear intervals
  } else {
    spawnEnemies();
    spawnPowerUps();
    // spawn enemies, powerups
  }
});

// splice from the end instead using for loop - also removes flashing
//  we got flashing bc the forEach kept being called
// remove interval
