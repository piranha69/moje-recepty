// Jednoduchá logika aplikace Moje recepty (localStorage)
const STORAGE_KEY = 'mojeRecepty_v1'
let recipes = []

// --- DOM
const el = id => document.getElementById(id)
const listEl = el('list')
const detailEl = el('detail')
const searchInput = el('search')

// Detail fields
const dTitle = el('detail-title')
const dDesc = el('detail-desc')
const dIngr = el('detail-ingredients')
const dSteps = el('detail-steps')

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
      .then(data=>{ recipes = data || []; renderList(); })
      .catch(()=>{ recipes = []; renderList(); })
  }else{
    renderList()
  }
}

// --- UI
function renderList(filter=''){
  listEl.innerHTML = ''
  const q = filter.trim().toLowerCase()
  const filtered = recipes.filter(r=>{
    if(!q) return true
    return (r.title + ' ' + (r.description||'') + ' ' + (r.tags||[]).join(' ')).toLowerCase().includes(q)
  })
  if(filtered.length===0){ listEl.innerHTML = '<p class="muted">Žádné recepty. Přidejte recepty do adresáře <code>data/</code> v repozitáři.</p>' ; return }
  filtered.forEach((r, idx)=>{
    const item = document.createElement('div')
    item.className = 'recipe'
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
  detailEl.classList.remove('hidden')
}

function backToList(){
  currentId = null
  listEl.classList.remove('hidden')
  detailEl.classList.add('hidden')
}

// helpers
function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

// --- event wiring
searchInput.addEventListener('input', ()=> renderList(searchInput.value))
el('back').addEventListener('click', backToList)

// init
loadRecipes()
