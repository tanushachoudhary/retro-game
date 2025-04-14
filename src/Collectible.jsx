import coin from "./assets/goldCoin1.png";
export default function Collectible({ x, y }) {
  return (
    <img
      src={coin} // Coin sprite
      alt="coin"
      className="absolute w-10 h-10 animate-bounce"
      style={{ left: x, top: y }}
    />
  );
}
