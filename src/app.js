// Client: render recipes with image support, infinite scroll and lazy-loading
let recipes = []
let filtered = []
const BATCH = 12
let renderedCount = 0

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
let observer = null
let sentinel = null

// Always fetch data from repo JSON; do not use localStorage
function loadRecipes(){
  fetch('data/sample-recipes.json')
    .then(r=>{
      if(!r.ok) throw new Error('Fetch failed')
      return r.json()
    })
    .then(data=>{
      recipes = Array.isArray(data) ? data : []
      initList()
    })
    .catch(err=>{
      console.error('Failed to load recipes:', err)
      listEl.innerHTML = '<p class="muted">Nelze načíst data. Ujistěte se, že soubory v adresáři data/ existují a že stránku spouštíte přes HTTP (ne file://).</p>'
    })
}

function initList(){
  // initialize filtered and rendering
  filtered = recipes.slice()
  renderedCount = 0
  listEl.innerHTML = ''
  // remove existing sentinel
  if(sentinel && sentinel.parentNode) sentinel.parentNode.removeChild(sentinel)
  sentinel = document.createElement('div')
  sentinel.className = 'sentinel'
  listEl.appendChild(sentinel)

  // setup observer for infinite scroll
  if(observer) observer.disconnect()
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting) loadMore()
    })
  }, {rootMargin: '200px'})
  observer.observe(sentinel)

  loadMore()
}

function metaHtml(r){
  const time = r.time ? `<span class="meta-time">⏱ ${escapeHtml(String(r.time))}</span>` : ''
  const diffText = r.difficulty ? String(r.difficulty) : ''
  const diffClass = diffText ? diffText.toLowerCase() : ''
  const diff = diffText ? `<span class="meta-difficulty ${escapeHtml(diffClass)}">${escapeHtml(diffText)}</span>` : ''
  return `${time}${diff}`
}

function loadMore(){
  if(renderedCount >= filtered.length) return
  const next = Math.min(renderedCount + BATCH, filtered.length)
  // remove sentinel before appending cards so it stays at the end
  if(sentinel && sentinel.parentNode) sentinel.parentNode.removeChild(sentinel)

  for(let i = renderedCount; i < next; i++){
    const r = filtered[i]
    const card = document.createElement('article')
    card.className = 'card'
    card.tabIndex = 0
    card.setAttribute('role','button')

    const imgDiv = document.createElement('div')
    imgDiv.className = 'card-img'
    if(r.image){
      const img = document.createElement('img')
      img.src = r.image
      img.alt = r.title || 'Recept'
      img.loading = 'lazy'
      img.decoding = 'async'
      imgDiv.appendChild(img)
    }else{
      const span = document.createElement('div')
      span.className = 'initial'
      span.textContent = (r.title||'')[0] || '?'
      imgDiv.appendChild(span)
    }

    const body = document.createElement('div')
    body.className = 'card-body'
    // show up to 10 ingredients preview, append "(a další N)" if more
    const ingList = (r.ingredients || []).slice(0,10)
    const moreCount = Math.max(0, (r.ingredients || []).length - ingList.length)
    const preview = ingList.join(', ') + (moreCount>0 ? ` (a další ${moreCount})` : '')
    body.innerHTML = `
      <h3>${escapeHtml(r.title)}</h3>
      <div class="meta">${metaHtml(r)}</div>
      <div class="muted">${escapeHtml(r.description || '')}</div>
      <div class="card-body-preview">${preview? `<div class="preview-ing" title="${escapeHtml((r.ingredients||[]).join(', '))}">${escapeHtml(preview)}</div>` : ''}</div>
      <div class="chips">${(r.tags||[]).map(t=>`<span class="chip">${escapeHtml(t)}</span>`).join('')}</div>`

    card.appendChild(imgDiv)
    card.appendChild(body)
    // make whole card clickable and keyboard accessible
    card.addEventListener('click', ()=> showRecipe(r.id))
    card.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); showRecipe(r.id) } })

    listEl.appendChild(card)
  }

  // re-add sentinel
  listEl.appendChild(sentinel)
  renderedCount = next
  // if all rendered, stop observing
  if(renderedCount >= filtered.length && observer){
    observer.unobserve(sentinel)
  }
}

function applySearch(q){
  q = (q||'').trim().toLowerCase()
  filtered = recipes.filter(r=>{
    if(!q) return true
    return (r.title + ' ' + (r.description||'') + ' ' + (r.tags||[]).join(' ')).toLowerCase().includes(q)
  })
  renderedCount = 0
  listEl.innerHTML = ''
  if(sentinel && sentinel.parentNode) sentinel.parentNode.removeChild(sentinel)
  sentinel = document.createElement('div')
  sentinel.className = 'sentinel'
  listEl.appendChild(sentinel)
  if(observer) observer.observe(sentinel)
  loadMore()
}

function showRecipe(id){
  const r = recipes.find(x=>x.id===id)
  if(!r) return alert('Recept nenalezen')
  currentId = id
  dTitle.textContent = r.title
  dDesc.innerHTML = `${escapeHtml(r.description || '')}<div class="detail-meta">${metaHtml(r)}</div>`
  dIngr.innerHTML = ''
  (r.ingredients||[]).forEach(i=>{ const li = document.createElement('li'); li.textContent = i; dIngr.appendChild(li) })
  dSteps.innerHTML = ''
  (r.steps||[]).forEach(s=>{ const li = document.createElement('li'); li.textContent = s; dSteps.appendChild(li) })
  if(r.image){
    dImage.style.backgroundImage = `url(${r.image})`
    dImage.textContent = ''
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

searchInput.addEventListener('input', ()=> applySearch(searchInput.value))
el('back').addEventListener('click', backToList)

// init
loadRecipes()
