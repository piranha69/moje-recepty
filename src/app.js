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

// Utility: normalize text and strip diacritics for diacritics-insensitive search
function normalizeText(s){
  return String(s || '')
    .normalize('NFD')            // decompose combined letters to letter + diacritic
    .replace(/\u0000-\u001F/g, '') // remove control chars just in case
    .replace(/\u000B-\u000C/g, '')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritic marks
    .toLowerCase()
}

// Utility: ensure value is an array of strings
function toArray(v){
  if(Array.isArray(v)) return v
  if(!v) return []
  // if it's a string, split on newlines or commas, trim each item
  if(typeof v === 'string'){
    return v.split(/\r?\n|,/) // split on newline or comma
            .map(s=>s.trim())
            .filter(Boolean)
  }
  // fallback: try to coerce to string and split
  return String(v).split(/\r?\n|,/).map(s=>s.trim()).filter(Boolean)
}

// Utility: debounce function to limit how often a function runs
function debounce(fn, wait){
  let timer = null
  return function(...args){
    if(timer) clearTimeout(timer)
    timer = setTimeout(()=> fn.apply(this, args), wait)
  }
}

// Always fetch data from repo JSON; do not use localStorage
function loadRecipes(){
  console.log('loadRecipes: start')
  fetch('data/sample-recipes.json')
    .then(r=>{
      if(!r.ok) throw new Error('Fetch failed')
      return r.json()
    })
    .then(data=>{
      recipes = Array.isArray(data) ? data : []
      console.log('loadRecipes: got', recipes.length, 'recipes')
      initList()
      // If URL has ?recipe=ID open that recipe (deep-link support)
      const params = new URLSearchParams(location.search)
      const rid = params.get('recipe')
      if(rid){
        // small timeout to ensure list rendered state is consistent
        setTimeout(()=>{
          const found = recipes.find(x=>x.id===rid)
          if(found) showRecipe(rid)
          else console.warn('loadRecipes: recipe id in URL not found', rid)
        }, 0)
      }
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
  // Map Czech labels to ascii class names for styling
  const diffClassMap = { 'snadné': 'easy', 'střední': 'medium', 'těžké': 'hard' }
  const diffClass = diffText ? (diffClassMap[diffText.toLowerCase()] || diffText.toLowerCase().replace(/\s+/g,'-')) : ''
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

    // Build image block
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

    // Build body HTML
    const ingredientsArr = toArray(r.ingredients)
    const ingList = ingredientsArr.slice(0,10)
    const moreCount = Math.max(0, ingredientsArr.length - ingList.length)
    const preview = ingList.join(', ') + (moreCount>0 ? ` (a další ${moreCount})` : '')
    const bodyHtml = `
      <div class="card-body">
        <h3>${escapeHtml(r.title)}</h3>
        <div class="meta">${metaHtml(r)}</div>
        <div class="muted">${escapeHtml(r.description || '')}</div>
        <div class="card-body-preview">${preview? `<div class="preview-ing" title="${escapeHtml(ingredientsArr.join(', '))}">${escapeHtml(preview)}</div>` : ''}</div>
        <div class="chips">${(toArray(r.tags)||[]).map(t=>`<span class="chip">${escapeHtml(t)}</span>`).join('')}</div>
      </div>`

    // Create anchor for per-recipe page (SEO / deep-linking)
    const link = document.createElement('a')
    link.href = `?recipe=${encodeURIComponent(r.id)}`
    link.className = 'card-link'
    // Put image div and body inside the link
    link.appendChild(imgDiv)

    const wrapper = document.createElement('div')
    wrapper.innerHTML = bodyHtml
    // append all children of wrapper to link
    Array.from(wrapper.childNodes).forEach(n=> link.appendChild(n))

    // Intercept click to avoid full page reload and open client-side detail
    link.addEventListener('click', (e)=>{
      e.preventDefault()
      const url = `?recipe=${encodeURIComponent(r.id)}`
      if(history && history.pushState){
        history.pushState({recipe: r.id}, '', url)
      } else {
        location.href = url
        return
      }
      showRecipe(r.id)
    })

    card.appendChild(link)
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
  const nq = normalizeText(q)
  filtered = recipes.filter(r=>{
    if(!nq) return true
    // include title, description, tags, ingredients and steps in searchable haystack
    const tags = Array.isArray(r.tags) ? r.tags.join(' ') : (r.tags || '')
    const ingredients = toArray(r.ingredients).join(' ')
    const steps = toArray(r.steps).join(' ')
    const hay = normalizeText(r.title + ' ' + (r.description||'') + ' ' + tags + ' ' + ingredients + ' ' + steps)
    return hay.includes(nq)
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
  console.log('showRecipe called for', id)
  const r = recipes.find(x=>x.id===id)
  if(!r) return alert('Recept nenalezen')
  currentId = id
  dTitle.textContent = r.title
  dDesc.innerHTML = `${escapeHtml(r.description || '')}<div class="detail-meta">${metaHtml(r)}</div>`
  dIngr.innerHTML = ''
  toArray(r.ingredients).forEach(i=>{ const li = document.createElement('li'); li.textContent = i; dIngr.appendChild(li) })
  dSteps.innerHTML = ''
  toArray(r.steps).forEach(s=>{ const li = document.createElement('li'); li.textContent = s; dSteps.appendChild(li) })
  if(r.image){
    dImage.style.backgroundImage = `url(${r.image})`
    dImage.textContent = ''
  }else{
    dImage.style.backgroundImage = ''
    dImage.textContent = (r.title||'')[0] || ''
  }
  // Hide list and show detail (this makes ?recipe= behave like a per-recipe page)
  listEl.classList.add('hidden')
  detailEl.classList.remove('hidden')
  // scroll detail element into view (previously we scrolled to top which could hide the detail)
  try{
    if(detailEl && typeof detailEl.scrollIntoView === 'function'){
      detailEl.scrollIntoView({behavior:'smooth', block:'start'})
    } else {
      window.scrollTo(0,0)
    }
  }catch(e){
    // fallback
    window.scrollTo(0,0)
  }
}

function backToList(){
  currentId = null
  // remove recipe param from URL without reloading
  if(history && history.replaceState){
    const url = new URL(location.href)
    url.searchParams.delete('recipe')
    history.replaceState({}, '', url.pathname + url.search)
  }
  listEl.classList.remove('hidden')
  detailEl.classList.add('hidden')
}

function escapeHtml(s){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;') }

// Handle back/forward navigation to keep UI in sync with URL
window.addEventListener('popstate', (e)=>{
  const params = new URLSearchParams(location.search)
  const rid = params.get('recipe')
  if(rid){
    // If recipes already loaded, show immediately, otherwise loadRecipes will check on completion
    const found = recipes.find(x=>x.id===rid)
    if(found) showRecipe(rid)
  } else {
    backToList()
  }
})

// debounce the search handler to avoid excessive filtering while typing
const debouncedSearch = debounce(()=> applySearch(searchInput.value), 250)
searchInput.addEventListener('input', debouncedSearch)
el('back').addEventListener('click', backToList)

// init
loadRecipes()
