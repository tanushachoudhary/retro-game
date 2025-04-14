import React from "react";

export default function Wall({ x, y, width, height, texture }) {
  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
        width: width,
        height: height,
        backgroundImage: `url(${texture})`,
        backgroundRepeat: "repeat",
      }}
    />
  );
}
