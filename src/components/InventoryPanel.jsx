export default function InventoryPanel({ items }) {
  return (
    <aside className="inventory-panel">
      <h2>Inventory</h2>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <strong>{item.name}</strong> x{item.quantity}
            <span>{item.description}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
