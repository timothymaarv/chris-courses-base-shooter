class Player {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.powerUp;
  }

  draw(c) {
    c.save();
    // c.translate(this.x, this.y);

    c.fillStyle = this.color;

    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fill();
    // c.closePath();

    c.restore();
  }

  update(context) {
    this.draw(context);

    this.velocity.x *= playerFriction; //slows down the player overtime
    this.velocity.y *= playerFriction;

    this.y += this.velocity.y;
    if (
      // detects screen wrapping
      this.x + this.radius + this.velocity.x <= canvas.width &&
      this.x - this.radius + this.velocity.x >= 0
    ) {
      this.x += this.velocity.x;
    } else {
      this.velocity.x = 0;
    }

    if (
      this.y + this.radius + this.velocity.y <= canvas.height &&
      this.y - this.radius + this.velocity.y >= 0
    ) {
      this.y += this.velocity.y;
    } else {
      this.velocity.y = 0;
    }
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw(c) {
    c.save();
    // c.translate(this.x, this.y);

    c.fillStyle = this.color;

    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fill();
    c.closePath();

    c.restore();
  }

  update(c) {
    this.draw(c);
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.type = "Linear";
    this.radians = 0;
    this.center = {
      x,
      y,
    };

    if (Math.random() < 0.5) {
      this.type = "Follow";

      if (Math.random() < 0.5) {
        this.type = "Spinning";

        if (Math.random() < 0.5) {
          this.type = "Homing Spinning";
        }
      }
    }
  }

  draw(c) {
    c.save();

    c.fillStyle = this.color;

    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fill();
    c.closePath();

    c.restore();
  }

  update(c) {
    this.draw(c);
    if (this.type === "Follow") {
      const x = player.x - this.x;
      const y = player.y - this.y;

      const angle = Math.atan2(y, x);

      const dx = Math.cos(angle);
      const dy = Math.sin(angle);

      this.velocity.x = dx;
      this.velocity.y = dy;

      this.x += this.velocity.x;
      this.y += this.velocity.y;
    } else if (this.type === "Spinning") {
      this.radians += 0.1;

      this.center.x += this.velocity.x;
      this.center.y += this.velocity.y;

      this.x = this.center.x + Math.cos(this.radians) * 50;
      this.y = this.center.y + Math.sin(this.radians) * 50;
    } else if (this.type === "Homing Spinning") {
      this.radians += 0.1;

      const x = player.x - this.x;
      const y = player.y - this.y;

      const angle = Math.atan2(y, x);

      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      this.velocity.x = dx;
      this.velocity.y = dy;

      this.center.x += this.velocity.x;
      this.center.y += this.velocity.y;

      this.x = this.center.x + Math.cos(this.radians) * 30;
      this.y = this.center.y + Math.sin(this.radians) * 30;
    } else {
      // linear
      this.x += this.velocity.x;
      this.y += this.velocity.y;
    }
  }
}

class Particle {
  constructor(x, y, radius, color, velocity, alpha) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1; // alpha | fade particles
  }

  draw(c) {
    c.save(); // lock inside the scope of particle

    c.globalAlpha = this.alpha;
    c.fillStyle = this.color;

    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fill();
    c.closePath();
    c.restore();

    c.restore();
  }

  update(c) {
    this.draw(c);
    this.velocity.x *= friction; // slows down x-axis
    this.velocity.y *= friction; // slows down y-axis

    this.y += this.velocity.y;
    this.x += this.velocity.x;
    this.alpha -= 0.01;
  }
}

class PowerUp {
  constructor({ position = { x: 0, y: 0 }, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.img = new Image();
    this.img.src = "./assets/images/bolt.png";
    this.alpha = 1;
    this.radians = 0;

    gsap.to(this, {
      alpha: 0,
      duration: 0.5,
      ease: "linear",
      repeat: -1,
      yoyo: true,
    });
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(
      this.position.x + this.img.width * 0.5,
      this.position.y + this.img.height * 0.5
    );

    ctx.rotate(this.radians);

    ctx.translate(
      -this.position.x - this.img.width * 0.5,
      -this.position.y - this.img.height * 0.5
    );

    ctx.drawImage(this.img, this.position.x, this.position.y);
    ctx.restore();
  }

  update(ctx) {
    this.draw(ctx);
    this.radians += 0.01;

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class BackgroundParticle {
  constructor({ position, radius = 3, color = "rgba(0, 0, 255, 0.5)" }) {
    this.position = position;
    this.radius = radius;
    this.color = color;

    this.alpha = 0.1;
  }

  draw(ctx) {
    ctx.save();
    ctx.beginPath();

    ctx.globalAlpha = this.alpha;

    ctx.fillStyle = this.color;
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.closePath();

    ctx.restore();
  }
}
