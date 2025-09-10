// src/components/Card/Card.js

export const Card = ({ title, description, price, children }) => {
  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{description}</p>
      <p className="card-price">{price}</p>
      <div className="card-extra">{children}</div>
    </div>
  );
};
