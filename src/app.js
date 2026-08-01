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
  filtered.forEach((r, idx)=>{
    const item = document.createElement('div')
    item.className = 'recipe'
    // use first tag or index to create a subtle image variant (CSS background via thumb)
    const tagsHtml = (r.tags||[]).map(t=>`<span class="chip">${escapeHtml(t)}</span>`).join(' ')
    const initial = escapeHtml((r.title||'')[0] || '?')
    item.innerHTML = `
      <div class="thumb" aria-hidden>${initial}</div>
      <div class="card-body">
        <h3>${escapeHtml(r.title)}</h3>
        <div class="muted">${escapeHtml(r.description || '')}</div>
        <div class="chips">${tagsHtml}</div>
        <div class="card-actions"><button data-id="${r.id}" class="btn">Zobrazit</button></div>
      </div>`
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
  // show modal form
  formEl.classList.remove('hidden')
  document.body.classList.add('modal-open')
}

function closeForm(){
  formEl.classList.add('hidden')
  document.body.classList.remove('modal-open')
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
  closeForm()
}

function deleteCurrent(){
  if(!currentId) return
  if(!confirm('Opravdu smazat tento recept?')) return
  recipes = recipes.filter(r=>r.id!==currentId)
  saveRecipes()
  backToList()
  renderList(searchInput.value)
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
el('cancel').addEventListener('click', closeForm)

// init
loadRecipes()
