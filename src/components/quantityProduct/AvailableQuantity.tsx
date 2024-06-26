import { ProductProjection } from '@commercetools/platform-sdk';
import React from 'react';
import './availableQuantity.css';

function AvailableQuantity(props: {
  product: ProductProjection;
}): React.JSX.Element {
  const availability = props.product.masterVariant.availability;
  let availableQuantity = availability ? availability.availableQuantity : 0;

  return (
    <>
      {availableQuantity ? (
        <span className="number-pcs">
          {availableQuantity} pcs
        </span>
      ) : (
        <span className="number-pcs not-available">{'Not available'}</span>
      )}
    </>
  );
}

export default AvailableQuantity;
