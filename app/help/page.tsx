import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 bg-clip-text text-transparent">
        How to Play
      </h1>

      <div className="space-y-6 text-text-secondary text-sm w-full">
        <section>
          <h2 className="text-lg font-bold text-text-primary mb-2">Movement</h2>
          <p>
            Use <span className="font-mono text-text-primary">WASD</span> or{" "}
            <span className="font-mono text-text-primary">Arrow keys</span> to move on the 7x7 grid.
            You can also click/tap adjacent tiles. Each move costs one turn. Enemies move after you.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-text-primary mb-2">Color Orbs</h2>
          <p>
            You carry up to 5 color orbs. Pick them up by walking over them on the map.
            Orbs are your only weapons -- you spend them to attack.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-text-primary mb-2">Combat</h2>
          <p>Walk into an enemy to start combat. Select 1 or 2 orbs and press Attack.</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><span className="text-red-500 font-bold">Red</span> + <span className="text-blue-500 font-bold">Blue</span> = <span className="text-purple-500 font-bold">Purple</span> -- Poison (damage over 3 turns)</li>
            <li><span className="text-red-500 font-bold">Red</span> + <span className="text-yellow-400 font-bold">Yellow</span> = <span className="text-orange-500 font-bold">Orange</span> -- Fire (AoE damage to adjacent enemies)</li>
            <li><span className="text-blue-500 font-bold">Blue</span> + <span className="text-yellow-400 font-bold">Yellow</span> = <span className="text-green-500 font-bold">Green</span> -- Heal (restore HP)</li>
            <li>Two of the same color = 1.5x single-orb damage</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-text-primary mb-2">Weaknesses</h2>
          <ul className="list-disc list-inside space-y-1">
            <li><span className="text-red-500">Red Slime</span> -- weak to Blue, resists Red</li>
            <li><span className="text-blue-500">Blue Wraith</span> -- weak to Yellow, resists Blue</li>
            <li><span className="text-yellow-400">Yellow Golem</span> -- weak to Red, resists Yellow</li>
            <li><span className="text-purple-500">Purple Demon (Boss)</span> -- weak to Green, resists Purple</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-text-primary mb-2">Objective</h2>
          <p>
            Defeat all enemies on each floor to unlock the stairs. Descend 5 floors.
            Floor 5 has the boss. Beat the boss to win!
          </p>
        </section>
      </div>

      <Link
        href="/"
        className="mt-8 px-6 py-2 rounded bg-accent-primary text-text-inverse font-bold hover:brightness-110 transition"
      >
        Back to Game
      </Link>
    </div>
  );
}
