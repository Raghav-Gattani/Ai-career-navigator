import React, { useState, useMemo } from 'react'

// Binary Search Tree Node definition
class TreeNode {
  constructor(val) {
    this.val = val
    this.left = null
    this.right = null
  }
}

function buildTreeFromArray(arr) {
  let root = null
  function insert(node, val) {
    if (!node) return new TreeNode(val)
    if (val < node.val) node.left = insert(node.left, val)
    else if (val > node.val) node.right = insert(node.right, val)
    return node
  }
  for (const v of arr) {
    root = insert(root, v)
  }
  return root
}

function deleteNode(root, val) {
  if (!root) return null
  if (val < root.val) {
    root.left = deleteNode(root.left, val)
    return root
  } else if (val > root.val) {
    root.right = deleteNode(root.right, val)
    return root
  } else {
    if (!root.left) return root.right
    if (!root.right) return root.left
    let minLarger = root.right
    while (minLarger.left) minLarger = minLarger.left
    root.val = minLarger.val
    root.right = deleteNode(root.right, minLarger.val)
    return root
  }
}

function getTreeDepth(node) {
  if (!node) return 0
  return 1 + Math.max(getTreeDepth(node.left), getTreeDepth(node.right))
}

function countNodes(node) {
  if (!node) return 0
  return 1 + countNodes(node.left) + countNodes(node.right)
}

function getInOrder(node, acc = []) {
  if (!node) return acc
  getInOrder(node.left, acc)
  acc.push(node.val)
  getInOrder(node.right, acc)
  return acc
}

// Compute coordinates for SVG rendering
function computeLayout(node, x = 300, y = 50, level = 0, spread = 140) {
  if (!node) return []
  const current = {
    val: node.val,
    x,
    y,
    level,
    left: null,
    right: null
  }

  const childSpread = Math.max(28, spread / 1.85)

  if (node.left) {
    const leftLayout = computeLayout(node.left, x - spread, y + 68, level + 1, childSpread)
    current.left = leftLayout[0]
    return [current, ...leftLayout]
  }
  if (node.right) {
    const rightLayout = computeLayout(node.right, x + spread, y + 68, level + 1, childSpread)
    current.right = rightLayout[0]
    return [current, ...rightLayout]
  }

  return [current]
}

function getAllNodesAndLinks(node, x = 340, y = 45, level = 0, spread = 135) {
  const nodes = []
  const links = []

  function traverse(curr, cx, cy, lvl, sp) {
    if (!curr) return null
    const item = { val: curr.val, x: cx, y: cy, level: lvl }
    nodes.push(item)

    const nextSp = Math.max(34, sp / 1.9)
    if (curr.left) {
      const leftChild = traverse(curr.left, cx - sp, cy + 68, lvl + 1, nextSp)
      if (leftChild) {
        links.push({ x1: cx, y1: cy, x2: leftChild.x, y2: leftChild.y, targetVal: leftChild.val })
      }
    }
    if (curr.right) {
      const rightChild = traverse(curr.right, cx + sp, cy + 68, lvl + 1, nextSp)
      if (rightChild) {
        links.push({ x1: cx, y1: cy, x2: rightChild.x, y2: rightChild.y, targetVal: rightChild.val })
      }
    }
    return item
  }

  traverse(node, x, y, level, spread)
  return { nodes, links }
}

export default function BSTRenderer({ spec, onActionLog }) {
  const initialValues = useMemo(() => {
    return spec?.initial_data?.initial_nodes || spec?.parameters?.initial_values || [50, 30, 70, 20, 40, 60, 80]
  }, [spec])

  const [treeValues, setTreeValues] = useState(initialValues)
  const [inputValue, setInputValue] = useState('')
  const [highlightVal, setHighlightVal] = useState(null)
  const [visitedPath, setVisitedPath] = useState([])
  const [searchStatus, setSearchStatus] = useState('')

  const root = useMemo(() => {
    return buildTreeFromArray(treeValues)
  }, [treeValues])

  const { nodes, links } = useMemo(() => {
    return getAllNodesAndLinks(root, 340, 45, 0, 130)
  }, [root])

  const treeDepth = useMemo(() => getTreeDepth(root), [root])
  const nodeCount = useMemo(() => countNodes(root), [root])
  const inOrderSeq = useMemo(() => getInOrder(root), [root])

  const handleInsert = (valToInsert) => {
    const val = Number(valToInsert !== undefined ? valToInsert : inputValue)
    if (isNaN(val) || val <= 0) return

    if (treeValues.includes(val)) {
      setSearchStatus(`Value ${val} already exists in the BST (keys must be unique).`)
      return
    }

    // Trace insertion path
    let curr = root
    const path = []
    while (curr) {
      path.push(curr.val)
      if (val < curr.val) curr = curr.left
      else curr = curr.right
    }

    setVisitedPath(path)
    setHighlightVal(val)
    setSearchStatus(`Inserting ${val}: Compared along path [${path.join(' → ')}] → Placed as child.`)

    const newArr = [...treeValues, val]
    setTreeValues(newArr)
    setInputValue('')

    if (onActionLog) {
      onActionLog({ action: 'insert', value: val, path, count: newArr.length })
    }
  }

  const handleSearch = (valToSearch) => {
    const val = Number(valToSearch !== undefined ? valToSearch : inputValue)
    if (isNaN(val)) return

    let curr = root
    const path = []
    let found = false

    while (curr) {
      path.push(curr.val)
      if (curr.val === val) {
        found = true
        break
      }
      if (val < curr.val) curr = curr.left
      else curr = curr.right
    }

    setVisitedPath(path)
    setHighlightVal(found ? val : null)
    if (found) {
      setSearchStatus(`FOUND: ${val} located in ${path.length} step(s) (Path: ${path.join(' → ')}). Time complexity: O(h).`)
    } else {
      setSearchStatus(`NOT FOUND: ${val} does not exist in BST. Traversed: ${path.join(' → ')} → Reached null leaf.`)
    }

    if (onActionLog) {
      onActionLog({ action: 'search', value: val, found, steps: path.length })
    }
  }

  const handleDelete = (valToDelete) => {
    const val = Number(valToDelete !== undefined ? valToDelete : inputValue)
    if (isNaN(val)) return

    if (!treeValues.includes(val)) {
      setSearchStatus(`Cannot delete ${val}: Not in tree.`)
      return
    }

    const updated = treeValues.filter(x => x !== val)
    setTreeValues(updated)
    setHighlightVal(null)
    setVisitedPath([])
    setSearchStatus(`Deleted node ${val}. Tree rebalanced with successor node replacement if applicable.`)
    setInputValue('')

    if (onActionLog) {
      onActionLog({ action: 'delete', value: val, remainingCount: updated.length })
    }
  }

  const handleReset = () => {
    setTreeValues(initialValues)
    setVisitedPath([])
    setHighlightVal(null)
    setSearchStatus('Tree reset to initial default state.')
    setInputValue('')
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Visual Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface-variant/40 rounded-2xl border border-outline-variant/30">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            placeholder="Enter node value (e.g. 25)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-48 px-3.5 py-2 text-sm bg-white dark:bg-surface-dark border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono text-on-surface"
          />
          <button
            onClick={() => handleInsert()}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            Insert Node
          </button>
          <button
            onClick={() => handleSearch()}
            className="px-4 py-2 bg-secondary-container text-on-secondary-container border border-secondary/20 rounded-xl text-xs font-semibold hover:bg-secondary-container/80 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">search</span>
            Search Path
          </button>
          <button
            onClick={() => handleDelete()}
            className="px-4 py-2 bg-error/10 text-error hover:bg-error/20 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">delete</span>
            Delete
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant font-medium">Quick Insert:</span>
          {[15, 35, 65, 85].map(v => (
            <button
              key={v}
              onClick={() => handleInsert(v)}
              className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-surface border border-outline-variant/50 hover:border-primary text-on-surface hover:text-primary transition-colors"
            >
              +{v}
            </button>
          ))}
          <button
            onClick={handleReset}
            className="ml-2 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface rounded-lg transition-colors"
            title="Reset to default tree"
          >
            <span className="material-symbols-outlined text-lg">restart_alt</span>
          </button>
        </div>
      </div>

      {/* SVG Tree Canvas */}
      <div className="relative w-full h-[360px] bg-white dark:bg-[#151d1c] rounded-2xl border border-outline-variant/40 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Canvas Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#263331_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

        <svg className="w-full h-full" viewBox="0 0 680 340">
          <defs>
            <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
            </filter>
          </defs>

          {/* Links */}
          {links.map((link, idx) => {
            const isTraversed = visitedPath.includes(link.targetVal)
            return (
              <line
                key={`link-${idx}`}
                x1={link.x1}
                y1={link.y1}
                x2={link.x2}
                y2={link.y2}
                stroke={isTraversed ? '#00685f' : '#cbd5e1'}
                strokeWidth={isTraversed ? '3' : '1.75'}
                strokeDasharray={isTraversed ? 'none' : 'none'}
                className="transition-all duration-300"
              />
            )
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isHighlighted = highlightVal === node.val
            const isPathNode = visitedPath.includes(node.val)

            let fillColor = '#ffffff'
            let strokeColor = '#00685f'
            let textColor = '#2c3130'

            if (isHighlighted) {
              fillColor = '#10b981' // Found/success
              strokeColor = '#059669'
              textColor = '#ffffff'
            } else if (isPathNode) {
              fillColor = '#fef3c7' // Traversed path amber
              strokeColor = '#d97706'
              textColor = '#92400e'
            }

            return (
              <g
                key={`node-${node.val}`}
                className="cursor-pointer transition-all duration-300 transform"
                onClick={() => handleSearch(node.val)}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="21"
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth="2.5"
                  filter="url(#nodeShadow)"
                  className="transition-colors duration-200"
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fill={textColor}
                  fontSize="13"
                  fontWeight="700"
                  fontFamily="monospace"
                  className="select-none pointer-events-none"
                >
                  {node.val}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-3 left-4 flex items-center gap-3 bg-white/90 dark:bg-surface-dark/90 px-3 py-1.5 rounded-lg border border-outline-variant/30 text-[11px] backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-primary"></span>
            <span className="text-on-surface-variant">Default Node</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-100 border-2 border-amber-600"></span>
            <span className="text-on-surface-variant">Visited in Path</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-emerald-600"></span>
            <span className="text-on-surface-variant">Target Match</span>
          </div>
        </div>
      </div>

      {/* Live Action Status Banner */}
      {searchStatus && (
        <div className="px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">info</span>
          {searchStatus}
        </div>
      )}

      {/* Real-time BST Properties Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-surface rounded-xl border border-outline-variant/30">
          <div className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">Total Nodes</div>
          <div className="text-xl font-bold font-mono text-on-surface mt-0.5">{nodeCount}</div>
        </div>
        <div className="p-3 bg-surface rounded-xl border border-outline-variant/30">
          <div className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">Tree Depth (h)</div>
          <div className="text-xl font-bold font-mono text-primary mt-0.5">{treeDepth}</div>
        </div>
        <div className="p-3 bg-surface rounded-xl border border-outline-variant/30">
          <div className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">Search Complexity</div>
          <div className="text-xl font-bold font-mono text-on-surface mt-0.5">O(h) ≈ O(log n)</div>
        </div>
        <div className="p-3 bg-surface rounded-xl border border-outline-variant/30">
          <div className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">Root Key</div>
          <div className="text-xl font-bold font-mono text-on-surface mt-0.5">{root ? root.val : 'None'}</div>
        </div>
      </div>

      {/* In-Order Traversal (Sorted invariant verification) */}
      <div className="p-4 bg-surface rounded-xl border border-outline-variant/30 flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
          <span>In-Order Traversal (L → Root → R is always strictly sorted):</span>
          <span className="text-[11px] text-primary font-mono">BST Invariant</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-on-surface pt-1">
          {inOrderSeq.map((v, i) => (
            <React.Fragment key={v}>
              <span className={`px-2 py-0.5 rounded border ${v === highlightVal ? 'bg-primary text-white font-bold' : 'bg-surface-variant/50 border-outline-variant/40'}`}>
                {v}
              </span>
              {i < inOrderSeq.length - 1 && <span className="text-on-surface-variant">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
