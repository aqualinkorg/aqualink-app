import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useEnvironmentalData = (date: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Adicionando o parâmetro de data na query string para a API
        const response = await api.get(`/environmental-data?date=${date}`);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]); // Re-executa sempre que a data mudar

  return { data, loading, error };
};
