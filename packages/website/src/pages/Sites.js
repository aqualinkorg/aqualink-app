import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { fetchSites } from '../api/sites';

const Sites = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data: sites, isLoading, isError } = useQuery('sites', () => fetchSites(selectedDate));

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching sites</div>;

  return (
    <div>
      <h1>Sites</h1>
      <div>
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />
      </div>
      <ul>
        {sites.map((site) => (
          <li key={site.id}>
            {site.name} - {site.location}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sites;
