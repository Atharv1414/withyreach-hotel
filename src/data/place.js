export const menu = [
  { season: 'Winter', months: [12, 1, 2], dishes: [
    ['Smoked eel, beetroot, horseradish', 12, ''], ['Celeriac baked in hay, hazelnut, watercress', 18, 'v'],
    ['Ox cheek in cider, swede, pickled walnut', 24, ''], ['Apple and lard-crust pie, clotted cream', 9, '']] },
  { season: 'Spring', months: [3, 4, 5], dishes: [
    ['Wild garlic soup, sheep’s curd', 9, 'v'], ['Elver-run bream, sorrel butter, new potatoes', 23, ''],
    ['Asparagus, duck egg, Cheddar crumb', 16, 'v'], ['Rhubarb, burnt custard', 9, 'v']] },
  { season: 'Summer', months: [6, 7, 8], dishes: [
    ['Tomatoes, samphire, warm bread', 10, 'vg'], ['Grey mullet, fennel, cider', 22, ''],
    ['Courgette flowers, curd, honey', 15, 'v'], ['Strawberries, meadowsweet cream', 9, 'v']] },
  { season: 'Autumn', months: [9, 10, 11], dishes: [
    ['Mushrooms on toast, marrowbone', 13, ''], ['Squash, brown butter, sage', 17, 'v'],
    ['Wild duck, blackberry, bread sauce', 25, ''], ['Quince and almond tart', 9, 'v']] },
]

// Points on the hand-drawn map, in its own 0-100 by 0-70 space
export const walks = [
  { id: 'hide', name: 'The long hide', km: 1.8, mins: 25, best: 'An hour before sunset, November to February',
    note: 'Boardwalk all the way. Starlings come in from the north-west; stand at the left-hand end.',
    path: [[50, 40], [44, 36], [37, 35], [30, 30], [22, 29]] },
  { id: 'mump', name: 'The Mump', km: 6.4, mins: 100, best: 'Dawn, with mist below you',
    note: 'A steep little hill with a ruined church. The only climb for five miles.',
    path: [[50, 40], [56, 45], [63, 47], [71, 43], [78, 46], [82, 52]] },
  { id: 'drove', name: 'Withy drove', km: 3.1, mins: 45, best: 'March, when the willow is cut',
    note: 'A drove is a farm track between fields. This one floods; ask at the desk first.',
    path: [[50, 40], [52, 33], [58, 26], [60, 18], [52, 14], [45, 18], [45, 28], [50, 40]] },
]

// Rhynes: the ditches that divide the moor. Fields are long, narrow and never quite square, so
// each row of fields is split at its own points and every corner is nudged.
const nudge = (n) => ((n * 9301 + 49297) % 233) / 233 - 0.5
const ROWS = [0, 11, 23, 37, 52, 62, 70]
export const rhynes = ROWS.slice(0, -1).flatMap((y, r) => {
  const bottom = ROWS[r + 1]
  const lines = [`M0 ${y + nudge(r) * 2}Q50 ${y + nudge(r + 7) * 5} 100 ${y + nudge(r + 3) * 3}`]
  for (let x = 5 + nudge(r + 11) * 8, k = 0; x < 100; x += 6 + (nudge(r * 17 + k) + 0.5) * 9, k++)
    lines.push(`M${x.toFixed(1)} ${y}L${(x + nudge(r * 5 + k) * 4).toFixed(1)} ${bottom}`)
  return lines
})
