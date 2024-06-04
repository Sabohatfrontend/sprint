import priceFunction from './priceFunction';
import { ProductData } from '@commercetools/platform-sdk';

export const getPrice = (productData: ProductData) => {
  const { masterVariant } = productData;
  const priceObject = masterVariant?.prices?.[0];
  const centAmount = priceObject?.value?.centAmount;
  const currencyCode = priceObject?.value?.currencyCode;

  const discounted = priceObject?.discounted?.value?.centAmount;

  const price = priceFunction(centAmount, currencyCode);

  const discountPrice = priceFunction(discounted, currencyCode);
  return { price, discountPrice };
};