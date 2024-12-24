// src/components/ui/table.jsx
import React from 'react';

const Table = ({ children, className = '', ...props }) => (
  <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
    {children}
  </table>
);

const TableHeader = ({ children, className = '', ...props }) => (
  <thead className={`border-b border-border-DEFAULT bg-background-dark ${className}`} {...props}>
    {children}
  </thead>
);

const TableBody = ({ children, className = '', ...props }) => (
  <tbody className={`${className}`} {...props}>
    {children}
  </tbody>
);

const TableRow = ({ children, className = '', ...props }) => (
  <tr 
    className={`
      border-b border-border-light 
      transition-colors 
      hover:bg-background-dark/50
      ${className}
    `} 
    {...props}
  >
    {children}
  </tr>
);

const TableHead = ({ children, className = '', ...props }) => (
  <th 
    className={`
      h-12 px-4 
      text-left align-middle 
      font-medium 
      text-content-light
      ${className}
    `} 
    {...props}
  >
    {children}
  </th>
);

const TableCell = ({ children, className = '', ...props }) => (
  <td 
    className={`
      p-4 
      align-middle 
      text-content-DEFAULT
      ${className}
    `} 
    {...props}
  >
    {children}
  </td>
);

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
};