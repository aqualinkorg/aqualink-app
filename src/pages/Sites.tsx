import React, { useEffect, useState } from 'react';
import { useDateContext } from '../context/DateContext';
import { fetchSitesData } from '../api/sites';

const Sites: React.FC = () => {
  const { selectedDate } = useDateContext();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Passamos a data selecionada para a API para filtrar os dados históricos
        const data = await fetchSitesData(selectedDate);
        setSites(data);
      } catch (error) {
        console.error("Error fetching sites:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDate]);

  if (loading) return <div>Loading sites for {selectedDate.toDateString()}...</div>;

  return (
    <div className="sites-page">
      <h1>Aqualink Sites</h1>
      <p>Showing data for: {selectedDate.toDateString()}</p>
      <div className="sites-grid">
        {sites.map(site => (
          <div key={site.id} className="site-card">
            {site.name} - {site.status}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sites;
