import { useState, useMemo } from 'react'
import { addPrinter, updatePrinter, usePrinters, useOrders,
  useMaintenanceTasks, addMaintenanceTask, updateMaintenanceTask,
  deleteMaintenanceTask, completeMaintenance } from '../hooks/useOrders'
import { Plus, Pencil, Check, X, Layers, Wrench, ChevronDown, ChevronUp, Trash2, AlertTriangle, Clock } from 'lucide-react'

function MaintenanceSection({ printer, totalHours }) {
  const { tasks } = useMaintenanceTasks(printer.id)
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({ name: '', interval_hours: 200, description: '' })
  const [saving, setSaving] = useState(false)

  const saveTask = async (e) => {
    e.preventDefault()
    setSaving(true)
    await addMaintenanceTask(printer.id, { ...newTask, interval_hours: Number(newTask.interval_hours) })
    setNewTask({ name: '', interval_hours: 200, description: '' })
    setShowAddTask(false)
    setSaving(false)
  }

  const doneTask = async (task) => {
    await completeMaintenance(printer.id, task.id, totalHours)
  }

  const removeTask = async (taskId) => {
    if (confirm('Onderhoudstaak verwijderen?')) await deleteMaintenanceTask(printer.id, taskId)
  }

  const hoursSinceDone = (task) => {
    if (task.last_done_at_hours == null) return totalHours
    return totalHours - task.last_done_at_hours
  }

  const isDue = (task) => hoursSinceDone(task) >= task.interval_hours
  const isWarning = (task) => hoursSinceDone(task) >= task.interval_hours * 0.85

  return (
    <div className="mt-4 border-t border-zinc-900 pt-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-xs uppercase tracking-wide font-medium flex items-center gap-1.5">
          <Wrench size={11} />Onderhoud
        </span>
        <button onClick={() => setShowAddTask(!showAddTask)}
          className="text-xs flex items-center gap-1 text-slate-500 hover:text-white transition-colors">
          <Plus size={12} />Taak toevoegen
        </button>
      </div>

      {tasks.length === 0 && !showAddTask && (
        <p className="text-slate-700 text-xs">Nog geen onderhoudstaken ingesteld.</p>
      )}

      {tasks.map(task => {
        const hrs = hoursSinceDone(task)
        const pct = Math.min(100, Math.round((hrs / task.interval_hours) * 100))
        const due = isDue(task)
        const warn = isWarning(task)
        return (
          <div key={task.id} className={`rounded-lg p-3 border ${due ? 'border-red-800 bg-red-950/30' : warn ? 'border-amber-800/50 bg-amber-950/20' : 'border-zinc-900 bg-zinc-950'}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {due && <AlertTriangle size={12} className="text-red-400 flex-shrink-0" />}
                  <span className={`text-sm font-medium ${due ? 'text-red-300' : 'text-white'}`}>{task.name}</span>
                  <span className="text-xs text-slate-600">elke {task.interval_hours}u</span>
                </div>
                {task.description && <p className="text-slate-500 text-xs mb-2">{task.description}</p>}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${due ? 'bg-red-500' : warn ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{width: `${pct}%`}} />
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{Math.round(hrs)}u / {task.interval_hours}u</span>
                </div>
                {task.last_done_at && (
                  <p className="text-slate-600 text-xs mt-1">
                    Laatst: {new Date(task.last_done_at).toLocaleDateString('nl-NL')}
                  </p>
                )}
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => doneTask(task)}
                  className="text-xs px-2 py-1 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-400 rounded-lg transition-colors flex items-center gap-1">
                  <Check size={11} />Gedaan
                </button>
                <button onClick={() => removeTask(task.id)} className="text-slate-700 hover:text-red-400 p-1 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {showAddTask && (
        <form onSubmit={saveTask} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-500 text-xs mb-1">Taaknaam *</label>
              <input required value={newTask.name} onChange={e => setNewTask({...newTask, name: e.target.value})}
                placeholder="bijv. Nozzle reinigen"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none placeholder-slate-600" />
            </div>
            <div>
              <label className="block text-slate-500 text-xs mb-1">Interval (uren)</label>
              <input type="number" min="1" value={newTask.interval_hours} onChange={e => setNewTask({...newTask, interval_hours: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-slate-500 text-xs mb-1">Omschrijving</label>
            <input value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}
              placeholder="Wat moet er gedaan worden?"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none placeholder-slate-600" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="text-xs text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
              style={{backgroundColor:'#FF2300'}}>
              {saving ? 'Opslaan…' : 'Toevoegen'}
            </button>
            <button type="button" onClick={() => setShowAddTask(false)}
              className="text-xs text-slate-500 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800">
              Annuleren
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default function PrintersPage() {
  const printers = usePrinters()
  const { orders } = useOrders()
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [editId, setEditId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState({})

  // Bereken totale print uren per printer uit afgeronde orders
  const printerHours = useMemo(() => {
    const map = {}
    orders.forEach(o => {
      if (o.status === 'done' && o.printer_id) {
        const hrs = (Number(o.print_hours) || 0) + (Number(o.print_minutes) || 0) / 60
        map[o.printer_id] = (map[o.printer_id] || 0) + hrs
      }
    })
    return map
  }, [orders])

  const add = async () => {
    if (!newName.trim()) return
    setLoading(true)
    await addPrinter({ name: newName.trim(), description: newDesc.trim(), active: true, total_hours_offset: 0 })
    setNewName(''); setNewDesc('')
    setLoading(false)
  }

  const save = async (id) => {
    await updatePrinter(id, { name: editName, description: editDesc })
    setEditId(null)
  }

  const toggle = (p) => updatePrinter(p.id, { active: !p.active })
  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
        <Layers size={20} style={{color:'#FF2300'}} />Printers beheren
      </h1>

      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 mb-6">
        <h2 className="text-slate-400 text-xs uppercase tracking-wide font-medium mb-3">Printer toevoegen</h2>
        <div className="flex gap-2">
          <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
            placeholder="Naam (bv. Prusa XL)"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none text-sm" />
          <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Omschrijving (optioneel)"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none text-sm" />
          <button onClick={add} disabled={loading || !newName.trim()}
            className="disabled:opacity-50 text-white px-3 py-2 rounded-lg transition-colors"
            style={{backgroundColor:'#FF2300'}}>
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {printers.map(p => {
          const totalHours = (printerHours[p.id] || 0) + (p.total_hours_offset || 0)
          const isExpanded = expanded[p.id]
          return (
            <div key={p.id} className={`bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden ${!p.active && 'opacity-50'}`}>
              <div className="p-4 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                {editId === p.id ? (
                  <div className="flex-1 flex gap-2">
                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-white text-sm focus:outline-none" />
                    <input value={editDesc} onChange={e => setEditDesc(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 text-sm focus:outline-none" />
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium">{p.name}</div>
                    {p.description && <div className="text-slate-500 text-xs">{p.description}</div>}
                    <div className="flex items-center gap-1 mt-1 text-slate-600 text-xs">
                      <Clock size={10} />{Math.round(totalHours * 10) / 10} printuren totaal
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {editId === p.id ? (
                    <>
                      <button onClick={() => save(p.id)} className="text-emerald-400 hover:text-emerald-300 p-1"><Check size={15} /></button>
                      <button onClick={() => setEditId(null)} className="text-slate-500 hover:text-slate-300 p-1"><X size={15} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(p.id); setEditName(p.name); setEditDesc(p.description || '') }}
                        className="text-slate-500 hover:text-slate-300 p-1"><Pencil size={14} /></button>
                      <button onClick={() => toggle(p)}
                        className={`text-xs px-2 py-1 rounded-lg transition-colors ${p.active ? 'text-slate-500 hover:text-amber-400' : 'text-slate-600 hover:text-emerald-400'}`}>
                        {p.active ? 'Uit' : 'Aan'}
                      </button>
                      <button onClick={() => toggleExpand(p.id)} className="text-slate-500 hover:text-slate-300 p-1">
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>
                    </>
                  )}
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 pb-4">
                  <MaintenanceSection printer={p} totalHours={totalHours} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
