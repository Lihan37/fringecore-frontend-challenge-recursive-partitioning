import { useCallback } from "react";

function updateNode(node, id, fn) {
  if (node.id === id) return fn(node);
  if (node.type === "split") {
    return {
      ...node,
      a: updateNode(node.a, id, fn),
      b: updateNode(node.b, id, fn),
    };
  }
  return node;
}

export default function Partition({ node, isRoot = false, onChange, makeColor }) {
  const split = useCallback((id, dir) => {
    onChange(prev =>
      updateNode(prev, id, leaf => ({
        id: crypto.randomUUID(),
        type: "split",
        dir,
        ratio: 0.5,
        a: { ...leaf },
        b: { id: crypto.randomUUID(), type: "leaf", color: makeColor() },
      }))
    );
  }, [onChange, makeColor]);

  const remove = useCallback(id => {
    function removeRec(current, targetId) {
      if (current.type !== "split") return current;
      if (current.a.id === targetId) return current.b;
      if (current.b.id === targetId) return current.a;
      return {
        ...current,
        a: removeRec(current.a, targetId),
        b: removeRec(current.b, targetId),
      };
    }
    onChange(prev => {
      if (prev.id === id) return prev;
      return removeRec(prev, id);
    });
  }, [onChange]);

  const resize = useCallback((id, ratio) => {
    onChange(prev => updateNode(prev, id, n => ({ ...n, ratio })));
  }, [onChange]);

  if (node.type === "leaf") {
    return (
      <div className="w-full h-full relative" style={{ background: node.color }}>
        <div className="absolute top-2 right-2 flex gap-1 text-xs">
          <button
            onClick={() => split(node.id, "v")}
            className="px-2 py-1 rounded bg-black/60 text-white hover:bg-black/80"
          >v</button>
          <button
            onClick={() => split(node.id, "h")}
            className="px-2 py-1 rounded bg-black/60 text-white hover:bg-black/80"
          >h</button>
          <button
            onClick={() => remove(node.id)}
            className="px-2 py-1 rounded bg-black/60 text-white hover:bg-black/80"
          >-</button>
        </div>
      </div>
    );
  }

  const vertical = node.dir === "v";
  const aStyle = vertical
    ? { width: `${node.ratio * 100}%` }
    : { height: `${node.ratio * 100}%` };

  const onDragStart = e => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    const startRatio = node.ratio;

    const onMove = ev => {
      if (vertical) {
        const dx = ev.clientX - startX;
        const newRatio = Math.min(0.9, Math.max(0.1, startRatio + dx / rect.width));
        resize(node.id, snap(newRatio));
      } else {
        const dy = ev.clientY - startY;
        const newRatio = Math.min(0.9, Math.max(0.1, startRatio + dy / rect.height));
        resize(node.id, snap(newRatio));
      }
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div className={`flex ${vertical ? "flex-row" : "flex-col"} w-full h-full select-none`}>
      <div style={aStyle} className="relative">
        <Partition node={node.a} onChange={onChange} makeColor={makeColor} />
      </div>

      <div
        onMouseDown={onDragStart}
        className={`${vertical ? "w-1 hover:w-2 cursor-col-resize" : "h-1 hover:h-2 cursor-row-resize"} transition-all bg-black/50 hover:bg-black`}
      />

      <div className="relative flex-1">
        <Partition node={node.b} onChange={onChange} makeColor={makeColor} />
      </div>

      {!isRoot && (
        <button
          onClick={() => remove(node.id)}
          className="absolute top-2 right-2 z-10 px-2 py-1 rounded bg-black/60 text-white hover:bg-black/80 text-xs"
        >-</button>
      )}
    </div>
  );
}

function snap(x) {
  const points = [0.25, 0.5, 0.75];
  const eps = 0.02;
  for (const p of points) if (Math.abs(x - p) < eps) return p;
  return x;
}
