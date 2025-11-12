"use strict";
const music = document.getElementById("bg-music");
const btn = document.getElementById("music-btn");
let isPlaying = true;

btn.addEventListener("click", () => {
  if (isPlaying) {
    music.pause();
    btn.textContent = "🔇";
  } else {
    music.play();
    btn.textContent = "🎵";
  }
  isPlaying = !isPlaying;
});
