import { ProductProjection } from '@commercetools/platform-sdk';
import React, { useContext, useState } from 'react';
import './basket.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus, faCartShopping, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { addProductToCart, deleteProductInCart, isExistProductMyCart } from '../../../sdk/basketApi';
import { UserContext } from '../../../src/context/userContext';

function BasketButton(props: {
    product: ProductProjection;
}): React.JSX.Element {
    const { apiRoot, cart, setCart } = useContext(UserContext);
    const [number, setNumber] = useState(1);
    const { product } = props;
    const [isDisabled, setDisabled] = useState(cart ? isExistProductMyCart(product.id, cart) : true);

    const handleBasket = async (product: ProductProjection) => {
        const response = await addProductToCart(product, number, cart!, apiRoot!);
        if (response?.statusCode === 200) {
            setDisabled(true);
            setCart(response.body);
        }
    };

    const deleteProduct = (product: ProductProjection) => {
        if (cart && apiRoot) {
            void (async () => {
                const response = await deleteProductInCart(product, cart, apiRoot);
                if (response?.statusCode === 200) {
                    setDisabled(false);
                }
            })();
        }
    }

    return (
        <>
            <div className="basket">
                {product.masterVariant.availability?.availableQuantity &&
                    !isDisabled ? (
                    <div className="basket-wrap">
                        <div className="num-wrap">
                            <button
                                className="num-btn"
                                title={`Remove one pcs ${product.name['en-US']}`}
                                onClick={() =>
                                    setNumber((prev) => {
                                        if (prev > 1) return prev - 1;
                                        return prev;
                                    })
                                }
                            >
                                {<FontAwesomeIcon className="num-image" icon={faMinus} />}
                            </button>
                            <p className="num">{number}</p>
                            <button
                                className="num-btn"
                                title={`Add one pcs ${product.name['en-US']}`}
                                onClick={() =>
                                    setNumber((prev) => {
                                        if (product.masterVariant?.availability?.availableQuantity && (
                                            prev <
                                            product.masterVariant?.availability?.availableQuantity)
                                        )
                                            return prev + 1;
                                        return prev;
                                    })
                                }
                            >
                                {<FontAwesomeIcon className="num-image" icon={faPlus} />}
                            </button>
                        </div>
                        <button
                            className="basket-btn"
                            title={`Add ${number} pcs ${product.name['en-US']} to basket`}
                            onClick={() => void handleBasket(product)}
                        >
                            <FontAwesomeIcon
                                className="basket-image"
                                icon={faCartPlus}
                            />
                        </button>
                    </div>
                ) : (!product.masterVariant.availability?.availableQuantity ?
                    <button
                        className="basket-btn disabled"
                        title={`Cannot add ${product.name['en-US']} to basket`}
                    >
                        <FontAwesomeIcon className="basket-image" icon={faCartShopping} />
                    </button> :
                    <button
                        className="basket-btn disabled"
                        title={`Remove ${product.name['en-US']} from basket`}
                        onClick={() => deleteProduct(product)}
                    >
                        <FontAwesomeIcon className="basket-image" icon={faCartShopping} />
                    </button>
                )}
            </div>
        </>
    );
}

export default BasketButton;
