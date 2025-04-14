import img from "./assets/spellun-sprite.png";
export default function Player({ x, y }) {
  return (
    <img
      src={img} // Placeholder sprite URL
      alt="player"
      className="absolute w-20 h-20"
      style={{ left: x, top: y }}
    />
  );
}
