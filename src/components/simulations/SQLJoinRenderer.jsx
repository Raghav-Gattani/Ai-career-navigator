import React, { useState, useMemo } from 'react'

const DEFAULT_USERS = [
  { id: 1, name: 'Alice Chen', dept_id: 10, role: 'Eng Lead' },
  { id: 2, name: 'Bob Smith', dept_id: 20, role: 'Product PM' },
  { id: 3, name: 'Charlie Dave', dept_id: 10, role: 'Frontend Dev' },
  { id: 4, name: 'Diana Prince', dept_id: null, role: 'Advisor (No Dept)' },
  { id: 5, name: 'Evan Wright', dept_id: 40, role: 'Intern' }
]

const DEFAULT_DEPTS = [
  { id: 10, dept_name: 'Engineering', floor: '4th Floor' },
  { id: 20, dept_name: 'Product', floor: '3rd Floor' },
  { id: 30, dept_name: 'Marketing (Empty)', floor: '2nd Floor' }
]

export default function SQLJoinRenderer({ spec, onActionLog }) {
  const [joinType, setJoinType] = useState('INNER JOIN')
  const [hoveredUserId, setHoveredUserId] = useState(null)
  const [hoveredDeptId, setHoveredDeptId] = useState(null)

  const users = DEFAULT_USERS
  const depts = DEFAULT_DEPTS

  // Compute Joined Results based on joinType
  const joinedRows = useMemo(() => {
    const results = []

    if (joinType === 'INNER JOIN') {
      for (const u of users) {
        const d = depts.find(dept => dept.id === u.dept_id)
        if (d) {
          results.push({
            user_id: u.id,
            user_name: u.name,
            dept_id: u.dept_id,
            dept_name: d.dept_name,
            floor: d.floor,
            matched: true
          })
        }
      }
    } else if (joinType === 'LEFT JOIN') {
      for (const u of users) {
        const d = depts.find(dept => dept.id === u.dept_id)
        results.push({
          user_id: u.id,
          user_name: u.name,
          dept_id: u.dept_id,
          dept_name: d ? d.dept_name : 'NULL',
          floor: d ? d.floor : 'NULL',
          matched: !!d
        })
      }
    } else if (joinType === 'RIGHT JOIN') {
      for (const d of depts) {
        const matchingUsers = users.filter(u => u.dept_id === d.id)
        if (matchingUsers.length > 0) {
          for (const u of matchingUsers) {
            results.push({
              user_id: u.id,
              user_name: u.name,
              dept_id: d.id,
              dept_name: d.dept_name,
              floor: d.floor,
              matched: true
            })
          }
        } else {
          results.push({
            user_id: 'NULL',
            user_name: 'NULL',
            dept_id: d.id,
            dept_name: d.dept_name,
            floor: d.floor,
            matched: false
          })
        }
      }
    } else if (joinType === 'FULL OUTER JOIN') {
      // All users with matching or NULL depts
      const matchedDeptIds = new Set()
      for (const u of users) {
        const d = depts.find(dept => dept.id === u.dept_id)
        if (d) matchedDeptIds.add(d.id)
        results.push({
          user_id: u.id,
          user_name: u.name,
          dept_id: u.dept_id ?? 'NULL',
          dept_name: d ? d.dept_name : 'NULL',
          floor: d ? d.floor : 'NULL',
          matched: !!d
        })
      }
      // Unmatched depts
      for (const d of depts) {
        if (!matchedDeptIds.has(d.id)) {
          results.push({
            user_id: 'NULL',
            user_name: 'NULL',
            dept_id: d.id,
            dept_name: d.dept_name,
            floor: d.floor,
            matched: false
          })
        }
      }
    }

    return results
  }, [joinType, users, depts])

  const handleJoinChange = (type) => {
    setJoinType(type)
    if (onActionLog) {
      onActionLog({ action: 'sql_join_change', joinType: type, rowsCount: joinedRows.length })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Join Type Selector & SQL Query Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface-variant/40 rounded-2xl border border-outline-variant/30">
        <div className="flex flex-wrap items-center gap-2">
          {['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'].map((type) => (
            <button
              key={type}
              onClick={() => handleJoinChange(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all ${
                joinType === type
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface text-on-surface-variant border border-outline-variant/40 hover:bg-surface-variant'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="text-xs text-on-surface-variant font-mono">
          Result rows: <strong className="text-on-surface font-bold">{joinedRows.length}</strong>
        </div>
      </div>

      {/* SQL Code Preview */}
      <div className="p-3 bg-[#1e293b] text-slate-200 rounded-xl font-mono text-xs overflow-x-auto shadow-inner flex items-center justify-between">
        <code>
          <span className="text-sky-400 font-bold">SELECT</span> u.id, u.name, d.dept_name, d.floor<br />
          <span className="text-sky-400 font-bold">FROM</span> users u<br />
          <span className="text-amber-400 font-bold">{joinType}</span> departments d<br />
          <span className="text-sky-400 font-bold">&nbsp;&nbsp;ON</span> u.dept_id = d.id;
        </code>
        <div className="hidden sm:block text-[11px] text-slate-400 text-right">
          Condition: <span className="text-emerald-300 font-mono">u.dept_id == d.id</span>
        </div>
      </div>

      {/* Side-by-Side Source Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Table: Users */}
        <div className="p-4 bg-surface rounded-2xl border border-outline-variant/40 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              Left Table: <code className="font-mono text-primary">users (u)</code>
            </span>
            <span className="text-[11px] font-mono text-on-surface-variant">5 records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-outline-variant/40 text-on-surface-variant font-mono">
                  <th className="py-1.5 px-2">id</th>
                  <th className="py-1.5 px-2">name</th>
                  <th className="py-1.5 px-2 bg-primary/5 text-primary font-bold">dept_id (FK)</th>
                  <th className="py-1.5 px-2">role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isMatching = depts.some(d => d.id === u.dept_id)
                  const isHighlighted = hoveredUserId === u.id || (hoveredDeptId && u.dept_id === hoveredDeptId)
                  return (
                    <tr
                      key={u.id}
                      onMouseEnter={() => {
                        setHoveredUserId(u.id)
                        setHoveredDeptId(u.dept_id)
                      }}
                      onMouseLeave={() => {
                        setHoveredUserId(null)
                        setHoveredDeptId(null)
                      }}
                      className={`border-b border-outline-variant/20 transition-colors font-mono cursor-pointer ${
                        isHighlighted ? 'bg-primary/10' : 'hover:bg-surface-variant/30'
                      }`}
                    >
                      <td className="py-1.5 px-2">{u.id}</td>
                      <td className="py-1.5 px-2 font-sans font-medium text-on-surface">{u.name}</td>
                      <td className={`py-1.5 px-2 font-bold ${u.dept_id ? (isMatching ? 'text-primary' : 'text-amber-600') : 'text-slate-400 italic'}`}>
                        {u.dept_id ?? 'NULL'}
                      </td>
                      <td className="py-1.5 px-2 font-sans text-on-surface-variant text-[11px]">{u.role}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Table: Departments */}
        <div className="p-4 bg-surface rounded-2xl border border-outline-variant/40 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
              Right Table: <code className="font-mono text-secondary">departments (d)</code>
            </span>
            <span className="text-[11px] font-mono text-on-surface-variant">3 records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-outline-variant/40 text-on-surface-variant font-mono">
                  <th className="py-1.5 px-2 bg-secondary/10 text-secondary font-bold">id (PK)</th>
                  <th className="py-1.5 px-2">dept_name</th>
                  <th className="py-1.5 px-2">floor</th>
                </tr>
              </thead>
              <tbody>
                {depts.map((d) => {
                  const isHighlighted = hoveredDeptId === d.id
                  return (
                    <tr
                      key={d.id}
                      onMouseEnter={() => setHoveredDeptId(d.id)}
                      onMouseLeave={() => setHoveredDeptId(null)}
                      className={`border-b border-outline-variant/20 transition-colors font-mono cursor-pointer ${
                        isHighlighted ? 'bg-secondary/15' : 'hover:bg-surface-variant/30'
                      }`}
                    >
                      <td className="py-1.5 px-2 font-bold text-secondary">{d.id}</td>
                      <td className="py-1.5 px-2 font-sans font-medium text-on-surface">{d.dept_name}</td>
                      <td className="py-1.5 px-2 font-sans text-on-surface-variant text-[11px]">{d.floor}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Generated Joined Output Result Table */}
      <div className="p-4 bg-surface rounded-2xl border border-outline-variant/40 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-base">table_view</span>
            Query Output ({joinType})
          </span>
          <span className="text-[11px] text-on-surface-variant">
            {joinType === 'INNER JOIN' && 'Only rows matching ON condition in both tables.'}
            {joinType === 'LEFT JOIN' && 'All left rows preserved; right unmatched filled with NULL.'}
            {joinType === 'RIGHT JOIN' && 'All right rows preserved; left unmatched filled with NULL.'}
            {joinType === 'FULL OUTER JOIN' && 'Union of all rows from both tables, filling NULL where unmatched.'}
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-outline-variant/30">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-variant/40">
              <tr className="border-b border-outline-variant/40 text-on-surface-variant font-mono">
                <th className="py-2 px-3">u.id</th>
                <th className="py-2 px-3">u.name</th>
                <th className="py-2 px-3">u.dept_id</th>
                <th className="py-2 px-3">d.dept_name</th>
                <th className="py-2 px-3">d.floor</th>
                <th className="py-2 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {joinedRows.map((row, idx) => (
                <tr key={idx} className="border-b border-outline-variant/20 hover:bg-surface-variant/20 font-mono">
                  <td className="py-2 px-3">
                    {row.user_id === 'NULL' ? (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold dark:bg-slate-800 dark:text-slate-400">NULL</span>
                    ) : (
                      row.user_id
                    )}
                  </td>
                  <td className="py-2 px-3 font-sans">
                    {row.user_name === 'NULL' ? (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold dark:bg-slate-800 dark:text-slate-400">NULL</span>
                    ) : (
                      <span className="font-semibold text-on-surface">{row.user_name}</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {row.dept_id === 'NULL' || row.dept_id === null ? (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold dark:bg-slate-800 dark:text-slate-400">NULL</span>
                    ) : (
                      <span className="font-bold text-primary">{row.dept_id}</span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-sans">
                    {row.dept_name === 'NULL' ? (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold dark:bg-slate-800 dark:text-slate-400">NULL</span>
                    ) : (
                      <span className="text-on-surface">{row.dept_name}</span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-sans text-on-surface-variant">
                    {row.floor === 'NULL' ? (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold dark:bg-slate-800 dark:text-slate-400">NULL</span>
                    ) : (
                      row.floor
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {row.matched ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        MATCHED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        UNMATCHED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
