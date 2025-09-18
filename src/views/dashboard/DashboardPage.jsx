// Bad: Over-fetching, memoization issues, and improper effect usage
import { useState, useEffect, useMemo } from 'react';
import { fetchCustomers } from '../../services/Api';
import { formatCurrency } from '../../utils/formatting';

const DashboardPage = ({ userId }) => {
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        
        const [customers, activity] = await Promise.all([
          fetchCustomers(),
          fetch(`/api/users/${userId}/activity`).then(res => res.json())
        ]);
        
        if (isMounted) {
         
          const totalRevenue = customers.reduce(
            (sum, customer) => sum + (customer.purchases?.reduce(
              (s, p) => s + p.amount, 0
            ) || 0), 0
          );
          
          setStats({
            totalCustomers: customers.length,
            totalRevenue,
            // ... other stats
          });
          
          setRecentActivity(activity);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    loadData();
    
    // Missing cleanup for isMounted
    return () => {
      isMounted = false;
    };
  }, [userId]);
  
  // Inefficient calculation - runs on every render
  const formattedRevenue = useMemo(() => {
    console.log('Formatting revenue...');
    return formatCurrency(stats.totalRevenue || 0);
  }, [stats.totalRevenue]);
  
  // Unnecessary use of useMemo for simple calculations
  const customerCountText = useMemo(() => 
    `Total Customers: ${stats.totalCustomers || 0}`
  , [stats.totalCustomers]);
  
  // Inline style objects recreated on every render
  const cardStyle = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '16px'
  };
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={cardStyle}>
          <h3>Customers</h3>
          <p style={{ fontSize: '24px', margin: '8px 0' }}>
            {customerCountText}
          </p>
        </div>
        
        <div style={cardStyle}>
          <h3>Revenue</h3>
          <p style={{ fontSize: '24px', margin: '8px 0' }}>
            {formattedRevenue}
          </p>
        </div>
      </div>
      
      <div style={{ ...cardStyle, marginTop: '20px' }}>
        <h2>Recent Activity</h2>
        <ActivityList activities={recentActivity} />
      </div>
    </div>
  );
};

// Nested component with prop drilling and no memoization
const ActivityList = ({ activities }) => (
  <ul style={{ listStyle: 'none', padding: 0 }}>
    {activities.map((activity, index) => (
      <ActivityItem 
        key={index} 
        activity={activity} 
        onAction={() =>{}} 
      />
    ))}
  </ul>
);

const ActivityItem = ({ activity, onAction }) => {
 
  const handleClick = () => {
    onAction(activity.id);
  };
  
  return (
    <li 
      style={{ 
        padding: '12px', 
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
      onClick={handleClick} 
    >
      <span>{activity.description}</span>
      <span style={{ color: '#666' }}>
        {new Date(activity.timestamp).toLocaleString()}
      </span>
    </li>
  );
};

export default DashboardPage;
