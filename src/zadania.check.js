import assert from 'node:assert'
import { noweZadanie, nowaRunda, poOdpowiedzi, klucz } from './zadania.js'

for (let k = 0; k < 5000; k++) {
  const runda = nowaRunda()
  assert.equal(runda.filter(z => z.liczby[1] === '+').length, 2)
  assert.equal(runda.filter(z => z.liczby[1] === '-').length, 2)
  assert.equal(new Set(runda.map(z => z.liczby.join() + z.luka)).size, 4, 'duplikat w rundzie')
  for (const z of [...runda, noweZadanie('+'), noweZadanie('-')]) {
    const [a, op, b, c] = z.liczby
    assert.equal(op === '+' ? a + b : a - b, c)
    for (const n of [a, b, c]) assert.ok(n >= 0 && n <= 10, `poza zakresem: ${z.liczby}`)
    assert.ok([0, 2, 3].includes(z.luka))
  }
}
// powtórki: błąd dodaje, 3 dobre z rzędu usuwają, błąd w trakcie zeruje serię
const z = { liczby: [3, '+', 4, 7], luka: 2 }
let lista = poOdpowiedzi([], z, false)
assert.equal(lista.length, 1)
lista = poOdpowiedzi(lista, z, true)
lista = poOdpowiedzi(lista, z, true)
lista = poOdpowiedzi(lista, z, false)
assert.equal(lista[0].seria, 0, 'błąd zeruje serię')
assert.equal(poOdpowiedzi(lista, z, false).length, 1, 'bez duplikatów')
for (let k = 0; k < 3; k++) { assert.equal(lista.length, 1); lista = poOdpowiedzi(lista, z, true) }
assert.equal(lista.length, 0, 'usunięte po 3 dobrych z rzędu')
assert.deepEqual(poOdpowiedzi([], z, true), [], 'dobra odpowiedź spoza listy niczego nie dodaje')

// runda z powtórką: zawiera zadanie z listy i nadal 2+2
for (let k = 0; k < 500; k++) {
  const p = { liczby: [9, '-', 3, 6], luka: 0, seria: 1 }
  const runda = nowaRunda([p])
  assert.ok(runda.some(r => klucz(r) === klucz(p)))
  assert.equal(runda.filter(r => r.liczby[1] === '-').length, 2)
  assert.equal(new Set(runda.map(klucz)).size, 4)
}
console.log('OK')
