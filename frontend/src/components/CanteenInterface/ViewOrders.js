import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ViewOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5002/api/canteen/view-orders');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div>
      {loading ? <p>Loading orders...</p> : null}
      <table>
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>Ward Number</th>
            <th>Food Items</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={index}>
              <td>{order.patientName}</td>
              <td>{order.wardNumber}</td>
              <td>{order.foodItems.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ViewOrders;
