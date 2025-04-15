import React, { useEffect, useState, useRef } from "react";
import Player from "./Player";
import Wall from "./Wall";
import Collectible from "./Collectible";
import Enemy from "./Enemy";
import wallTexture from "./assets/brick_tile_1.png";
import floorTexture from "./assets/tile_1.png";
import full_heart from "./assets/heart.png";
import empty_heart from "./assets/heart_empty_16x16.png";

const GRAVITY = 0.5;
const JUMP_FORCE = 15;
const FLOOR_Y = 350;
const CEILING_Y = 50;
const WORLD_WIDTH = 10000;
const VIEWPORT_WIDTH = 800;
const PLAYER_SPEED = 5;
const ENEMY_SPEED = 1.5;

export default function App() {
  const [player, setPlayer] = useState({ x: 0, y: FLOOR_Y - 50, vy: 0 });
  const [isJumping, setIsJumping] = useState(false);
  const [collectibles, setCollectibles] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [health, setHealth] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const keys = useRef({});
  const lastCollectibleX = useRef(200);
  const lastEnemyX = useRef(400);
  const animationFrameId = useRef();
  const lastTime = useRef(0);
  const gameWorldRef = useRef();

  // Initialize game elements
  useEffect(() => {
    generateCollectibles(20);
    generateEnemies(10);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, []);

  const generateCollectibles = (count) => {
    const newCollectibles = [];
    for (let i = 0; i < count; i++) {
      lastCollectibleX.current += Math.random() * 200 + 100;
      newCollectibles.push({
        id: i + lastCollectibleX.current,
        x: lastCollectibleX.current,
        y: Math.random() * (FLOOR_Y - CEILING_Y - 100) + CEILING_Y,
        collected: false,
      });
    }
    setCollectibles((prev) => [...prev, ...newCollectibles]);
  };

  const generateEnemies = (count) => {
    const newEnemies = [];
    for (let i = 0; i < count; i++) {
      lastEnemyX.current += Math.random() * 300 + 200;
      newEnemies.push({
        id: i + lastEnemyX.current,
        x: lastEnemyX.current,
        y: FLOOR_Y - 50,
        dir: Math.random() > 0.5 ? 1 : -1,
        patrolRange: Math.random() * 100 + 50,
        originalX: lastEnemyX.current,
      });
    }
    setEnemies((prev) => [...prev, ...newEnemies]);
  };

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      keys.current[e.key] = true;
      // Prevent spacebar from scrolling page
      if (e.key === " ") e.preventDefault();
    };
    const handleKeyUp = (e) => {
      keys.current[e.key] = false;
      if (e.key === " ") e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Game loop using requestAnimationFrame
  useEffect(() => {
    if (gameOver) return;

    const gameLoop = (timestamp) => {
      if (!lastTime.current) lastTime.current = timestamp;
      const deltaTime = timestamp - lastTime.current;
      lastTime.current = timestamp;

      // Player movement
      setPlayer((prev) => {
        let { x, y, vy } = prev;

        // Horizontal movement
        if (keys.current["ArrowRight"]) x += PLAYER_SPEED;
        if (keys.current["ArrowLeft"]) x -= PLAYER_SPEED;

        // Boundary check
        x = Math.max(25, Math.min(WORLD_WIDTH - 75, x));

        // Jumping
        if ((keys.current[" "] || keys.current["ArrowUp"]) && !isJumping) {
          vy = -JUMP_FORCE;
          setIsJumping(true);
        }

        // Apply gravity
        vy += GRAVITY;
        y += vy;

        // Floor and ceiling collision
        if (y >= FLOOR_Y - 50) {
          y = FLOOR_Y - 50;
          vy = 0;
          setIsJumping(false);
        } else if (y <= CEILING_Y) {
          y = CEILING_Y;
          vy = 0;
        }

        return { x, y, vy };
      });

      // Enemy movement
      setEnemies((prev) =>
        prev.map((enemy) => {
          let nextX = enemy.x + enemy.dir * ENEMY_SPEED;
          if (Math.abs(nextX - enemy.originalX) > enemy.patrolRange) {
            return { ...enemy, dir: -enemy.dir };
          }
          return { ...enemy, x: nextX };
        })
      );

      // Generate more content as player progresses
      if (player.x > lastCollectibleX.current - 1000) {
        generateCollectibles(5);
      }
      if (player.x > lastEnemyX.current - 1000) {
        generateEnemies(3);
      }

      animationFrameId.current = requestAnimationFrame(gameLoop);
    };

    animationFrameId.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId.current);
  }, [gameOver, isJumping]);

  // Coin collection
  useEffect(() => {
    setCollectibles((prev) =>
      prev.map((collectible) => {
        if (
          !collectible.collected &&
          Math.abs(player.x - collectible.x) < 30 &&
          Math.abs(player.y - collectible.y) < 30
        ) {
          setScore((s) => s + 10);
          return { ...collectible, collected: true };
        }
        return collectible;
      })
    );
  }, [player]);

  // Enemy collision
  useEffect(() => {
    const hit = enemies.some(
      (enemy) =>
        Math.abs(player.x - enemy.x) < 40 && Math.abs(player.y - enemy.y) < 40
    );

    if (hit) {
      setHealth((prev) => {
        if (prev > 1) return prev - 1;
        setGameOver(true);
        return 0;
      });
      // Knockback effect
      setPlayer((p) => ({
        ...p,
        x: p.x - 60,
        vy: -JUMP_FORCE / 2,
      }));
    }
  }, [player, enemies]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#000000]">
      {/* Parallax Background */}
      <div className="absolute inset-0 z-0 bg-blue-900 opacity-50" />
      <div
        className="absolute top-0 left-0 w-full h-full z-0 opacity-30"
        style={{
          backgroundImage: `url(${wallTexture})`,
          backgroundRepeat: "repeat",
          backgroundPosition: `${-player.x * 0.2}px 0`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* UI Elements */}
      <div className="absolute top-4 left-4 z-10 flex gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <img
            key={i}
            src={i < health ? full_heart : empty_heart}
            alt="heart"
            className="w-8 h-8"
          />
        ))}
      </div>
      <div className="absolute top-4 right-4 z-10 text-white text-2xl font-bold">
        Score: {score}
      </div>

      {/* Game World */}
      <div
        ref={gameWorldRef}
        className="absolute z-10"
        style={{
          transform: `translateX(${-player.x + VIEWPORT_WIDTH / 2 - 50}px)`,
          width: `${WORLD_WIDTH}px`,
          height: "100%",
          willChange: "transform", // Optimize for animation
        }}
      >
        {/* Floor Wall */}
        <Wall
          x={0}
          y={FLOOR_Y}
          width={WORLD_WIDTH}
          height={50}
          texture={floorTexture}
        />

        <Player x={player.x} y={player.y} />
        <div className="text-white text-2xl font-semibold bottom-8 left-20 absolute z-10">
          <p>⨂Collect coins and dodge fireballs</p>
          <p>⨂You are given three lives</p>
          <p>⨂Each coin is worth 10 points</p>
        </div>

        {collectibles.map(
          (c) => !c.collected && <Collectible key={c.id} x={c.x} y={c.y} />
        )}

        {enemies.map((enemy) => (
          <Enemy key={enemy.id} x={enemy.x} y={enemy.y} dir={enemy.dir} />
        ))}
      </div>

      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white text-4xl z-50 font-bold">
          GAME OVER
          <div className="text-2xl mt-4">Final Score: {score}</div>
          <button
            className="mt-8 px-6 py-2 bg-white text-black rounded-lg text-xl hover:bg-gray-200 transition"
            onClick={() => window.location.reload()}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
