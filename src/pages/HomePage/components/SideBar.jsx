export function SideBar({
  priceFilter,
  setPriceFilter,
  ticketType,
  setTicketType,
  priceOptions,
  typeOptions,
}) {
  return (
    <aside className="home-sidebar" aria-label="Bộ lọc sự kiện">
      <div className="home-sidebar__section">
        <h3 className="home-sidebar__title">Lọc theo giá vé</h3>
        <div className="home-sidebar__options">
          {priceOptions.map((option) => (
            <label key={option.value} className="home-sidebar__option">
              <input
                type="radio"
                name="price-filter"
                value={option.value}
                checked={priceFilter === option.value}
                onChange={(e) => setPriceFilter(e.target.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="home-sidebar__section">
        <h3 className="home-sidebar__title">Lọc theo loại vé</h3>
        <div className="home-sidebar__options">
          {typeOptions.map((option) => (
            <label key={option.value} className="home-sidebar__option">
              <input
                type="radio"
                name="type-filter"
                value={option.value}
                checked={ticketType === option.value}
                onChange={(e) => setTicketType(e.target.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
