import React from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

function Homepage() {
  return (
    <div>
      <h1>Homepage</h1>

      <DataTable value={products} tableStyle={{ minWidth: '50rem' }}>
        <Column field="code" header="Code" sortable style={{ width: '25%' }}></Column>
        <Column field="name" header="Name" sortable style={{ width: '25%' }}></Column>
        <Column field="category" header="Category" sortable style={{ width: '25%' }}></Column>
        <Column field="quantity" header="Quantity" sortable style={{ width: '25%' }}></Column>
      </DataTable>
    </div>
  );
}
const products = [
  { code: '101', name: 'Bamboo Watch', category: 'Accessories', quantity: 24 },
  { code: '102', name: 'Black Watch', category: 'Accessories', quantity: 61 },
  { code: '103', name: 'Blue Band', category: 'Accessories', quantity: 2 },
  { code: '104', name: 'Blue T-Shirt', category: 'Clothing', quantity: 186 },
  { code: '105', name: 'Bracket', category: 'Accessories', quantity: 15 },
  { code: '106', name: 'Brown Purse', category: 'Accessories', quantity: 8 },
  { code: '107', name: 'Chakra Band', category: 'Accessories', quantity: 34 },
  { code: '108', name: 'Galaxy Band', category: 'Accessories', quantity: 84 },
  { code: '109', name: 'Game Controller', category: 'Electronics', quantity: 267 },
  { code: '110', name: 'Gloves', category: 'Clothing', quantity: 98 },
  { code: '111', name: 'Green T-Shirt', category: 'Clothing', quantity: 10 },
  { code: '112', name: 'Grey T-Shirt', category: 'Clothing', quantity: 50 },
  { code: '113', name: 'Grey Watch', category: 'Accessories', quantity: 72 },
  { code: '114', name: 'Headphone', category: 'Electronics', quantity: 8 },
  { code: '115', name: 'Light Green T-Shirt', category: 'Clothing', quantity: 48 },
  { code: '116', name: 'Lime Band', category: 'Accessories', quantity: 15 },
  { code: '117', name: 'Lime T-Shirt', category: 'Clothing', quantity: 10 },
  { code: '118', name: 'Mouse Pad', category: 'Accessories', quantity: 25 },
  { code: '119', name: 'Navy Blue Watch', category: 'Accessories', quantity: 73 },
  { code: '120', name: 'Orange Band', category: 'Accessories', quantity: 13 },
  { code: '121', name: 'Orange Watch', category: 'Accessories', quantity: 81 },
  { code: '122', name: 'Phone Case', category: 'Accessories', quantity: 88 },
  { code: '123', name: 'Purple Band', category: 'Accessories', quantity: 32 },
  { code: '124', name: 'Purple T-Shirt', category: 'Clothing', quantity: 2 },
  { code: '125', name: 'Purple Watch', category: 'Accessories', quantity: 29 },
  { code: '126', name: 'Red Band', category: 'Accessories', quantity: 15 },
  { code: '127', name: 'Red Purse', category: 'Accessories', quantity: 42 },
  { code: '128', name: 'Red T-Shirt', category: 'Clothing', quantity: 41 },
  { code: '129', name: 'Red Watch', category: 'Accessories', quantity: 83 },
  { code: '130', name: 'Running Shoe', category: 'Clothing', quantity: 20 },
  { code: '131', name: 'Sneakers', category: 'Clothing', quantity: 60 },
  { code: '132', name: 'Teal Band', category: 'Accessories', quantity: 30 },
  { code: '133', name: 'Teal T-Shirt', category: 'Clothing', quantity: 25 },
  { code: '134', name: 'Teal Watch', category: 'Accessories', quantity: 34 },
  { code: '135', name: 'White Watch', category: 'Accessories', quantity: 33 },
  { code: '136', name: 'Yellow Band', category: 'Accessories', quantity: 35 },
  { code: '137', name: 'Yellow Purse', category: 'Accessories', quantity: 27 },
  { code: '138', name: 'Yellow T-Shirt', category: 'Clothing', quantity: 46 },
  { code: '139', name: 'Yellow Watch', category: 'Accessories', quantity: 89 },
  { code: '140', name: 'Yo-Yo', category: 'Electronics', quantity: 11 },
];

export default Homepage;  