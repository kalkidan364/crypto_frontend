const DataTable = ({ columns, data, onSort, sortable = false }) => {
  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th 
              key={column.key}
              className={sortable ? 'sort' : ''}
              onClick={sortable && onSort ? () => onSort(column.key) : undefined}
            >
              {column.label}
              {sortable && ' ↕'}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {columns.map((column) => (
              <td key={column.key}>
                {row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;