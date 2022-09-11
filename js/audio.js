volume = 0.1;

const audio = {
  shoot: new Howl({
    src: "./assets/sounds/shoot.wav",
    volume: 0.04,
  }),
  damage: new Howl({
    src: "./assets/sounds/damage.wav",
    volume,
  }),
  powerup: new Howl({
    src: "./assets/sounds/powerup.wav",
    volume,
  }),
  explode: new Howl({
    src: "./assets/sounds/explode.wav",
    volume,
  }),
  death: new Howl({
    src: "./assets/sounds/death.wav",
    volume,
  }),
  select: new Howl({
    src: "./assets/sounds/select.wav",
    volume,
    html5: true, //fix safari not playing on mobile
  }),
  background: new Howl({
    src: "./assets/sounds/music.wav",
    volume,
    loop: true,
  }),
};
