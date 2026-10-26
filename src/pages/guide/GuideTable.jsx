/**
 * A simple bordered table used throughout the guide.
 * @param {{ columns: string[], rows: Array<Array<React.ReactNode>>, empty?: string, fixed?: boolean }} props
 *   `fixed` limits the height and scrolls, for long tables such as the subject list.
 */
export default function GuideTable({ columns, rows, empty = 'Nothing to show.', fixed = false }) {
  return (
    <div className={`overflow-x-auto rounded-md border border-gray-200 ${fixed ? 'max-h-96 overflow-y-auto' : ''}`}>
      <table className="w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-3 py-2 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="align-top">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2 text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-center text-gray-500">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
