// Customer details view - created by dev1
import React, { useEffect, useState } from 'react';
import { getCustomerData } from '../../utils/helpers/oldUtils';
import { formatDate } from '../../utils/helpers/oldUtils'; // Duplicate import
import { Link } from 'react-router-dom';

const CustomerDetailsPage = (props) => {
  const [customer, setCustomer] = useState({});
  
  useEffect(() => {
    // Fetch customer data
    const data = getCustomerData();
    setCustomer(data);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Customer Details</h1>
      <div className="details-container">
        <div>ID: {customer.id}</div>
        <div>Name: {customer.name}</div>
        <div>Email: {customer.email}</div>
        <div>Member Since: {formatDate(new Date())}</div>
      </div>
      <Link to="/">Back to List</Link>
    </div>
  );
};

export default CustomerDetailsPage;
