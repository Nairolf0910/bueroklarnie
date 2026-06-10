import { useState, useEffect } from 'react';
import { Settings, Plus, CreditCard as Edit3, Trash2, Save, X, Loader2, CheckCircle, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ProcessStep, TrustItem, PricingPlan } from '../../types/database';

type ContentType = 'process' | 'trust' | 'pricing';

export function AdminContent() {
  const [activeTab, setActiveTab] = useState<ContentType>('process');
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [trustItems, setTrustItems] = useState<TrustItem[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    subtitle: '',
    description: '',
    price_text: '',
    features: '',
    icon: 'FileText',
    is_featured: false,
    is_active: true,
  });

  useEffect(() => {
    loadAllContent();
  }, []);

  const loadAllContent = async () => {
    try {
      const [stepsRes, trustRes, pricingRes] = await Promise.all([
        supabase.from('process_steps').select('*').order('sort_order'),
        supabase.from('trust_items').select('*').order('sort_order'),
        supabase.from('pricing_plans').select('*').order('sort_order'),
      ]);

      if (stepsRes.data) setProcessSteps(stepsRes.data);
      if (trustRes.data) setTrustItems(trustRes.data);
      if (pricingRes.data) setPricingPlans(pricingRes.data);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      subtitle: '',
      description: '',
      price_text: '',
      features: '',
      icon: 'FileText',
      is_featured: false,
      is_active: true,
    });
  };

  const startEditing = (item: ProcessStep | TrustItem | PricingPlan) => {
    setEditingId(item.id);
    if (activeTab === 'pricing') {
      const plan = item as PricingPlan;
      setFormData({
        name: plan.name,
        title: '',
        subtitle: plan.subtitle || '',
        description: plan.description || '',
        price_text: plan.price_text,
        features: plan.features.join('\n'),
        icon: 'FileText',
        is_featured: plan.is_featured,
        is_active: plan.is_active,
      });
    } else {
      const step = item as ProcessStep | TrustItem;
      setFormData({
        name: '',
        title: step.title,
        subtitle: '',
        description: step.description || '',
        price_text: '',
        features: '',
        icon: step.icon,
        is_featured: false,
        is_active: step.is_active,
      });
    }
  };

  const saveItem = async () => {
    setSaving(true);
    const table =
      activeTab === 'process' ? 'process_steps' : activeTab === 'trust' ? 'trust_items' : 'pricing_plans';
    const items =
      activeTab === 'process' ? processSteps : activeTab === 'trust' ? trustItems : pricingPlans;

    try {
      if (editingId) {
        // Update
        let updateData: Record<string, unknown>;

        if (activeTab === 'pricing') {
          updateData = {
            name: formData.name,
            subtitle: formData.subtitle || null,
            description: formData.description || null,
            price_text: formData.price_text,
            features: formData.features.split('\n').filter((f) => f.trim()),
            is_featured: formData.is_featured,
            is_active: formData.is_active,
          };
        } else {
          updateData = {
            title: formData.title,
            description: formData.description || null,
            icon: formData.icon,
            is_active: formData.is_active,
          };
        }

        const { error } = await supabase.from(table).update(updateData).eq('id', editingId);
        if (error) throw error;
      } else {
        // Create
        const maxSortOrder = Math.max(0, ...items.map((i) => i.sort_order));
        let insertData: Record<string, unknown>;

        if (activeTab === 'pricing') {
          insertData = {
            name: formData.name,
            subtitle: formData.subtitle || null,
            description: formData.description || null,
            price_text: formData.price_text,
            features: formData.features.split('\n').filter((f) => f.trim()),
            is_featured: formData.is_featured,
            is_active: formData.is_active,
            sort_order: maxSortOrder + 1,
          };
        } else {
          insertData = {
            title: formData.title,
            description: formData.description || null,
            icon: formData.icon,
            is_active: formData.is_active,
            sort_order: maxSortOrder + 1,
          };
        }

        const { error } = await supabase.from(table).insert(insertData);
        if (error) throw error;
      }

      await loadAllContent();
      setEditingId(null);
      setShowNewForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Eintrag wirklich löschen?')) return;

    const table =
      activeTab === 'process' ? 'process_steps' : activeTab === 'trust' ? 'trust_items' : 'pricing_plans';

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;

      if (activeTab === 'process') {
        setProcessSteps((prev) => prev.filter((i) => i.id !== id));
      } else if (activeTab === 'trust') {
        setTrustItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        setPricingPlans((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const toggleActive = async (item: ProcessStep | TrustItem | PricingPlan) => {
    const table =
      activeTab === 'process' ? 'process_steps' : activeTab === 'trust' ? 'trust_items' : 'pricing_plans';

    try {
      const { error } = await supabase
        .from(table)
        .update({ is_active: !item.is_active })
        .eq('id', item.id);

      if (error) throw error;

      if (activeTab === 'process') {
        setProcessSteps((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i))
        );
      } else if (activeTab === 'trust') {
        setTrustItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i))
        );
      } else {
        setPricingPlans((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i))
        );
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const iconOptions = [
    'FileText',
    'Upload',
    'FileCheck',
    'ClipboardCheck',
    'CheckCircle',
    'Shield',
    'Flag',
    'Cloud',
    'UserCheck',
    'Send',
    'TrendingUp',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-petrol-600" />
      </div>
    );
  }

  const renderForm = () => (
    <div className="bg-white rounded-xl border border-petrol-200 p-6 space-y-4">
      <h3 className="font-semibold text-dark-blue-900">
        {editingId ? 'Bearbeiten' : 'Neuer Eintrag'}
      </h3>

      {activeTab === 'pricing' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-anthracite-700 mb-1">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
                placeholder="z.B. Professional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-anthracite-700 mb-1">Preis *</label>
              <input
                type="text"
                value={formData.price_text}
                onChange={(e) => setFormData({ ...formData, price_text: e.target.value })}
                className="w-full px-3 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
                placeholder="z.B. 29 €/Monat"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-anthracite-700 mb-1">Untertitel</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
              placeholder="z.B. Für regelmäßige Selbstständige"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-anthracite-700 mb-1">Features (eine pro Zeile)</label>
            <textarea
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
              placeholder="Unbegrenzte Belege&#10;Prioritäts-Support&#10;..."
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded border-anthracite-300"
              />
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm">Hervorgehoben</span>
            </label>
          </div>
        </>
      )}

      {activeTab !== 'pricing' && (
        <>
          <div>
            <label className="block text-sm font-medium text-anthracite-700 mb-1">Titel *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-anthracite-700 mb-1">Beschreibung</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-anthracite-700 mb-1">Icon</label>
            <select
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-3 py-2 border border-anthracite-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-petrol-500"
            >
              {iconOptions.map((icon) => (
                <option key={icon} value={icon}>
                  {icon}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="contentActive"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="rounded border-anthracite-300"
        />
        <label htmlFor="contentActive" className="text-sm text-anthracite-700">
          Aktiv (auf Website sichtbar)
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            setEditingId(null);
            setShowNewForm(false);
            resetForm();
          }}
          className="px-4 py-2 bg-anthracite-100 text-anthracite-600 rounded-lg hover:bg-anthracite-200"
        >
          Abbrechen
        </button>
        <button
          onClick={saveItem}
          disabled={saving}
          className="px-4 py-2 bg-petrol-600 text-white rounded-lg hover:bg-petrol-700 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Speichern'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-blue-900">Inhaltsverwaltung</h1>
          <p className="text-anthracite-600">Verwalten Sie Website-Inhalte</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => {
            setActiveTab('process');
            setEditingId(null);
            setShowNewForm(false);
            resetForm();
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'process'
              ? 'bg-petrol-600 text-white'
              : 'bg-white border border-anthracite-200 text-anthracite-600 hover:bg-anthracite-50'
          }`}
        >
          Prozess-Schritte ({processSteps.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('trust');
            setEditingId(null);
            setShowNewForm(false);
            resetForm();
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'trust'
              ? 'bg-petrol-600 text-white'
              : 'bg-white border border-anthracite-200 text-anthracite-600 hover:bg-anthracite-50'
          }`}
        >
          Vertrauens-Elemente ({trustItems.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('pricing');
            setEditingId(null);
            setShowNewForm(false);
            resetForm();
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'pricing'
              ? 'bg-petrol-600 text-white'
              : 'bg-white border border-anthracite-200 text-anthracite-600 hover:bg-anthracite-50'
          }`}
        >
          Preispläne ({pricingPlans.length})
        </button>
      </div>

      {/* Add button */}
      <button
        onClick={() => {
          setShowNewForm(true);
          setEditingId(null);
          resetForm();
        }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-petrol-600 text-white rounded-lg hover:bg-petrol-700 transition-colors"
      >
        <Plus className="w-5 h-5" />
        Neu {activeTab === 'process' ? 'Schritt' : activeTab === 'trust' ? 'Element' : 'Plan'}
      </button>

      {/* Form */}
      {(showNewForm || editingId) && renderForm()}

      {/* List */}
      <div className="bg-white rounded-xl border border-anthracite-200 overflow-hidden">
        {activeTab === 'process' && processSteps.length === 0 && (
          <p className="p-8 text-center text-anthracite-500">Keine Prozess-Schritte vorhanden</p>
        )}
        {activeTab === 'trust' && trustItems.length === 0 && (
          <p className="p-8 text-center text-anthracite-500">Keine Vertrauens-Elemente vorhanden</p>
        )}
        {activeTab === 'pricing' && pricingPlans.length === 0 && (
          <p className="p-8 text-center text-anthracite-500">Keine Preispläne vorhanden</p>
        )}

        {activeTab === 'pricing' && pricingPlans.length > 0 && (
          <div className="divide-y divide-anthracite-100">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`p-4 flex items-center justify-between ${
                  !plan.is_active ? 'opacity-60' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-dark-blue-900">{plan.name}</span>
                    {plan.is_featured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                    {!plan.is_active && (
                      <span className="text-xs bg-anthracite-200 text-anthracite-600 px-2 py-0.5 rounded">
                        Inaktiv
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-anthracite-600">{plan.price_text}</p>
                  {plan.features.length > 0 && (
                    <p className="text-xs text-anthracite-400 mt-1">{plan.features.length} Features</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(plan)}
                    className={`p-2 rounded-lg ${
                      plan.is_active
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-anthracite-400 hover:bg-anthracite-50'
                    }`}
                  >
                    {plan.is_active ? '●' : '○'}
                  </button>
                  <button
                    onClick={() => startEditing(plan)}
                    className="p-2 hover:bg-petrol-50 rounded-lg text-anthracite-400 hover:text-petrol-600"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteItem(plan.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-anthracite-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(activeTab === 'process' || activeTab === 'trust') && (
          <div className="divide-y divide-anthracite-100">
            {(activeTab === 'process' ? processSteps : trustItems).map((item) => (
              <div
                key={item.id}
                className={`p-4 flex items-center justify-between ${
                  !item.is_active ? 'opacity-60' : ''
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-dark-blue-900">{item.title}</span>
                    {!item.is_active && (
                      <span className="text-xs bg-anthracite-200 text-anthracite-600 px-2 py-0.5 rounded">
                        Inaktiv
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-anthracite-600 line-clamp-2">{item.description}</p>
                  )}
                  <p className="text-xs text-anthracite-400 mt-1">Icon: {item.icon}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleActive(item)}
                    className={`p-2 rounded-lg ${
                      item.is_active
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-anthracite-400 hover:bg-anthracite-50'
                    }`}
                  >
                    {item.is_active ? '●' : '○'}
                  </button>
                  <button
                    onClick={() => startEditing(item)}
                    className="p-2 hover:bg-petrol-50 rounded-lg text-anthracite-400 hover:text-petrol-600"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="p-2 hover:bg-red-50 rounded-lg text-anthracite-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
