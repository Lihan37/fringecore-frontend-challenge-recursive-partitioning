import { useState } from "react";
import Partition from "./Partition";

const randomColor = () =>
  `hsl(${Math.floor(Math.random() * 360)}, 70%, 55%)`;

export default function App() {
  const [tree, setTree] = useState({
    id: crypto.randomUUID(),
    type: "leaf",
    color: randomColor(),
  });

  return (
    <div className="h-screen w-screen bg-neutral-900 p-4">
      <div className="h-full w-full rounded-3xl overflow-hidden ring-1 ring-white/10">
        <Partition
          node={tree}
          isRoot
          onChange={setTree}
          makeColor={randomColor}
        />
      </div>
    </div>
  );
}
