import assert from 'node:assert'
import { noweZadanie, nowaRunda } from './zadania.js'

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
console.log('OK')
