import React from 'react';
import './CanteenInterface.css'; // Optional, for styling
import ViewOrders from './ViewOrders';  // If you want to include ViewOrders as well
import UpdateMenu from './UpdateMenu';  // Import UpdateMenu

function CanteenInterface() {
  return (
    <div className="CanteenInterface">
      <h2>Canteen Interface</h2>

      <div>
        <h3>Update Menu</h3>
        <UpdateMenu />  {/* Render the UpdateMenu component */}
      </div>

      <div>
        <h3>View Orders</h3>
        <ViewOrders />  {/* Render ViewOrders component */}
      </div>
    </div>
  );
}

export default CanteenInterface;
