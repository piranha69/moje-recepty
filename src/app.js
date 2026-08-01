// Jednoduchá logika aplikace Moje recepty (localStorage)
const STORAGE_KEY = 'mojeRecepty_v1'
let recipes = []

// --- DOM
const el = id => document.getElementById(id)
const listEl = el('list')
const detailEl = el('detail')
const formEl = el('form')
const searchInput = el('search')

// Form fields
const fId = el('recipe-id')
const fTitle = el('title')
const fDesc = el('description')
const fIngr = el('ingredients')
const fSteps = el('steps')
const fTags = el('tags')

// Detail fields
const dTitle = el('detail-title')
const dDesc = el('detail-desc')
const dIngr = el('detail-ingredients')
const dSteps = el('detail-steps')

// Buttons
const btnNew = el('btn-new')
const btnExport = el('btn-export')
const btnImport = el('btn-import')
const inputImport = el('import-file')

let currentId = null

// --- storage
function loadRecipes(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    recipes = raw ? JSON.parse(raw) : null
  }catch(e){ recipes = null }
  if(!recipes || recipes.length===0){
    // načíst ukázkové recepty ze souboru pokud existují
    fetch('data/sample-recipes.json')
      .then(r=>r.ok? r.json(): [])
      .then(data=>{ recipes = data || []; saveRecipes(); renderList(); })
      .catch(()=>{ recipes = []; renderList(); })
  }else{
    renderList()
  }
}
function saveRecipes(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes)) }

// --- UI
function renderList(filter=''){
  listEl.innerHTML = ''
  const q = filter.trim().toLowerCase()
  const filtered = recipes.filter(r=>{
    if(!q) return true
    return (r.title + ' ' + (r.description||'') + ' ' + (r.tags||[]).join(' ')).toLowerCase().includes(q)
  })
  if(filtered.length===0){ listEl.innerHTML = '<p class="muted">Žádné recepty. Klikněte na "Přidat recept" pro vytvoření.</p>' ; return }
  filtered.forEach(r=>{
    const item = document.createElement('div')
    item.className = 'recipe'
    item.innerHTML = `<div><h3>${escapeHtml(r.title)}</h3><div class="muted">${escapeHtml(r.description || '')}</div></div>
      <div><button data-id="${r.id}">Zobrazit</button></div>`
    item.querySelector('button').addEventListener('click', ()=> showRecipe(r.id))
    listEl.appendChild(item)
  })
}

function showRecipe(id){
  const r = recipes.find(x=>x.id===id)
  if(!r) return alert('Recept nenalezen')
  currentId = id
  dTitle.textContent = r.title
  dDesc.textContent = r.description || ''
  dIngr.innerHTML = ''
  (r.ingredients||[]).forEach(i=>{ const li = document.createElement('li'); li.textContent = i; dIngr.appendChild(li) })
  dSteps.innerHTML = ''
  (r.steps||[]).forEach(s=>{ const li = document.createElement('li'); li.textContent = s; dSteps.appendChild(li) })
  // show detail
  listEl.classList.add('hidden')
  formEl.classList.add('hidden')
  detailEl.classList.remove('hidden')
}

function openForm(edit=false){
  if(edit){
    const r = recipes.find(x=>x.id===currentId)
    if(!r) return
    fId.value = r.id
    fTitle.value = r.title
    fDesc.value = r.description || ''
    fIngr.value = (r.ingredients||[]).join('\n')
    fSteps.value = (r.steps||[]).join('\n')
    fTags.value = (r.tags||[]).join(', ')
    el('form-title').textContent = 'Upravit recept'
  }else{
    fId.value = ''
    fTitle.value = ''
    fDesc.value = ''
    fIngr.value = ''
    fSteps.value = ''
    fTags.value = ''
    el('form-title').textContent = 'Přidat recept'
  }
  listEl.classList.add('hidden')
  detailEl.classList.add('hidden')
  formEl.classList.remove('hidden')
}

function backToList(){
  currentId = null
  listEl.classList.remove('hidden')
  detailEl.classList.add('hidden')
  formEl.classList.add('hidden')
}

function saveFromForm(ev){
  ev.preventDefault()
  const id = fId.value || crypto.randomUUID()
  const newR = {
    id,
    title: fTitle.value.trim(),
    description: fDesc.value.trim(),
    ingredients: fIngr.value.split('\n').map(s=>s.trim()).filter(Boolean),
    steps: fSteps.value.split('\n').map(s=>s.trim()).filter(Boolean),
    tags: fTags.value.split(',').map(s=>s.trim()).filter(Boolean)
  }
  const idx = recipes.findIndex(r=>r.id===id)
  if(idx>=0) recipes[idx] = newR
  else recipes.unshift(newR)
  saveRecipes()
  renderList(searchInput.value)
  backToList()
}

function deleteCurrent(){
  if(!currentId) return
  if(!confirm('Opravdu smazat tento recept?')) return
  recipes = recipes.filter(r=>r.id!==currentId)
  saveRecipes()
  backToList()
  renderList(searchInput.value)
}

// export / import
function exportJson(){
  const dataStr = JSON.stringify(recipes, null, 2)
  const blob = new Blob([dataStr], {type:'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'moje-recepty.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
}

function importJsonFile(file){
  const reader = new FileReader()
  reader.onload = ()=>{
    try{
      const imported = JSON.parse(reader.result)
      if(!Array.isArray(imported)) throw new Error('Neplatný formát')
      // merge: přidej nové itemy (podle id)
      const map = new Map(recipes.map(r=>[r.id,r]))
      imported.forEach(r=>{ if(r.id && !map.has(r.id)) map.set(r.id,r) })
      recipes = Array.from(map.values())
      saveRecipes(); renderList()
      alert('Import dokončen')
    }catch(e){ alert('Chyba při importu: ' + e.message) }
  }
  reader.readAsText(file)
}

// helpers
function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

// --- event wiring
searchInput.addEventListener('input', ()=> renderList(searchInput.value))
btnNew.addEventListener('click', ()=> openForm(false))
el('back').addEventListener('click', backToList)
el('edit').addEventListener('click', ()=> openForm(true))
el('delete').addEventListener('click', deleteCurrent)

el('recipe-form').addEventListener('submit', saveFromForm)
el('cancel').addEventListener('click', backToList)

btnExport.addEventListener('click', exportJson)
btnImport.addEventListener('click', ()=> inputImport.click())
inputImport.addEventListener('change', ()=>{
  const f = inputImport.files && inputImport.files[0]
  if(f) importJsonFile(f)
})

// init
loadRecipes()
