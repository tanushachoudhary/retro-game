import tile from "./assets/tile_n.png";
export default function Platform({ x, y, width }) {
  const tileCount = Math.floor(width / 32);
  return (
    <div className="absolute flex" style={{ left: x, top: y }}>
      {Array.from({ length: tileCount }).map((_, i) => (
        <img
          key={i}
          src={tile} // Tile sprite
          alt="tile"
          className="w-8 h-8"
        />
      ))}
    </div>
  );
}
