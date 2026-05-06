import { useState, useEffect, useRef } from 'react';

// ─── Data ───────────────────────────────────────────────────────────────────

const ALERT_SYMPTOMS = [
  { emoji: '🚨', symptom: 'Dificultad para respirar', urgency: 'URGENTE' },
  { emoji: '🚨', symptom: 'Convulsiones o temblores', urgency: 'URGENTE' },
  { emoji: '🚨', symptom: 'Pérdida del conocimiento', urgency: 'URGENTE' },
  { emoji: '🚨', symptom: 'Sangrado abundante', urgency: 'URGENTE' },
  { emoji: '🚨', symptom: 'Abdomen muy inflamado', urgency: 'URGENTE' },
  { emoji: '⚠️', symptom: 'Vómitos repetidos (+3 veces)', urgency: 'PRONTO' },
  { emoji: '⚠️', symptom: 'Diarrea con sangre', urgency: 'PRONTO' },
  { emoji: '⚠️', symptom: 'No come ni bebe (más de 24h)', urgency: 'PRONTO' },
  { emoji: '⚠️', symptom: 'Fiebre alta (>39.5°C)', urgency: 'PRONTO' },
  { emoji: '⚠️', symptom: 'Cojera severa', urgency: 'PRONTO' },
  { emoji: '⚠️', symptom: 'Ojos muy rojos o con secreción', urgency: 'PRONTO' },
  {
    emoji: '📋',
    symptom: 'Tos persistente (más de 2 días)',
    urgency: 'CONSULTAR',
  },
  { emoji: '📋', symptom: 'Pérdida de peso notable', urgency: 'CONSULTAR' },
  { emoji: '📋', symptom: 'Cambio en el comportamiento', urgency: 'CONSULTAR' },
  { emoji: '📋', symptom: 'Rascado excesivo', urgency: 'CONSULTAR' },
];

const DEFAULT_VACCINES = [
  'Distemper (Moquillo)',
  'Parvovirus',
  'Hepatitis',
  'Leptospirosis',
  'Rabia',
  'Bordetella',
  'Influenza canina',
];

const AGE_CARE: Record<string, string[]> = {
  cachorro: [
    'Aplicar vacunas iniciales (serie de 3 dosis a las 6, 8 y 12 semanas)',
    'Desparasitación cada 2 semanas hasta los 3 meses',
    'Socialización temprana con personas y otros animales',
    'Alimentación con croquetas para cachorro 3-4 veces al día',
    'Evitar salidas hasta completar el esquema de vacunación',
  ],
  adulto: [
    'Revisión veterinaria anual',
    'Vacunas de refuerzo anuales',
    'Desparasitación cada 3-6 meses',
    'Alimentación balanceada 2 veces al día',
    'Ejercicio diario según la raza',
    'Limpieza dental periódica',
  ],
  senior: [
    'Revisión veterinaria cada 6 meses',
    'Análisis de sangre anuales',
    'Dieta especial para perros mayores',
    'Ejercicio suave y moderado',
    'Vigilar articulaciones y movilidad',
    'Atención especial a cambios de comportamiento',
  ],
};

const BREED_CARE: Record<string, string[]> = {
  labrador: [
    'Propenso a la obesidad, controla su dieta',
    'Ejercicio diario intenso',
    'Revisar oídos semanalmente',
  ],
  chihuahua: [
    'Sensible al frío, abrigarlo en invierno',
    'Cuidado dental frecuente',
    'Evitar caídas por su tamaño',
  ],
  bulldog: [
    'Limpiar pliegues de la piel diariamente',
    'Evitar ejercicio intenso por problemas respiratorios',
    'Mantener fresco en climas calurosos',
  ],
  golden: [
    'Cepillado frecuente del pelaje',
    'Propenso a displasia de cadera',
    'Ejercicio diario y socialización',
  ],
  pastor: [
    'Alta necesidad de ejercicio y estimulación mental',
    'Cepillado frecuente',
    'Entrenamiento desde cachorro',
  ],
  poodle: [
    'Corte de pelo cada 6-8 semanas',
    'Revisión de oídos frecuente',
    'Muy inteligente, necesita estimulación',
  ],
  dachshund: [
    'Evitar que salte o suba escaleras para proteger la columna',
    'Controlar el peso',
    'Revisar oídos',
  ],
  boxer: [
    'Sensible al calor',
    'Ejercicio moderado',
    'Revisiones cardíacas periódicas',
  ],
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const getAgeCategory = (age: string) => {
  const n = parseFloat(age);
  if (isNaN(n)) return null;
  if (n < 1) return 'cachorro';
  if (n < 7) return 'adulto';
  return 'senior';
};

const getBreedCare = (breed: string) => {
  const b = breed.toLowerCase();
  for (const key of Object.keys(BREED_CARE)) {
    if (b.includes(key)) return BREED_CARE[key];
  }
  return [];
};

const DOG_EMOJIS = ['🐕', '🐶', '🦮', '🐩', '🐕‍🦺'];
const getEmoji = (id: number) => DOG_EMOJIS[id % DOG_EMOJIS.length];
const severityColor = (s: string) =>
  s === 'grave' ? '#ef4444' : s === 'moderado' ? '#f97316' : '#22c55e';
const severityLabel = (s: string) =>
  s === 'grave' ? 'Grave' : s === 'moderado' ? 'Moderado' : 'Leve';
const urgencyStyle = (u: string) => {
  if (u === 'URGENTE')
    return { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c' };
  if (u === 'PRONTO')
    return { bg: '#fff7ed', border: '#f97316', text: '#c2410c' };
  return { bg: '#f0fdf4', border: '#22c55e', text: '#15803d' };
};

const today = () => new Date().toISOString().split('T')[0];

// ─── Styles ─────────────────────────────────────────────────────────────────

const S: any = {
  app: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg,#fef9f0,#fff5e6,#fef0e0)',
    fontFamily: 'Georgia,serif',
    color: '#2d1a0e',
  },
  header: {
    background: 'linear-gradient(90deg,#8b4513,#a0522d,#cd853f)',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 4px 20px rgba(139,69,19,.3)',
  },
  title: { color: '#fff8f0', fontSize: '20px', fontWeight: 'bold', margin: 0 },
  sub: { color: '#f4d5a6', fontSize: '11px', margin: '2px 0 0' },
  backBtn: {
    background: 'rgba(255,255,255,.15)',
    border: '1px solid rgba(255,255,255,.3)',
    color: '#fff',
    borderRadius: '8px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  content: { padding: '16px', maxWidth: '480px', margin: '0 auto' },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 2px 12px rgba(139,69,19,.1)',
    border: '1px solid #f5e6d3',
  },
  btn: {
    background: 'linear-gradient(135deg,#8b4513,#a0522d)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '11px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '8px',
  },
  btnOutline: {
    background: 'transparent',
    color: '#8b4513',
    border: '2px solid #8b4513',
    borderRadius: '10px',
    padding: '9px 20px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    width: '100%',
    marginTop: '8px',
  },
  btnDanger: {
    background: 'transparent',
    color: '#ef4444',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    padding: '5px 10px',
    cursor: 'pointer',
    fontSize: '11px',
  },
  btnGreen: {
    background: 'linear-gradient(135deg,#16a34a,#15803d)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '7px 14px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #e8d5bf',
    borderRadius: '8px',
    fontSize: '14px',
    marginBottom: '10px',
    background: '#fffaf5',
    color: '#2d1a0e',
    boxSizing: 'border-box' as any,
  },
  label: {
    fontSize: '12px',
    color: '#8b4513',
    fontWeight: 'bold',
    marginBottom: '4px',
    display: 'block',
  },
  tab: (active: boolean) => ({
    flex: 1,
    padding: '8px 2px',
    border: 'none',
    background: active ? '#8b4513' : 'transparent',
    color: active ? '#fff' : '#8b4513',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: 'bold',
  }),
};

// ─── Initial forms ───────────────────────────────────────────────────────────

const initPet = {
  name: '',
  breed: '',
  age: '',
  weight: '',
  color: '',
  notes: '',
  photo: '',
};
const initSymptom = {
  date: today(),
  description: '',
  severity: 'leve',
  treatment: '',
};
const initVaccine = {
  name: '',
  customName: '',
  date: today(),
  nextDate: '',
  vet: '',
  notes: '',
};
const initSurgery = { name: '', date: today(), vet: '', notes: '' };
const initBath = { date: today(), product: '', notes: '' };
const initTrick = { name: '' };
const initVet = { name: '', phone: '', address: '', mapUrl: '' };

// ─── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [pets, setPets] = useState<any[]>([]);
  const [vaccines, setVaccines] = useState<string[]>(DEFAULT_VACCINES);
  const [vet, setVet] = useState<any>(null);
  const [vetForm, setVetForm] = useState(initVet);
  const [editingVet, setEditingVet] = useState(false);

  const [view, setView] = useState('home');
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [detailTab, setDetailTab] = useState('symptoms');

  const [petForm, setPetForm] = useState(initPet);
  const [symptomForm, setSymptomForm] = useState(initSymptom);
  const [vaccineForm, setVaccineForm] = useState(initVaccine);
  const [surgeryForm, setSurgeryForm] = useState(initSurgery);
  const [bathForm, setBathForm] = useState(initBath);
  const [trickForm, setTrickForm] = useState(initTrick);

  const [showSymptomForm, setShowSymptomForm] = useState(false);
  const [showVaccineForm, setShowVaccineForm] = useState(false);
  const [showSurgeryForm, setShowSurgeryForm] = useState(false);
  const [showBathForm, setShowBathForm] = useState(false);
  const [showTrickForm, setShowTrickForm] = useState(false);
  const [editingPet, setEditingPet] = useState(false);

  const photoRef = useRef<HTMLInputElement>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const p = localStorage.getItem('mp_pets');
      if (p) setPets(JSON.parse(p));
      const v = localStorage.getItem('mp_vaccines');
      if (v) setVaccines(JSON.parse(v));
      const vt = localStorage.getItem('mp_vet');
      if (vt) setVet(JSON.parse(vt));
    } catch {}
  }, []);

  const savePets = (u: any[]) => {
    setPets(u);
    try {
      localStorage.setItem('mp_pets', JSON.stringify(u));
    } catch {}
  };
  const saveVaccines = (u: string[]) => {
    setVaccines(u);
    try {
      localStorage.setItem('mp_vaccines', JSON.stringify(u));
    } catch {}
  };
  const saveVet = (u: any) => {
    setVet(u);
    try {
      localStorage.setItem('mp_vet', JSON.stringify(u));
    } catch {}
  };

  // Photo upload
  const handlePhotoChange = (e: any, setter: any, form: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setter({ ...form, photo: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  // Pet CRUD
  const addPet = () => {
    if (!petForm.name.trim()) return;
    const np = {
      id: Date.now(),
      ...petForm,
      symptoms: [],
      vaccines: [],
      surgeries: [],
      baths: [],
      tricks: [],
      createdAt: new Date().toISOString(),
    };
    savePets([...pets, np]);
    setPetForm(initPet);
    setView('home');
  };

  const updatePet = () => {
    const u = pets.map((p: any) =>
      p.id === selectedPet.id ? { ...p, ...petForm } : p
    );
    savePets(u);
    setSelectedPet({ ...selectedPet, ...petForm });
    setEditingPet(false);
  };

  const deletePet = (id: number) => {
    savePets(pets.filter((p: any) => p.id !== id));
    setView('home');
  };
  const openPet = (pet: any) => {
    setSelectedPet(pet);
    setDetailTab('symptoms');
    setView('petDetail');
    setEditingPet(false);
  };

  // Helpers for pet sub-records
  const addRecord = (field: string, record: any) => {
    const nr = { id: Date.now(), ...record };
    const u = pets.map((p: any) =>
      p.id === selectedPet.id ? { ...p, [field]: [nr, ...(p[field] || [])] } : p
    );
    savePets(u);
    setSelectedPet({
      ...selectedPet,
      [field]: [nr, ...(selectedPet[field] || [])],
    });
  };
  const delRecord = (field: string, id: number) => {
    const u = pets.map((p: any) =>
      p.id === selectedPet.id
        ? { ...p, [field]: p[field].filter((x: any) => x.id !== id) }
        : p
    );
    savePets(u);
    setSelectedPet({
      ...selectedPet,
      [field]: selectedPet[field].filter((x: any) => x.id !== id),
    });
  };

  // Vaccine: add custom
  const handleAddVaccine = () => {
    let name = vaccineForm.name;
    if (name === 'Otra' && vaccineForm.customName.trim()) {
      name = vaccineForm.customName.trim();
      if (!vaccines.includes(name)) saveVaccines([...vaccines, name]);
    }
    if (!name || name === 'Otra') return;
    addRecord('vaccines', { ...vaccineForm, name });
    setVaccineForm(initVaccine);
    setShowVaccineForm(false);
  };

  // ── VIEWS ──────────────────────────────────────────────────────────────────

  // HOME
  if (view === 'home')
    return (
      <div style={S.app}>
        <div style={S.header}>
          <div>
            <p style={S.title}>🐾 Proyecto Mascotas</p>
            <p style={S.sub}>Cuida a tus perritos con amor</p>
          </div>
          <span style={{ fontSize: '30px' }}>🏠</span>
        </div>
        <div style={S.content}>
          {/* Vet card */}
          <div
            style={{
              ...S.card,
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <p
                style={{
                  fontWeight: 'bold',
                  color: '#15803d',
                  margin: 0,
                  fontSize: '14px',
                }}
              >
                🏥 Veterinaria
              </p>
              <button
                style={{ ...S.btnGreen, padding: '5px 10px', fontSize: '11px' }}
                onClick={() => {
                  setVetForm(vet || initVet);
                  setEditingVet(true);
                  setView('vetEdit');
                }}
              >
                {vet ? '✏️ Editar' : '+ Agregar'}
              </button>
            </div>
            {vet ? (
              <div style={{ marginTop: '8px' }}>
                <p
                  style={{
                    margin: '0 0 3px',
                    fontWeight: 'bold',
                    fontSize: '15px',
                  }}
                >
                  {vet.name}
                </p>
                {vet.address && (
                  <p
                    style={{
                      margin: '0 0 3px',
                      fontSize: '12px',
                      color: '#166534',
                    }}
                  >
                    📍 {vet.address}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  {vet.phone && (
                    <a
                      href={`tel:${vet.phone}`}
                      style={{
                        ...S.btnGreen,
                        textDecoration: 'none',
                        fontSize: '12px',
                        padding: '6px 12px',
                      }}
                    >
                      📞 Llamar
                    </a>
                  )}
                  {vet.mapUrl && (
                    <a
                      href={vet.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#2563eb',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      🗺️ Maps
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p
                style={{
                  margin: '6px 0 0',
                  fontSize: '12px',
                  color: '#166534',
                }}
              >
                Agrega el contacto de tu veterinaria
              </p>
            )}
          </div>

          {/* Pets list */}
          {pets.length === 0 ? (
            <div
              style={{ ...S.card, textAlign: 'center', padding: '40px 20px' }}
            >
              <div style={{ fontSize: '60px', marginBottom: '12px' }}>🐶</div>
              <p
                style={{
                  color: '#8b4513',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                ¡Aún no tienes perritos!
              </p>
              <p style={{ color: '#bfa58a', fontSize: '13px' }}>
                Agrega a tus mascotas para comenzar
              </p>
            </div>
          ) : (
            pets.map((pet: any) => (
              <div
                key={pet.id}
                style={{
                  ...S.card,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
                onClick={() => openPet(pet)}
              >
                {pet.photo ? (
                  <img
                    src={pet.photo}
                    alt={pet.name}
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #cd853f',
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '42px', lineHeight: 1 }}>
                    {getEmoji(pet.id)}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontWeight: 'bold',
                      fontSize: '17px',
                      margin: '0 0 3px',
                    }}
                  >
                    {pet.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#8b7355' }}>
                    {pet.breed || 'Raza no especificada'}{' '}
                    {pet.age ? `· ${pet.age} años` : ''}{' '}
                    {pet.weight ? `· ${pet.weight} kg` : ''}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      gap: '6px',
                      marginTop: '6px',
                      flexWrap: 'wrap' as any,
                    }}
                  >
                    <span
                      style={{
                        background: '#fef3e2',
                        color: '#a0522d',
                        borderRadius: '20px',
                        padding: '2px 8px',
                        fontSize: '10px',
                      }}
                    >
                      💉 {pet.vaccines?.length || 0}
                    </span>
                    <span
                      style={{
                        background: '#fef2f2',
                        color: '#b91c1c',
                        borderRadius: '20px',
                        padding: '2px 8px',
                        fontSize: '10px',
                      }}
                    >
                      🤒 {pet.symptoms?.length || 0}
                    </span>
                    <span
                      style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        borderRadius: '20px',
                        padding: '2px 8px',
                        fontSize: '10px',
                      }}
                    >
                      🛁 {pet.baths?.length || 0}
                    </span>
                    <span
                      style={{
                        background: '#fdf4ff',
                        color: '#7e22ce',
                        borderRadius: '20px',
                        padding: '2px 8px',
                        fontSize: '10px',
                      }}
                    >
                      🎪 {pet.tricks?.length || 0}
                    </span>
                  </div>
                </div>
                <span style={{ color: '#cd853f', fontSize: '18px' }}>›</span>
              </div>
            ))
          )}
          <button
            style={S.btn}
            onClick={() => {
              setPetForm(initPet);
              setView('addPet');
            }}
          >
            + Agregar Perrito
          </button>
          <button style={S.btnOutline} onClick={() => setView('guide')}>
            🚨 Guía de Síntomas de Alerta
          </button>
          <div style={{ height: '20px' }} />
        </div>
      </div>
    );

  // VET EDIT
  if (view === 'vetEdit')
    return (
      <div style={S.app}>
        <div style={S.header}>
          <div>
            <p style={S.title}>🏥 Veterinaria</p>
            <p style={S.sub}>Datos de contacto</p>
          </div>
          <button style={S.backBtn} onClick={() => setView('home')}>
            ← Volver
          </button>
        </div>
        <div style={S.content}>
          <div style={S.card}>
            <label style={S.label}>Nombre de la clínica / veterinario *</label>
            <input
              style={S.input}
              placeholder="Ej. Clínica Veterinaria San Roque"
              value={vetForm.name}
              onChange={(e) => setVetForm({ ...vetForm, name: e.target.value })}
            />
            <label style={S.label}>Teléfono de emergencias</label>
            <input
              style={S.input}
              placeholder="Ej. 834-123-4567"
              type="tel"
              value={vetForm.phone}
              onChange={(e) =>
                setVetForm({ ...vetForm, phone: e.target.value })
              }
            />
            <label style={S.label}>Dirección</label>
            <input
              style={S.input}
              placeholder="Calle, colonia, ciudad"
              value={vetForm.address}
              onChange={(e) =>
                setVetForm({ ...vetForm, address: e.target.value })
              }
            />
            <label style={S.label}>Link de Google Maps</label>
            <input
              style={S.input}
              placeholder="Pega el enlace de Google Maps"
              value={vetForm.mapUrl}
              onChange={(e) =>
                setVetForm({ ...vetForm, mapUrl: e.target.value })
              }
            />
            <button
              style={S.btn}
              onClick={() => {
                saveVet(vetForm);
                setView('home');
              }}
            >
              Guardar Veterinaria
            </button>
            {vet && (
              <button
                style={{
                  ...S.btnDanger,
                  width: '100%',
                  marginTop: '8px',
                  padding: '10px',
                }}
                onClick={() => {
                  saveVet(null);
                  setView('home');
                }}
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    );

  // ADD PET
  if (view === 'addPet')
    return (
      <div style={S.app}>
        <div style={S.header}>
          <div>
            <p style={S.title}>🐾 Nuevo Perrito</p>
            <p style={S.sub}>Registra a tu mascota</p>
          </div>
          <button style={S.backBtn} onClick={() => setView('home')}>
            ← Volver
          </button>
        </div>
        <div style={S.content}>
          <div style={S.card}>
            {/* Photo */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              {petForm.photo ? (
                <img
                  src={petForm.photo}
                  alt="foto"
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #cd853f',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '90px',
                    height: '90px',
                    borderRadius: '50%',
                    background: '#fef3e2',
                    border: '3px dashed #cd853f',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    margin: '0 auto',
                  }}
                >
                  🐶
                </div>
              )}
              <button
                style={{
                  ...S.btnOutline,
                  width: 'auto',
                  marginTop: '8px',
                  padding: '6px 16px',
                  fontSize: '12px',
                }}
                onClick={() => photoRef.current?.click()}
              >
                📸 Subir foto
              </button>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handlePhotoChange(e, setPetForm, petForm)}
              />
            </div>
            {[
              { f: 'name', l: 'Nombre *', p: 'Ej. Rocky, Luna...' },
              { f: 'breed', l: 'Raza', p: 'Ej. Labrador, Chihuahua...' },
              { f: 'age', l: 'Edad (años)', p: 'Ej. 3' },
              { f: 'weight', l: 'Peso (kg)', p: 'Ej. 12.5' },
              {
                f: 'color',
                l: 'Color / Características',
                p: 'Ej. Café con manchas blancas',
              },
            ].map(({ f, l, p }) => (
              <div key={f}>
                <label style={S.label}>{l}</label>
                <input
                  style={S.input}
                  placeholder={p}
                  value={(petForm as any)[f]}
                  onChange={(e) =>
                    setPetForm({ ...petForm, [f]: e.target.value })
                  }
                />
              </div>
            ))}
            <label style={S.label}>Notas adicionales</label>
            <textarea
              style={{
                ...S.input,
                minHeight: '70px',
                resize: 'vertical' as any,
              }}
              placeholder="Alergias, condiciones especiales..."
              value={petForm.notes}
              onChange={(e) =>
                setPetForm({ ...petForm, notes: e.target.value })
              }
            />
            <button style={S.btn} onClick={addPet}>
              Guardar Perrito 🐾
            </button>
          </div>
        </div>
      </div>
    );

  // GUIDE
  if (view === 'guide')
    return (
      <div style={S.app}>
        <div style={S.header}>
          <div>
            <p style={S.title}>🚨 Guía de Síntomas</p>
            <p style={S.sub}>Cuándo ir al veterinario</p>
          </div>
          <button style={S.backBtn} onClick={() => setView('home')}>
            ← Volver
          </button>
        </div>
        <div style={S.content}>
          {['URGENTE', 'PRONTO', 'CONSULTAR'].map((level) => {
            const st = urgencyStyle(level);
            const titles: any = {
              URGENTE: '🚨 Emergencia Inmediata',
              PRONTO: '⚠️ Pronto (menos de 24h)',
              CONSULTAR: '📋 Consulta Programada',
            };
            return (
              <div key={level}>
                <p
                  style={{
                    fontWeight: 'bold',
                    color: st.text,
                    fontSize: '14px',
                    margin: '14px 0 8px',
                  }}
                >
                  {titles[level]}
                </p>
                {ALERT_SYMPTOMS.filter((x) => x.urgency === level).map(
                  (x, i) => (
                    <div
                      key={i}
                      style={{
                        ...S.card,
                        background: st.bg,
                        border: `1.5px solid ${st.border}`,
                        padding: '10px 14px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <span style={{ fontSize: '20px' }}>{x.emoji}</span>
                      <span style={{ color: st.text, fontSize: '13px' }}>
                        {x.symptom}
                      </span>
                    </div>
                  )
                )}
              </div>
            );
          })}
          <div style={{ height: '20px' }} />
        </div>
      </div>
    );

  // PET DETAIL
  if (view === 'petDetail' && selectedPet) {
    const pet = pets.find((p: any) => p.id === selectedPet.id) || selectedPet;
    const ageCat = getAgeCategory(pet.age);
    const ageTips = ageCat ? AGE_CARE[ageCat] : [];
    const breedTips = getBreedCare(pet.breed || '');

    const tabs = [
      { k: 'symptoms', l: '🤒' },
      { k: 'vaccines', l: '💉' },
      { k: 'surgeries', l: '🔬' },
      { k: 'baths', l: '🛁' },
      { k: 'tricks', l: '🎪' },
      { k: 'care', l: '🏥' },
      { k: 'history', l: '📋' },
    ];

    return (
      <div style={S.app}>
        <div style={S.header}>
          <div>
            <p style={S.title}>
              {pet.photo ? '' : getEmoji(pet.id)} {pet.name}
            </p>
            <p style={S.sub}>{pet.breed || 'Sin raza'}</p>
          </div>
          <button style={S.backBtn} onClick={() => setView('home')}>
            ← Volver
          </button>
        </div>
        <div style={S.content}>
          {/* Pet card */}
          {editingPet ? (
            <div style={S.card}>
              <p
                style={{
                  fontWeight: 'bold',
                  color: '#8b4513',
                  marginBottom: '10px',
                }}
              >
                ✏️ Editar perrito
              </p>
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                {petForm.photo ? (
                  <img
                    src={petForm.photo}
                    alt="foto"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #cd853f',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: '#fef3e2',
                      border: '3px dashed #cd853f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      margin: '0 auto',
                    }}
                  >
                    🐶
                  </div>
                )}
                <button
                  style={{
                    ...S.btnOutline,
                    width: 'auto',
                    marginTop: '8px',
                    padding: '6px 14px',
                    fontSize: '12px',
                  }}
                  onClick={() => photoRef.current?.click()}
                >
                  📸 Cambiar foto
                </button>
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handlePhotoChange(e, setPetForm, petForm)}
                />
              </div>
              {[
                { f: 'name', l: 'Nombre' },
                { f: 'breed', l: 'Raza' },
                { f: 'age', l: 'Edad' },
                { f: 'weight', l: 'Peso (kg)' },
                { f: 'color', l: 'Color' },
              ].map(({ f, l }) => (
                <div key={f}>
                  <label style={S.label}>{l}</label>
                  <input
                    style={S.input}
                    value={(petForm as any)[f]}
                    onChange={(e) =>
                      setPetForm({ ...petForm, [f]: e.target.value })
                    }
                  />
                </div>
              ))}
              <label style={S.label}>Notas</label>
              <textarea
                style={{
                  ...S.input,
                  minHeight: '60px',
                  resize: 'vertical' as any,
                }}
                value={petForm.notes}
                onChange={(e) =>
                  setPetForm({ ...petForm, notes: e.target.value })
                }
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ ...S.btn, marginTop: 0 }} onClick={updatePet}>
                  Guardar
                </button>
                <button
                  style={{ ...S.btnOutline, marginTop: 0 }}
                  onClick={() => setEditingPet(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div style={S.card}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
                >
                  {pet.photo ? (
                    <img
                      src={pet.photo}
                      alt={pet.name}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #cd853f',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '48px' }}>{getEmoji(pet.id)}</span>
                  )}
                  <div>
                    <p
                      style={{
                        fontWeight: 'bold',
                        fontSize: '20px',
                        margin: '0 0 3px',
                      }}
                    >
                      {pet.name}
                    </p>
                    <p
                      style={{ margin: 0, color: '#8b7355', fontSize: '13px' }}
                    >
                      {pet.breed || '—'}
                    </p>
                    <p
                      style={{
                        margin: '3px 0 0',
                        color: '#8b7355',
                        fontSize: '12px',
                      }}
                    >
                      {pet.age ? `${pet.age} años` : ''}{' '}
                      {pet.weight ? `· ${pet.weight} kg` : ''}
                    </p>
                    {ageCat && (
                      <span
                        style={{
                          background: '#fef3e2',
                          color: '#a0522d',
                          borderRadius: '20px',
                          padding: '2px 10px',
                          fontSize: '10px',
                          marginTop: '4px',
                          display: 'inline-block',
                        }}
                      >
                        {ageCat === 'cachorro'
                          ? '🐣 Cachorro'
                          : ageCat === 'adulto'
                          ? '🐕 Adulto'
                          : '🦴 Senior'}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    style={{
                      background: '#f5e6d0',
                      color: '#8b4513',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '7px 10px',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setPetForm({
                        name: pet.name,
                        breed: pet.breed || '',
                        age: pet.age || '',
                        weight: pet.weight || '',
                        color: pet.color || '',
                        notes: pet.notes || '',
                        photo: pet.photo || '',
                      });
                      setEditingPet(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button style={S.btnDanger} onClick={() => deletePet(pet.id)}>
                    🗑️
                  </button>
                </div>
              </div>
              {pet.notes && (
                <p
                  style={{
                    marginTop: '10px',
                    color: '#6b4c2a',
                    fontSize: '12px',
                    background: '#fef9f0',
                    padding: '8px 12px',
                    borderRadius: '8px',
                  }}
                >
                  📝 {pet.notes}
                </p>
              )}
            </div>
          )}

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '3px',
              background: '#fef0e0',
              borderRadius: '10px',
              padding: '4px',
              marginBottom: '14px',
              overflowX: 'auto' as any,
            }}
          >
            {tabs.map((t) => (
              <button
                key={t.k}
                style={S.tab(detailTab === t.k)}
                onClick={() => setDetailTab(t.k)}
              >
                {t.l}
              </button>
            ))}
          </div>

          {/* SYMPTOMS */}
          {detailTab === 'symptoms' && (
            <>
              <button
                style={S.btn}
                onClick={() => setShowSymptomForm(!showSymptomForm)}
              >
                {showSymptomForm ? '✕ Cancelar' : '+ Registrar Síntoma'}
              </button>
              {showSymptomForm && (
                <div style={S.card}>
                  <p
                    style={{
                      fontWeight: 'bold',
                      color: '#8b4513',
                      marginBottom: '10px',
                    }}
                  >
                    🤒 Nuevo Síntoma
                  </p>
                  <label style={S.label}>Fecha</label>
                  <input
                    type="date"
                    style={S.input}
                    value={symptomForm.date}
                    onChange={(e) =>
                      setSymptomForm({ ...symptomForm, date: e.target.value })
                    }
                  />
                  <label style={S.label}>Descripción *</label>
                  <textarea
                    style={{
                      ...S.input,
                      minHeight: '70px',
                      resize: 'vertical' as any,
                    }}
                    placeholder="Describe qué observaste..."
                    value={symptomForm.description}
                    onChange={(e) =>
                      setSymptomForm({
                        ...symptomForm,
                        description: e.target.value,
                      })
                    }
                  />
                  <label style={S.label}>Severidad</label>
                  <select
                    style={S.input}
                    value={symptomForm.severity}
                    onChange={(e) =>
                      setSymptomForm({
                        ...symptomForm,
                        severity: e.target.value,
                      })
                    }
                  >
                    <option value="leve">🟢 Leve</option>
                    <option value="moderado">🟠 Moderado</option>
                    <option value="grave">🔴 Grave</option>
                  </select>
                  <label style={S.label}>Tratamiento dado</label>
                  <input
                    style={S.input}
                    placeholder="Ej. Antidiarreico, reposo..."
                    value={symptomForm.treatment}
                    onChange={(e) =>
                      setSymptomForm({
                        ...symptomForm,
                        treatment: e.target.value,
                      })
                    }
                  />
                  <button
                    style={S.btn}
                    onClick={() => {
                      if (!symptomForm.description.trim()) return;
                      addRecord('symptoms', symptomForm);
                      setSymptomForm(initSymptom);
                      setShowSymptomForm(false);
                    }}
                  >
                    Guardar Síntoma
                  </button>
                </div>
              )}
              {!selectedPet.symptoms?.length && !showSymptomForm && (
                <div
                  style={{
                    ...S.card,
                    textAlign: 'center',
                    color: '#bfa58a',
                    padding: '30px',
                  }}
                >
                  <div style={{ fontSize: '40px' }}>🐾</div>
                  <p>Sin síntomas registrados</p>
                </div>
              )}
              {selectedPet.symptoms?.map((sym: any) => (
                <div
                  key={sym.id}
                  style={{
                    ...S.card,
                    borderLeft: `4px solid ${severityColor(sym.severity)}`,
                  }}
                >
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          alignItems: 'center',
                          marginBottom: '6px',
                        }}
                      >
                        <span
                          style={{
                            background: severityColor(sym.severity),
                            color: '#fff',
                            borderRadius: '20px',
                            padding: '2px 8px',
                            fontSize: '10px',
                          }}
                        >
                          {severityLabel(sym.severity)}
                        </span>
                        <span style={{ color: '#bfa58a', fontSize: '11px' }}>
                          📅 {sym.date}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 4px', fontSize: '14px' }}>
                        {sym.description}
                      </p>
                      {sym.treatment && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#8b7355',
                          }}
                        >
                          💊 {sym.treatment}
                        </p>
                      )}
                    </div>
                    <button
                      style={S.btnDanger}
                      onClick={() => delRecord('symptoms', sym.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* VACCINES */}
          {detailTab === 'vaccines' && (
            <>
              <button
                style={S.btn}
                onClick={() => setShowVaccineForm(!showVaccineForm)}
              >
                {showVaccineForm ? '✕ Cancelar' : '+ Agregar Vacuna'}
              </button>
              {showVaccineForm && (
                <div style={S.card}>
                  <p
                    style={{
                      fontWeight: 'bold',
                      color: '#8b4513',
                      marginBottom: '10px',
                    }}
                  >
                    💉 Nueva Vacuna
                  </p>
                  <label style={S.label}>Vacuna *</label>
                  <select
                    style={S.input}
                    value={vaccineForm.name}
                    onChange={(e) =>
                      setVaccineForm({ ...vaccineForm, name: e.target.value })
                    }
                  >
                    <option value="">Seleccionar...</option>
                    {vaccines.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                    <option value="Otra">+ Otra (personalizada)</option>
                  </select>
                  {vaccineForm.name === 'Otra' && (
                    <>
                      <label style={S.label}>Nombre de la vacuna</label>
                      <input
                        style={S.input}
                        placeholder="Escribe el nombre..."
                        value={vaccineForm.customName}
                        onChange={(e) =>
                          setVaccineForm({
                            ...vaccineForm,
                            customName: e.target.value,
                          })
                        }
                      />
                      <p
                        style={{
                          fontSize: '11px',
                          color: '#8b7355',
                          margin: '-6px 0 10px',
                        }}
                      >
                        Se guardará en tu lista para futuros registros ✨
                      </p>
                    </>
                  )}
                  <label style={S.label}>Fecha aplicación</label>
                  <input
                    type="date"
                    style={S.input}
                    value={vaccineForm.date}
                    onChange={(e) =>
                      setVaccineForm({ ...vaccineForm, date: e.target.value })
                    }
                  />
                  <label style={S.label}>Próxima dosis</label>
                  <input
                    type="date"
                    style={S.input}
                    value={vaccineForm.nextDate}
                    onChange={(e) =>
                      setVaccineForm({
                        ...vaccineForm,
                        nextDate: e.target.value,
                      })
                    }
                  />
                  <label style={S.label}>Veterinario</label>
                  <input
                    style={S.input}
                    placeholder="Nombre del veterinario"
                    value={vaccineForm.vet}
                    onChange={(e) =>
                      setVaccineForm({ ...vaccineForm, vet: e.target.value })
                    }
                  />
                  <label style={S.label}>Notas</label>
                  <input
                    style={S.input}
                    placeholder="Observaciones"
                    value={vaccineForm.notes}
                    onChange={(e) =>
                      setVaccineForm({ ...vaccineForm, notes: e.target.value })
                    }
                  />
                  <button style={S.btn} onClick={handleAddVaccine}>
                    Guardar Vacuna
                  </button>
                </div>
              )}
              {!selectedPet.vaccines?.length && !showVaccineForm && (
                <div
                  style={{
                    ...S.card,
                    textAlign: 'center',
                    color: '#bfa58a',
                    padding: '30px',
                  }}
                >
                  <div style={{ fontSize: '40px' }}>💉</div>
                  <p>Sin vacunas registradas</p>
                </div>
              )}
              {selectedPet.vaccines?.map((v: any) => (
                <div
                  key={v.id}
                  style={{ ...S.card, borderLeft: '4px solid #3b82f6' }}
                >
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontWeight: 'bold',
                          fontSize: '14px',
                          margin: '0 0 4px',
                        }}
                      >
                        💉 {v.name}
                      </p>
                      <p
                        style={{
                          margin: '0 0 2px',
                          fontSize: '12px',
                          color: '#8b7355',
                        }}
                      >
                        📅 {v.date}
                      </p>
                      {v.nextDate && (
                        <p
                          style={{
                            margin: '0 0 2px',
                            fontSize: '12px',
                            color: '#2563eb',
                          }}
                        >
                          🔄 Próxima: {v.nextDate}
                        </p>
                      )}
                      {v.vet && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#8b7355',
                          }}
                        >
                          👨‍⚕️ {v.vet}
                        </p>
                      )}
                    </div>
                    <button
                      style={S.btnDanger}
                      onClick={() => delRecord('vaccines', v.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* SURGERIES */}
          {detailTab === 'surgeries' && (
            <>
              <button
                style={S.btn}
                onClick={() => setShowSurgeryForm(!showSurgeryForm)}
              >
                {showSurgeryForm ? '✕ Cancelar' : '+ Agregar Cirugía'}
              </button>
              {showSurgeryForm && (
                <div style={S.card}>
                  <p
                    style={{
                      fontWeight: 'bold',
                      color: '#8b4513',
                      marginBottom: '10px',
                    }}
                  >
                    🔬 Nueva Cirugía
                  </p>
                  <label style={S.label}>Procedimiento *</label>
                  <input
                    style={S.input}
                    placeholder="Ej. Esterilización, extracción dental..."
                    value={surgeryForm.name}
                    onChange={(e) =>
                      setSurgeryForm({ ...surgeryForm, name: e.target.value })
                    }
                  />
                  <label style={S.label}>Fecha</label>
                  <input
                    type="date"
                    style={S.input}
                    value={surgeryForm.date}
                    onChange={(e) =>
                      setSurgeryForm({ ...surgeryForm, date: e.target.value })
                    }
                  />
                  <label style={S.label}>Veterinario / Clínica</label>
                  <input
                    style={S.input}
                    placeholder="Nombre"
                    value={surgeryForm.vet}
                    onChange={(e) =>
                      setSurgeryForm({ ...surgeryForm, vet: e.target.value })
                    }
                  />
                  <label style={S.label}>Notas post-operatorias</label>
                  <textarea
                    style={{
                      ...S.input,
                      minHeight: '60px',
                      resize: 'vertical' as any,
                    }}
                    placeholder="Cuidados, medicamentos..."
                    value={surgeryForm.notes}
                    onChange={(e) =>
                      setSurgeryForm({ ...surgeryForm, notes: e.target.value })
                    }
                  />
                  <button
                    style={S.btn}
                    onClick={() => {
                      if (!surgeryForm.name.trim()) return;
                      addRecord('surgeries', surgeryForm);
                      setSurgeryForm(initSurgery);
                      setShowSurgeryForm(false);
                    }}
                  >
                    Guardar
                  </button>
                </div>
              )}
              {!selectedPet.surgeries?.length && !showSurgeryForm && (
                <div
                  style={{
                    ...S.card,
                    textAlign: 'center',
                    color: '#bfa58a',
                    padding: '30px',
                  }}
                >
                  <div style={{ fontSize: '40px' }}>🔬</div>
                  <p>Sin cirugías registradas</p>
                </div>
              )}
              {selectedPet.surgeries?.map((sur: any) => (
                <div
                  key={sur.id}
                  style={{ ...S.card, borderLeft: '4px solid #8b5cf6' }}
                >
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontWeight: 'bold',
                          fontSize: '14px',
                          margin: '0 0 4px',
                        }}
                      >
                        🔬 {sur.name}
                      </p>
                      <p
                        style={{
                          margin: '0 0 2px',
                          fontSize: '12px',
                          color: '#8b7355',
                        }}
                      >
                        📅 {sur.date}
                      </p>
                      {sur.vet && (
                        <p
                          style={{
                            margin: '0 0 2px',
                            fontSize: '12px',
                            color: '#8b7355',
                          }}
                        >
                          👨‍⚕️ {sur.vet}
                        </p>
                      )}
                      {sur.notes && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#8b7355',
                          }}
                        >
                          📝 {sur.notes}
                        </p>
                      )}
                    </div>
                    <button
                      style={S.btnDanger}
                      onClick={() => delRecord('surgeries', sur.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* BATHS */}
          {detailTab === 'baths' && (
            <>
              <button
                style={S.btn}
                onClick={() => setShowBathForm(!showBathForm)}
              >
                {showBathForm ? '✕ Cancelar' : '+ Registrar Baño'}
              </button>
              {showBathForm && (
                <div style={S.card}>
                  <p
                    style={{
                      fontWeight: 'bold',
                      color: '#8b4513',
                      marginBottom: '10px',
                    }}
                  >
                    🛁 Nuevo Baño
                  </p>
                  <label style={S.label}>Fecha</label>
                  <input
                    type="date"
                    style={S.input}
                    value={bathForm.date}
                    onChange={(e) =>
                      setBathForm({ ...bathForm, date: e.target.value })
                    }
                  />
                  <label style={S.label}>Producto utilizado</label>
                  <input
                    style={S.input}
                    placeholder="Ej. Shampoo antipulgas, acondicionador..."
                    value={bathForm.product}
                    onChange={(e) =>
                      setBathForm({ ...bathForm, product: e.target.value })
                    }
                  />
                  <label style={S.label}>Notas</label>
                  <input
                    style={S.input}
                    placeholder="Observaciones del baño"
                    value={bathForm.notes}
                    onChange={(e) =>
                      setBathForm({ ...bathForm, notes: e.target.value })
                    }
                  />
                  <button
                    style={S.btn}
                    onClick={() => {
                      addRecord('baths', bathForm);
                      setBathForm(initBath);
                      setShowBathForm(false);
                    }}
                  >
                    Guardar Baño
                  </button>
                </div>
              )}
              {!selectedPet.baths?.length && !showBathForm && (
                <div
                  style={{
                    ...S.card,
                    textAlign: 'center',
                    color: '#bfa58a',
                    padding: '30px',
                  }}
                >
                  <div style={{ fontSize: '40px' }}>🛁</div>
                  <p>Sin baños registrados</p>
                </div>
              )}
              {selectedPet.baths?.map((b: any) => (
                <div
                  key={b.id}
                  style={{ ...S.card, borderLeft: '4px solid #06b6d4' }}
                >
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontWeight: 'bold',
                          fontSize: '14px',
                          margin: '0 0 4px',
                        }}
                      >
                        🛁 Baño
                      </p>
                      <p
                        style={{
                          margin: '0 0 2px',
                          fontSize: '12px',
                          color: '#8b7355',
                        }}
                      >
                        📅 {b.date}
                      </p>
                      {b.product && (
                        <p
                          style={{
                            margin: '0 0 2px',
                            fontSize: '12px',
                            color: '#0e7490',
                          }}
                        >
                          🧴 {b.product}
                        </p>
                      )}
                      {b.notes && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#8b7355',
                          }}
                        >
                          📝 {b.notes}
                        </p>
                      )}
                    </div>
                    <button
                      style={S.btnDanger}
                      onClick={() => delRecord('baths', b.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* TRICKS */}
          {detailTab === 'tricks' && (
            <>
              <button
                style={S.btn}
                onClick={() => setShowTrickForm(!showTrickForm)}
              >
                {showTrickForm ? '✕ Cancelar' : '+ Agregar Truco'}
              </button>
              {showTrickForm && (
                <div style={S.card}>
                  <p
                    style={{
                      fontWeight: 'bold',
                      color: '#8b4513',
                      marginBottom: '10px',
                    }}
                  >
                    🎪 Nuevo Truco
                  </p>
                  <label style={S.label}>Nombre del truco *</label>
                  <input
                    style={S.input}
                    placeholder="Ej. Dar la pata, sentarse, rodar..."
                    value={trickForm.name}
                    onChange={(e) =>
                      setTrickForm({ ...trickForm, name: e.target.value })
                    }
                  />
                  <button
                    style={S.btn}
                    onClick={() => {
                      if (!trickForm.name.trim()) return;
                      addRecord('tricks', trickForm);
                      setTrickForm(initTrick);
                      setShowTrickForm(false);
                    }}
                  >
                    Guardar Truco
                  </button>
                </div>
              )}
              {!selectedPet.tricks?.length && !showTrickForm && (
                <div
                  style={{
                    ...S.card,
                    textAlign: 'center',
                    color: '#bfa58a',
                    padding: '30px',
                  }}
                >
                  <div style={{ fontSize: '40px' }}>🎪</div>
                  <p>Sin trucos registrados aún</p>
                  <p style={{ fontSize: '12px' }}>
                    ¡Empieza a entrenar a {pet.name}!
                  </p>
                </div>
              )}
              <div
                style={{ display: 'flex', flexWrap: 'wrap' as any, gap: '8px' }}
              >
                {selectedPet.tricks?.map((t: any) => (
                  <div
                    key={t.id}
                    style={{
                      background: '#fdf4ff',
                      border: '1.5px solid #d8b4fe',
                      borderRadius: '20px',
                      padding: '6px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        color: '#7e22ce',
                        fontWeight: 'bold',
                      }}
                    >
                      🎪 {t.name}
                    </span>
                    <button
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: 0,
                      }}
                      onClick={() => delRecord('tricks', t.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* CARE */}
          {detailTab === 'care' && (
            <>
              {!ageCat && !breedTips.length && (
                <div
                  style={{
                    ...S.card,
                    textAlign: 'center',
                    color: '#bfa58a',
                    padding: '30px',
                  }}
                >
                  <div style={{ fontSize: '40px' }}>🏥</div>
                  <p>
                    Agrega la edad y raza de {pet.name} para ver sus cuidados
                    personalizados
                  </p>
                </div>
              )}
              {ageCat && (
                <>
                  <div
                    style={{
                      ...S.card,
                      background: '#fef9f0',
                      border: '1.5px solid #cd853f',
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 'bold',
                        color: '#8b4513',
                        margin: '0 0 10px',
                        fontSize: '15px',
                      }}
                    >
                      {ageCat === 'cachorro'
                        ? '🐣 Cuidados para Cachorro (0-1 año)'
                        : ageCat === 'adulto'
                        ? '🐕 Cuidados para Adulto (1-7 años)'
                        : '🦴 Cuidados para Senior (7+ años)'}
                    </p>
                    {ageTips.map((tip, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          gap: '8px',
                          marginBottom: '8px',
                        }}
                      >
                        <span style={{ color: '#cd853f', fontSize: '14px' }}>
                          •
                        </span>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '13px',
                            color: '#2d1a0e',
                          }}
                        >
                          {tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {breedTips.length > 0 && (
                <>
                  <div
                    style={{
                      ...S.card,
                      background: '#eff6ff',
                      border: '1.5px solid #93c5fd',
                    }}
                  >
                    <p
                      style={{
                        fontWeight: 'bold',
                        color: '#1d4ed8',
                        margin: '0 0 10px',
                        fontSize: '15px',
                      }}
                    >
                      🐾 Cuidados para {pet.breed}
                    </p>
                    {breedTips.map((tip, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          gap: '8px',
                          marginBottom: '8px',
                        }}
                      >
                        <span style={{ color: '#3b82f6', fontSize: '14px' }}>
                          •
                        </span>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '13px',
                            color: '#1e3a5f',
                          }}
                        >
                          {tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {vet && (
                <div
                  style={{
                    ...S.card,
                    background: '#f0fdf4',
                    border: '1.5px solid #86efac',
                  }}
                >
                  <p
                    style={{
                      fontWeight: 'bold',
                      color: '#15803d',
                      margin: '0 0 8px',
                      fontSize: '14px',
                    }}
                  >
                    🏥 {vet.name}
                  </p>
                  {vet.address && (
                    <p
                      style={{
                        margin: '0 0 8px',
                        fontSize: '12px',
                        color: '#166534',
                      }}
                    >
                      📍 {vet.address}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {vet.phone && (
                      <a
                        href={`tel:${vet.phone}`}
                        style={{
                          ...S.btnGreen,
                          textDecoration: 'none',
                          fontSize: '12px',
                          padding: '6px 12px',
                        }}
                      >
                        📞 Llamar
                      </a>
                    )}
                    {vet.mapUrl && (
                      <a
                        href={vet.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: '#2563eb',
                          color: '#fff',
                          textDecoration: 'none',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        🗺️ Maps
                      </a>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* HISTORY */}
          {detailTab === 'history' &&
            (() => {
              const all = [
                ...(selectedPet.symptoms || []).map((x: any) => ({
                  ...x,
                  type: 'symptom',
                })),
                ...(selectedPet.vaccines || []).map((x: any) => ({
                  ...x,
                  type: 'vaccine',
                })),
                ...(selectedPet.surgeries || []).map((x: any) => ({
                  ...x,
                  type: 'surgery',
                })),
                ...(selectedPet.baths || []).map((x: any) => ({
                  ...x,
                  type: 'bath',
                })),
              ].sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime()
              );
              return (
                <>
                  <div style={{ ...S.card, textAlign: 'center' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                      }}
                    >
                      {[
                        {
                          n: selectedPet.symptoms?.length || 0,
                          l: 'Síntomas',
                          c: '#8b4513',
                        },
                        {
                          n: selectedPet.vaccines?.length || 0,
                          l: 'Vacunas',
                          c: '#3b82f6',
                        },
                        {
                          n: selectedPet.surgeries?.length || 0,
                          l: 'Cirugías',
                          c: '#8b5cf6',
                        },
                        {
                          n: selectedPet.baths?.length || 0,
                          l: 'Baños',
                          c: '#06b6d4',
                        },
                      ].map(({ n, l, c }) => (
                        <div key={l}>
                          <p
                            style={{
                              fontSize: '22px',
                              fontWeight: 'bold',
                              color: c,
                              margin: 0,
                            }}
                          >
                            {n}
                          </p>
                          <p
                            style={{
                              fontSize: '10px',
                              color: '#bfa58a',
                              margin: 0,
                            }}
                          >
                            {l}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {!all.length && (
                    <div
                      style={{
                        ...S.card,
                        textAlign: 'center',
                        color: '#bfa58a',
                        padding: '30px',
                      }}
                    >
                      <div style={{ fontSize: '40px' }}>📋</div>
                      <p>Sin registros aún</p>
                    </div>
                  )}
                  {all.map((item: any, i: number) => {
                    const icon =
                      item.type === 'symptom'
                        ? '🤒'
                        : item.type === 'vaccine'
                        ? '💉'
                        : item.type === 'surgery'
                        ? '🔬'
                        : '🛁';
                    const color =
                      item.type === 'symptom'
                        ? severityColor(item.severity)
                        : item.type === 'vaccine'
                        ? '#3b82f6'
                        : item.type === 'surgery'
                        ? '#8b5cf6'
                        : '#06b6d4';
                    const title =
                      item.type === 'symptom'
                        ? item.description
                        : item.type === 'bath'
                        ? `Baño${item.product ? ` · ${item.product}` : ''}`
                        : item.name;
                    return (
                      <div
                        key={i}
                        style={{
                          ...S.card,
                          borderLeft: `4px solid ${color}`,
                          padding: '10px 14px',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <span style={{ fontSize: '18px' }}>{icon}</span>
                          <div>
                            <p
                              style={{
                                fontWeight: 'bold',
                                fontSize: '13px',
                                margin: '0 0 2px',
                              }}
                            >
                              {title}
                            </p>
                            <p
                              style={{
                                fontSize: '11px',
                                color: '#bfa58a',
                                margin: 0,
                              }}
                            >
                              📅 {item.date}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              );
            })()}

          <div style={{ height: '80px' }} />
        </div>
      </div>
    );
  }

  return null;
}
