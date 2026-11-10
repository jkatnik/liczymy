export const los = (min, max) => min + Math.floor(Math.random() * (max - min + 1))

const klucz = z => z.liczby.join() + z.luka

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

// 2 dodawania + 2 odejmowania, w losowej kolejności
export function nowaRunda() {
  const zadania = []
  for (const op of ['+', '+', '-', '-']) zadania.push(noweZadanie(op, zadania))
  return zadania.sort(() => Math.random() - 0.5)
}

export const odpowiedz = z => z.liczby[z.luka]
