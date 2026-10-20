import { terrain, relay } from "@lucasmarkes/hairline";

const options = { theme: "dark", intensity: 0.25, play: false };
terrain(document.getElementById("terrain"), options);
relay(document.getElementById("relay"), options);
