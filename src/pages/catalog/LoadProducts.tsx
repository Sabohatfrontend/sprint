import React, { useState, useEffect, useCallback } from 'react';
import ProductsList from './ProductsList';
import { Product } from '@commercetools/platform-sdk';
import { clientMaker } from '../../../sdk/createClient';

function LoadProducts(): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const [response, setResponse] = useState<Product[]>([]);

  const fetchData = useCallback(async () => {
    const apiRoot = clientMaker();
    const getProducts = async (page: number) => {
      try {
        console.log(page);
        const response = await apiRoot.products().get().execute();
        return response;
      } catch (error) {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        throw new Error(`Failed to get products: ${errorMessage}`);
      }
    };

    try {
      const res = await getProducts(page);
      if (res.statusCode === 200) {
        setResponse((response) => [...response, ...res.body.results]);
        setTotal(() => res.body.total || 0);
      }
    } catch (error: unknown) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;
      setErrorMessage(message);
      console.log(message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleTryAgainButton = () => {
    setErrorMessage(null);
  };

  const loadMore = () => {
    setPage((page) => page + 1);
  };

  return (
    <>
      {loading && <div className="loading-text">Loading...</div>}
      {errorMessage && (
        <div>
          <button onClick={handleTryAgainButton}>Try again</button>
        </div>
      )}
      <ProductsList products={response} />
      {total && total > response.length ? (
        <button onClick={loadMore}> More...</button>
      ) : (
        <></>
      )}
    </>
  );
}

export default LoadProducts;