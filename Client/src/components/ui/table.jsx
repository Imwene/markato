// src/components/ui/table.jsx
import React from 'react';

const Table = ({ children, className = '', ...props }) => (
  <table className={`w-full caption-bottom text-sm ${className}`} {...props}>
    {children}
  </table>
);

const TableHeader = ({ children, className = '', ...props }) => (
  <thead className={`border-b border-border-DEFAULT bg-background-dark 
  dark:border-stone-800 dark:bg-stone-900${className}`} {...props}>
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
    dark:border-stone-800
    transition-colors 
    hover:bg-background-dark/50
    dark:hover:bg-stone-800/50
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
    dark:text-stone-400
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
    dark:text-white
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