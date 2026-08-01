// Client: render recipes with image support
const STORAGE_KEY = 'mojeRecepty_v1'
let recipes = []

const el = id => document.getElementById(id)
const listEl = el('list')
const detailEl = el('detail')
const searchInput = el('search')

const dTitle = el('detail-title')
const dDesc = el('detail-desc')
const dIngr = el('detail-ingredients')
const dSteps = el('detail-steps')
const dImage = el('detail-image')

let currentId = null

function loadRecipes(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    recipes = raw ? JSON.parse(raw) : null
  }catch(e){ recipes = null }
  if(!recipes || recipes.length===0){
    fetch('data/sample-recipes.json')
      .then(r=>r.ok? r.json(): [])
      .then(data=>{ recipes = data || []; renderList(); })
      .catch(()=>{ recipes = []; renderList(); })
  }else{
    renderList()
  }
}

function renderList(filter=''){
  listEl.innerHTML = ''
  const q = filter.trim().toLowerCase()
  const filtered = recipes.filter(r=>{
    if(!q) return true
    return (r.title + ' ' + (r.description||'') + ' ' + (r.tags||[]).join(' ')).toLowerCase().includes(q)
  })
  if(filtered.length===0){ listEl.innerHTML = '<p class="muted">Žádné recepty. Přidejte JSON soubory do adresáře <code>data/</code> v repozitáři.</p>' ; return }

  filtered.forEach((r)=>{
    const card = document.createElement('article')
    card.className = 'card'
    // image
    const imgDiv = document.createElement('div')
    imgDiv.className = 'card-img'
    if(r.image){
      imgDiv.style.backgroundImage = `url(${r.image})`
    }else{
      // gradient placeholder with initial
      const initial = escapeHtml((r.title||'')[0] || '?')
      imgDiv.style.display = 'flex'
      imgDiv.style.alignItems = 'center'
      imgDiv.style.justifyContent = 'center'
      imgDiv.style.fontSize = '48px'
      imgDiv.style.fontWeight = '700'
      imgDiv.textContent = initial
    }

    const body = document.createElement('div')
    body.className = 'card-body'
    body.innerHTML = `
      <h3>${escapeHtml(r.title)}</h3>
      <div class="muted">${escapeHtml(r.description || '')}</div>
      <div class="chips">${(r.tags||[]).map(t=>`<span class="chip">${escapeHtml(t)}</span>`).join('')}</div>
      <div class="card-actions"><button data-id="${r.id}" class="btn view-btn">Zobrazit</button></div>`

    card.appendChild(imgDiv)
    card.appendChild(body)
    listEl.appendChild(card)
    card.querySelector('.view-btn').addEventListener('click', ()=> showRecipe(r.id))
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
  if(r.image){
    dImage.style.backgroundImage = `url(${r.image})`
  }else{
    dImage.style.backgroundImage = ''
    dImage.textContent = (r.title||'')[0] || ''
  }
  listEl.classList.add('hidden')
  detailEl.classList.remove('hidden')
}

function backToList(){
  currentId = null
  listEl.classList.remove('hidden')
  detailEl.classList.add('hidden')
}

function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

searchInput.addEventListener('input', ()=> renderList(searchInput.value))
el('back').addEventListener('click', backToList)

loadRecipes()
