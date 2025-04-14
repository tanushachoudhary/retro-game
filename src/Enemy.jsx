import React from "react";
import fire from "./assets/fire.gif";
export default function Enemy({ x, y }) {
  return (
    <img
      src={fire} // Replace with enemy sprite
      alt="enemy"
      className="absolute w-10 h-10"
      style={{ left: x, top: y }}
    />
  );
}
