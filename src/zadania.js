export const los = (min, max) => min + Math.floor(Math.random() * (max - min + 1))

export const klucz = z => z.liczby.join() + z.luka
export const DOBRYCH_Z_RZEDU = 3

// Działanie jako [a, op, b, wynik]; luka = indeks 0, 2 albo 3 (np. _+5=8, 3+_=7, 2+3=_)
export function noweZadanie(op, istniejace = []) {
  const uzyte = new Set(istniejace.map(klucz))
  for (let proba = 0; ; proba++) {
    let a, b, c
    if (op === '+') { c = los(2, 10); a = los(1, c - 1); b = c - a }
    else { a = los(2, 10); b = los(1, a); c = a - b }
    const z = { liczby: [a, op, b, c], luka: [0, 2, 3][los(0, 2)] }
    if (!uzyte.has(klucz(z)) || proba > 50) return z
  }
}

// 2 dodawania + 2 odejmowania, w losowej kolejności; jedno z nich to (o ile jest) zadanie do powtórki
export function nowaRunda(doPowtorki = []) {
  const zadania = []
  const ops = ['+', '+', '-', '-']
  if (doPowtorki.length) {
    const { liczby, luka } = doPowtorki[los(0, doPowtorki.length - 1)]
    zadania.push({ liczby, luka })
    ops.splice(ops.indexOf(liczby[1]), 1)
  }
  for (const op of ops) zadania.push(noweZadanie(op, zadania))
  return zadania.sort(() => Math.random() - 0.5)
}

// Błąd → zadanie trafia na listę (seria od zera); poprawna odpowiedź wydłuża serię,
// a po DOBRYCH_Z_RZEDU poprawnych z rzędu zadanie znika z listy
export function poOdpowiedzi(doPowtorki, z, dobrze) {
  const k = klucz(z)
  const byl = doPowtorki.find(p => klucz(p) === k)
  const reszta = doPowtorki.filter(p => p !== byl)
  if (!dobrze) return [...reszta, { liczby: z.liczby, luka: z.luka, seria: 0 }]
  if (!byl) return doPowtorki
  if (byl.seria + 1 >= DOBRYCH_Z_RZEDU) return reszta
  return doPowtorki.map(p => p === byl ? { ...p, seria: p.seria + 1 } : p)
}

export const odpowiedz = z => z.liczby[z.luka]
