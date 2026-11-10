
import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Package, Plus, Search, RefreshCw,
  MapPin, Tags, Boxes, X,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

type Category = {
  id: string
  name: string
  description: string | null
}

type Location = {
  id: string
  code: string
  name: string
  location_type: string
}

type Item = {
  id: string
  sku: string
  name: string
  description: string | null
  tracking_type: 'QUANTITY' | 'SERIALIZED'
  unit: string
  minimum_stock: number
  reference_cost: number | null
  is_active: boolean
  category_id: string
}

type Tab = 'items' | 'categories' | 'locations'
type FormType = 'item' | 'category' | 'location' | null

interface Props {
  isAdmin: boolean
}

export default function Inventory({ isAdmin }: Props) {
  const [tab, setTab] = useState<Tab>('items')
  const [formType, setFormType] = useState<FormType>(null)
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    category_id: '',
    tracking_type: 'QUANTITY' as 'QUANTITY' | 'SERIALIZED',
    unit: 'PZA',
    minimum_stock: '0',
    reference_cost: '',
    code: '',
    location_type: 'BRANCH',
    address: '',
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    const [itemsResult, categoriesResult, locationsResult] =
      await Promise.all([
        supabase.from('inventory_items').select(
          'id,sku,name,description,tracking_type,unit,minimum_stock,reference_cost,is_active,category_id'
        ).order('name'),
        supabase.from('inventory_categories').select(
          'id,name,description'
        ).order('name'),
        supabase.from('locations').select(
          'id,code,name,location_type'
        ).order('name'),
      ])

    const requestError =
      itemsResult.error ||
      categoriesResult.error ||
      locationsResult.error

    if (requestError) {
      setError(requestError.message)
    } else {
      setItems((itemsResult.data ?? []) as Item[])
      setCategories((categoriesResult.data ?? []) as Category[])
      setLocations((locationsResult.data ?? []) as Location[])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  function resetForm() {
    setForm({
      sku: '',
      name: '',
      description: '',
      category_id: '',
      tracking_type: 'QUANTITY',
      unit: 'PZA',
      minimum_stock: '0',
      reference_cost: '',
      code: '',
      location_type: 'BRANCH',
      address: '',
    })
    setFormType(null)
  }

  function openForm(type: FormType) {
    setError('')
    setSuccess('')
    resetForm()
    setFormType(type)
  }

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isAdmin || !formType || saving) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      if (formType === 'category') {
        const { error } = await supabase
          .from('inventory_categories')
          .insert({
            name: form.name.trim(),
            description: form.description.trim() || null,
          })
        if (error) throw error
      }

      if (formType === 'location') {
        const { error } = await supabase
          .from('locations')
          .insert({
            code: form.code.trim().toUpperCase(),
            name: form.name.trim(),
            location_type: form.location_type,
            address: form.address.trim() || null,
          })
        if (error) throw error
      }

      if (formType === 'item') {
        const { data: userResult, error: userError } =
          await supabase.auth.getUser()

        if (userError || !userResult.user) {
          throw new Error('No hay una sesión válida.')
        }

        const minimum = Number(form.minimum_stock)
        const cost = form.reference_cost.trim()
          ? Number(form.reference_cost)
          : null

        if (
          !form.category_id ||
          !Number.isFinite(minimum) ||
          minimum < 0 ||
          (cost !== null && (!Number.isFinite(cost) || cost < 0))
        ) {
          throw new Error('Revisa la categoría, costo y stock mínimo.')
        }

        const { error } = await supabase
          .from('inventory_items')
          .insert({
            sku: form.sku.trim().toUpperCase(),
            name: form.name.trim(),
            description: form.description.trim() || null,
            category_id: form.category_id,
            tracking_type: form.tracking_type,
            unit: form.tracking_type === 'SERIALIZED'
              ? 'PZA'
              : form.unit.trim().toUpperCase(),
            minimum_stock: minimum,
            reference_cost: cost,
            created_by: userResult.user.id,
          })

        if (error) throw error
      }

      resetForm()
      setSuccess('Registro guardado correctamente.')
      await loadData()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo guardar.'
      )
    } finally {
      setSaving(false)
    }
  }

  const filteredItems = items.filter(item => {
    const query = search.toLowerCase()
    return (
      item.name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query)
    )
  })

  const inputClass = 'mac-input'
  const labelClass = 'mb-2 block text-sm font-medium text-mac-muted'

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-xs text-nucleo-orange">
            CORE SYSTEM / INVENTARIO
          </p>
          <h2 className="text-3xl font-black">Inventario</h2>
          <p className="mt-2 text-sm text-mac-muted">
            Artículos, categorías, sucursales y almacenes.
          </p>
        </div>
        <button
          onClick={() => void loadData()}
          className="mac-button-secondary flex items-center gap-2 text-sm"
        >
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Artículos', count: items.length, icon: Package,
            color: 'text-nucleo-orange' },
          { label: 'Categorías', count: categories.length, icon: Tags,
            color: 'text-nucleo-blue' },
          { label: 'Ubicaciones', count: locations.length, icon: MapPin,
            color: 'text-nucleo-purple' },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="mac-card p-5">
              <Icon size={22} className={stat.color} />
              <p className="mt-3 text-sm text-mac-muted">{stat.label}</p>
              <p className="mt-1 text-3xl font-black">{stat.count}</p>
            </div>
          )
        })}
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-800
          bg-red-950/40 p-3 text-sm text-red-200">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="rounded-lg border border-emerald-800
          bg-emerald-950/40 p-3 text-sm text-emerald-200">
          {success}
        </p>
      )}

      <div className="mac-card overflow-hidden">
        <div className="nucleo-spectrum h-1" />

        <div className="flex flex-wrap items-center justify-between
          gap-3 border-b border-mac-border p-4">
          <div className="flex flex-wrap gap-2">
            {([
              ['items', 'Artículos'],
              ['categories', 'Categorías'],
              ['locations', 'Ubicaciones'],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium
                  ${tab === id
                    ? 'bg-nucleo-pink-bg text-nucleo-pink'
                    : 'text-mac-muted hover:bg-[#24202d]'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button
              onClick={() => openForm(
                tab === 'items' ? 'item'
                : tab === 'categories' ? 'category'
                : 'location'
              )}
              className="mac-button flex items-center gap-2 text-sm"
            >
              <Plus size={17} /> Nuevo
            </button>
          )}
        </div>

        {tab === 'items' && (
          <div className="p-4">
            <div className="relative mb-5">
              <Search size={18} className="absolute left-3 top-1/2
                -translate-y-1/2 text-mac-muted" />
              <input
                className="mac-input pl-10"
                placeholder="Buscar por nombre o SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="border-b border-mac-border
                  text-xs uppercase text-mac-muted">
                  <tr>
                    <th className="px-3 py-3">Código</th>
                    <th className="px-3 py-3">Artículo</th>
                    <th className="px-3 py-3">Categoría</th>
                    <th className="px-3 py-3">Control</th>
                    <th className="px-3 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.id}
                      className="border-b border-mac-border/60">
                      <td className="px-3 py-4 font-mono
                        text-nucleo-orange">{item.sku}</td>
                      <td className="px-3 py-4 font-semibold">
                        {item.name}
                      </td>
                      <td className="px-3 py-4 text-mac-muted">
                        {categories.find(c => c.id === item.category_id)
                          ?.name ?? 'Sin categoría'}
                      </td>
                      <td className="px-3 py-4 text-mac-muted">
                        {item.tracking_type === 'SERIALIZED'
                          ? 'Por serie' : 'Por cantidad'}
                      </td>
                      <td className="px-3 py-4">
                        {item.is_active ? 'Activo' : 'Inactivo'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && filteredItems.length === 0 && (
              <div className="py-14 text-center text-mac-muted">
                <Boxes size={34} className="mx-auto mb-3" />
                <p>No se encontraron artículos.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'categories' && (
          <div className="divide-y divide-mac-border/60">
            {categories.map(category => (
              <div key={category.id}
                className="flex items-center gap-3 p-5">
                <Tags size={18} className="text-nucleo-blue" />
                <div>
                  <p className="font-semibold">{category.name}</p>
                  <p className="text-xs text-mac-muted">
                    {category.description || 'Sin descripción'}
                  </p>
                </div>
              </div>
            ))}
            {!categories.length && (
              <p className="p-8 text-center text-mac-muted">
                No hay categorías registradas.
              </p>
            )}
          </div>
        )}

        {tab === 'locations' && (
          <div className="divide-y divide-mac-border/60">
            {locations.map(location => (
              <div key={location.id}
                className="flex items-center gap-3 p-5">
                <MapPin size={18} className="text-nucleo-purple" />
                <div>
                  <p className="font-semibold">{location.name}</p>
                  <p className="text-xs text-mac-muted">
                    {location.code} · {location.location_type === 'BRANCH'
                      ? 'Sucursal' : 'Almacén'}
                  </p>
                </div>
              </div>
            ))}
            {!locations.length && (
              <p className="p-8 text-center text-mac-muted">
                No hay ubicaciones registradas.
              </p>
            )}
          </div>
        )}
      </div>

      {formType && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center
          justify-center bg-black/75 p-4">
          <section role="dialog" aria-modal="true"
            aria-label="Nuevo registro"
            className="mac-window max-h-[90dvh] w-full max-w-lg
              overflow-y-auto p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {formType === 'item' ? 'Nuevo artículo'
                  : formType === 'category' ? 'Nueva categoría'
                  : 'Nueva ubicación'}
              </h3>
              <button onClick={resetForm} aria-label="Cerrar">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={save} className="space-y-4">
              {formType === 'item' && (
                <>
                  <div>
                    <label className={labelClass}>Código SKU</label>
                    <input required className={inputClass}
                      value={form.sku}
                      onChange={e => setForm({
                        ...form, sku: e.target.value,
                      })} />
                  </div>

                  <div>
                    <label className={labelClass}>Categoría</label>
                    <select required className={inputClass}
                      value={form.category_id}
                      onChange={e => setForm({
                        ...form, category_id: e.target.value,
                      })}>
                      <option value="">Seleccionar categoría</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Tipo de control</label>
                    <select className={inputClass}
                      value={form.tracking_type}
                      onChange={e => setForm({
                        ...form,
                        tracking_type: e.target.value as
                          'QUANTITY' | 'SERIALIZED',
                      })}>
                      <option value="QUANTITY">Por cantidad</option>
                      <option value="SERIALIZED">Por número de serie</option>
                    </select>
                  </div>

                  {form.tracking_type === 'QUANTITY' && (
                    <div>
                      <label className={labelClass}>Unidad</label>
                      <select className={inputClass}
                        value={form.unit}
                        onChange={e => setForm({
                          ...form, unit: e.target.value,
                        })}>
                        <option value="PZA">Pieza</option>
                        <option value="M">Metro</option>
                        <option value="CAJA">Caja</option>
                        <option value="ROLLO">Rollo</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>Stock mínimo</label>
                    <input type="number" min="0" step="0.01"
                      className={inputClass} value={form.minimum_stock}
                      onChange={e => setForm({
                        ...form, minimum_stock: e.target.value,
                      })} required />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Costo de referencia (MXN)
                    </label>
                    <input type="number" min="0" step="0.01"
                      className={inputClass} value={form.reference_cost}
                      onChange={e => setForm({
                        ...form, reference_cost: e.target.value,
                      })} />
                  </div>
                </>
              )}

              {formType === 'location' && (
                <>
                  <div>
                    <label className={labelClass}>Código</label>
                    <input required className={inputClass}
                      value={form.code}
                      onChange={e => setForm({
                        ...form, code: e.target.value,
                      })} />
                  </div>
                  <div>
                    <label className={labelClass}>Tipo de ubicación</label>
                    <select className={inputClass}
                      value={form.location_type}
                      onChange={e => setForm({
                        ...form, location_type: e.target.value,
                      })}>
                      <option value="BRANCH">Sucursal</option>
                      <option value="WAREHOUSE">Almacén</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Dirección</label>
                    <input className={inputClass}
                      value={form.address}
                      onChange={e => setForm({
                        ...form, address: e.target.value,
                      })} />
                  </div>
                </>
              )}

              <div>
                <label className={labelClass}>Nombre</label>
                <input required className={inputClass}
                  value={form.name}
                  onChange={e => setForm({
                    ...form, name: e.target.value,
                  })} />
              </div>

              {formType !== 'location' && (
                <div>
                  <label className={labelClass}>Descripción</label>
                  <textarea rows={3} className={inputClass}
                    value={form.description}
                    onChange={e => setForm({
                      ...form, description: e.target.value,
                    })} />
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={resetForm}
                  className="mac-button-secondary flex-1">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="mac-button flex-1">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}
