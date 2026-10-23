import React from 'react'
import BSTRenderer from './BSTRenderer'
import BinarySearchRenderer from './BinarySearchRenderer'
import TCPHandshakeRenderer from './TCPHandshakeRenderer'
import SQLJoinRenderer from './SQLJoinRenderer'
import NeuralNetworkRenderer from './NeuralNetworkRenderer'
import StackQueueRenderer from './StackQueueRenderer'
import SortingRenderer from './SortingRenderer'
import DOMTreeRenderer from './DOMTreeRenderer'
import CSSLayoutRenderer from './CSSLayoutRenderer'
import DNSResolutionRenderer from './DNSResolutionRenderer'
import GraphTraversalRenderer from './GraphTraversalRenderer'

function FallbackRenderer({ spec, onActionLog }) {
  const steps = spec?.steps || [
    { title: 'Initialization', desc: 'System prepares state variables and registers hooks.' },
    { title: 'Processing', desc: 'Core logic transforms input parameters according to specifications.' },
    { title: 'Convergence', desc: 'Output state settles and yields validated results.' }
  ]

  const [activeStep, setActiveStep] = React.useState(0)

  return (
    <div className="flex flex-col gap-5">
      <div className="p-5 bg-surface-variant/30 rounded-2xl border border-outline-variant/30 flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary font-mono">
            {spec?.concept_category || 'Interactive Concept Exploration'}
          </span>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200">
            Generalized Concept Model
          </span>
        </div>
        <p className="text-sm text-on-surface leading-relaxed">
          {spec?.summary || spec?.concise_explanation || spec?.description || 'Conceptual exploration of core mechanics, parameters, and invariants.'}
        </p>
        <div className="text-[11px] text-on-surface-variant/80 border-t border-outline-variant/20 pt-2 font-mono">
          Note: This topic is represented via our conceptual reasoning engine. For specialized interactive simulation sandboxes with visual controls, explore our dedicated engines: Binary Search Tree, Binary Search, TCP Handshake, SQL JOIN, Neural Network, DOM Tree, CSS Flexbox/Grid, Stack & Queue, or Sorting.
        </div>
      </div>

      {/* Step Stepper */}
      <div className="p-6 bg-white dark:bg-[#151d1c] rounded-2xl border border-outline-variant/40 shadow-inner flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {steps.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveStep(idx)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeStep === idx
                  ? 'bg-primary text-white shadow'
                  : 'bg-surface text-on-surface-variant border border-outline-variant/40 hover:bg-surface-variant'
              }`}
            >
              Step {idx + 1}: {s.title || s.action || `Phase ${idx + 1}`}
            </button>
          ))}
        </div>

        <div className="p-4 bg-surface rounded-xl border border-outline-variant/30">
          <div className="text-sm font-bold text-on-surface">{steps[activeStep]?.title || steps[activeStep]?.action}</div>
          <div className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
            {steps[activeStep]?.desc || steps[activeStep]?.explanation}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SimulationRegistry({ spec, onActionLog }) {
  if (!spec) {
    return (
      <div className="p-12 text-center text-on-surface-variant flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-outline mb-2">science</span>
        <p className="text-sm">Select or search a topic above to load an interactive visual simulation.</p>
      </div>
    )
  }

  const rendererType = spec.renderer_type?.toLowerCase() || ''

  switch (rendererType) {
    case 'binary_search':
    case 'bsearch':
      return <BinarySearchRenderer spec={spec} onActionLog={onActionLog} />

    case 'bst':
    case 'binary_search_tree':
      return <BSTRenderer spec={spec} onActionLog={onActionLog} />

    case 'tcp_handshake':
    case 'tcp':
      return <TCPHandshakeRenderer spec={spec} onActionLog={onActionLog} />

    case 'sql_join':
    case 'sql':
      return <SQLJoinRenderer spec={spec} onActionLog={onActionLog} />

    case 'neural_network':
    case 'nn':
    case 'forward_propagation':
      return <NeuralNetworkRenderer spec={spec} onActionLog={onActionLog} />

    case 'stack_queue':
    case 'stack':
    case 'queue':
      return <StackQueueRenderer spec={spec} onActionLog={onActionLog} />

    case 'sorting':
    case 'sorting_visualizer':
      return <SortingRenderer spec={spec} onActionLog={onActionLog} />

    case 'dom_tree':
    case 'dom':
      return <DOMTreeRenderer spec={spec} onActionLog={onActionLog} />

    case 'css_layout':
    case 'flexbox':
    case 'grid':
      return <CSSLayoutRenderer spec={spec} onActionLog={onActionLog} />

    case 'dns_resolution':
    case 'dns':
      return <DNSResolutionRenderer spec={spec} onActionLog={onActionLog} />

    case 'graph_traversal':
    case 'bfs':
    case 'dfs':
      return <GraphTraversalRenderer spec={spec} onActionLog={onActionLog} />

    default:
      return <FallbackRenderer spec={spec} onActionLog={onActionLog} />
  }
}
