import { flowers } from "../data/flowers.js";

function FlowerSelector({ selectedFlower, onSelect }) {
  return (
    <nav className="flower-selector" aria-label="Flower selector">
      {flowers.map((flower) => (
        <button
          key={flower.id}
          type="button"
          className={selectedFlower === flower.id ? "selector-button active" : "selector-button"}
          onClick={() => onSelect(flower.id)}
          aria-pressed={selectedFlower === flower.id}
          style={{ "--accent": flower.accent }}
        >
          {flower.selectorLabel}
        </button>
      ))}
    </nav>
  );
}

export default FlowerSelector;
