// Simple Node script to add `time` and `difficulty` fields to data/sample-recipes.json
// Heuristics:
//  - ingredients length <= 4  => time: "20 min", difficulty: "snadné"
//  - ingredients length <= 10 => time: "45 min", difficulty: "střední"
//  - otherwise                => time: "90 min", difficulty: "těžké"

const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '..', 'data', 'sample-recipes.json')
if(!fs.existsSync(file)){
  console.error('File not found:', file)
  process.exit(1)
}
const raw = fs.readFileSync(file, 'utf8')
let data
try{
  data = JSON.parse(raw)
}catch(e){
  console.error('JSON parse error:', e)
  process.exit(1)
}
let changed = false
const mapDifficulty = (n) => {
  if(n <= 4) return {time: '20 min', difficulty: 'snadné'}
  if(n <= 10) return {time: '45 min', difficulty: 'střední'}
  return {time: '90 min', difficulty: 'těžké'}
}
data = data.map(item => {
  const copy = Object.assign({}, item)
  if(!copy.time || !copy.difficulty){
    const ingCount = (Array.isArray(copy.ingredients) ? copy.ingredients.length : 0)
    const meta = mapDifficulty(ingCount)
    if(!copy.time) copy.time = meta.time
    if(!copy.difficulty) copy.difficulty = meta.difficulty
    changed = true
  }
  return copy
})
if(changed){
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
  console.log('Updated', file)
} else {
  console.log('No changes needed')
}
