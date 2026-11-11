import { useMemo, useRef, useState } from 'react'
import { los, noweZadanie, nowaRunda, poOdpowiedzi, odpowiedz as dobraOdpowiedz } from './zadania.js'

const KLUCZ = 'liczymy-do-10'
const ZWIERZAKI = [...'🐶🐱🐭🐹🐰🦊🐻🐼🐨🐯🦁🐮🐷🐸🐵🐔🐧🐦🦄🐝🦋🐢🐙🦕🐳🦒🦓🐘🦔🐉']
const GWIAZDEK_NA_ZWIERZAKA = 10
const KOLORY = ['#e53935', '#ef6c00', '#ffc93c', '#1e9e55', '#0288d1', '#7c4dff', '#00897b'] // żółty (indeks 2) dostaje ciemne cyfry — biały na żółtym jest nieczytelny
const POCHWALY = ['Super!', 'Brawo!', 'Świetnie!', 'Ekstra!', 'Tak jest!', 'Mistrzostwo!', 'Wow!']

const dataStr = d => d.toLocaleDateString('sv') // RRRR-MM-DD w lokalnej strefie
const dzis = () => dataStr(new Date())

function wczytaj() {
  try { return JSON.parse(localStorage.getItem(KLUCZ)) || { gwiazdki: 0, dni: {} } }
  catch { return { gwiazdki: 0, dni: {} } }
}
function zapisz(stan) {
  try { localStorage.setItem(KLUCZ, JSON.stringify(stan)) } catch { /* tryb prywatny itp. */ }
}

function seria(dni) {
  const d = new Date()
  if (!dni[dataStr(d)]) d.setDate(d.getDate() - 1) // dziś jeszcze można zdążyć
  let n = 0
  while (dni[dataStr(d)]) { n++; d.setDate(d.getDate() - 1) }
  return n
}

// --- dźwięki ---
let ac
function ton(f, t = 0, d = 0.15) {
  try {
    ac = ac || new AudioContext()
    const o = ac.createOscillator(), g = ac.createGain(), s = ac.currentTime + t
    o.type = 'triangle'; o.frequency.value = f
    g.gain.setValueAtTime(0.25, s); g.gain.exponentialRampToValueAtTime(0.001, s + d)
    o.connect(g).connect(ac.destination); o.start(s); o.stop(s + d)
  } catch { /* brak dźwięku to nie problem */ }
}
const dzwiekDobrze = () => { ton(660); ton(880, 0.1) }
const dzwiekZle = () => ton(220, 0, 0.3)
const dzwiekKoniec = () => [523, 659, 784, 1046].forEach((f, i) => ton(f, i * 0.12, 0.25))

export default function App() {
  const [stan, setStan] = useState(wczytaj)
  const [ekran, setEkran] = useState('start')
  const [wynik, setWynik] = useState(null)
  // Gra woła nas z setTimeout, więc domknięcie `stan` bywa nieaktualne — zawsze bierzemy najświeższy z refa
  const stanRef = useRef(stan)
  function aktualizuj(nowy) {
    stanRef.current = nowy
    zapisz(nowy)
    setStan(nowy)
  }

  function poOdpowiedziNaZadanie(z, dobrze) {
    const s = stanRef.current
    aktualizuj({ ...s, doPowtorki: poOdpowiedzi(s.doPowtorki ?? [], z, dobrze) })
  }

  function koniecRundy(wyniki, liczbaZadan) {
    const s = stanRef.current
    const bledy = wyniki.filter(w => !w).length
    const bonus = bledy === 0 ? 3 : 0
    const zdobyte = wyniki.length - bledy + bonus
    const nowy = { ...s, gwiazdki: s.gwiazdki + zdobyte, dni: { ...s.dni } }
    if (!s.dni[dzis()]) nowy.dni[dzis()] = { bledy, zadan: liczbaZadan }
    const zwierzaki = Math.floor(nowy.gwiazdki / GWIAZDEK_NA_ZWIERZAKA)
    const nowyZwierzak = zwierzaki > Math.floor(s.gwiazdki / GWIAZDEK_NA_ZWIERZAKA)
      ? ZWIERZAKI[Math.min(zwierzaki, ZWIERZAKI.length) - 1] : null
    aktualizuj(nowy)
    setWynik({ bledy, bonus, zdobyte, nowyZwierzak })
    setEkran('koniec')
    dzwiekKoniec()
  }

  const s = seria(stan.dni)
  return (
    <div className="app">
      <div className="top">
        <span className="pill">⭐ {stan.gwiazdki}</span>
        <span className="pill">🔥 {s} {s === 1 ? 'dzień' : 'dni'}</span>
      </div>
      {ekran === 'start' && <Start stan={stan} onStart={() => setEkran('gra')} />}
      {ekran === 'gra' && <Gra doPowtorki={stan.doPowtorki ?? []} onOdpowiedz={poOdpowiedziNaZadanie} onKoniec={koniecRundy} />}
      {ekran === 'koniec' && <Koniec wynik={wynik} onDalej={() => setEkran('start')} />}
    </div>
  )
}

function Start({ stan, onStart }) {
  const t = dzis()
  const zrobione = !!stan.dni[t]

  const tydzien = []
  const d = new Date(); d.setDate(d.getDate() - 6)
  for (let k = 0; k < 7; k++, d.setDate(d.getDate() + 1)) {
    const s = dataStr(d)
    tydzien.push(
      <div key={s} className={`dzien ${stan.dni[s] ? 'ok' : ''} ${s === t ? 'dzis' : ''}`}>
        {d.toLocaleDateString('pl', { weekday: 'short' })}<b>{stan.dni[s] ? '⭐' : s === t ? '?' : ''}</b>
      </div>
    )
  }

  const odblokowane = Math.floor(stan.gwiazdki / GWIAZDEK_NA_ZWIERZAKA)
  const doNastepnego = GWIAZDEK_NA_ZWIERZAKA - stan.gwiazdki % GWIAZDEK_NA_ZWIERZAKA

  return <>
    <div className="card">
      <div className="maskotka">{zrobione ? '😺' : '🦊'}</div>
      <h1>{zrobione ? 'Dzisiaj zrobione!' : 'Liczymy do 10!'}</h1>
      <p className="opis">
        {zrobione ? 'Brawo! Możesz poćwiczyć jeszcze trochę 💪'
          : <>2 dodawania i 2 odejmowania.<br />Za błąd dochodzą 2 przykłady.</>}
      </p>
      <button className={`big-btn ${zrobione ? 'alt' : ''}`} onClick={onStart}>
        {zrobione ? 'Poćwicz jeszcze ➕' : 'Start! 🚀'}
      </button>
    </div>
    <div className="card"><div className="tydzien">{tydzien}</div></div>
    <div className="card">
      <b className="tytul">Twoje zoo 🏡</b>
      <div className="zoo">
        {ZWIERZAKI.map((z, k) =>
          <span key={k} className={k < odblokowane ? 'mam' : k === odblokowane ? 'zablokowane nastepny' : 'zablokowane'}>{z}</span>)}
      </div>
      <small>Jeszcze {doNastepnego} ⭐ do nowego zwierzaka</small>
    </div>
  </>
}

function Gra({ doPowtorki, onOdpowiedz, onKoniec }) {
  const [zadania, setZadania] = useState(() => nowaRunda(doPowtorki))
  const [i, setI] = useState(0)
  const [wyniki, setWyniki] = useState([])
  const [odp, setOdp] = useState(null) // { n, stan: 'ok' | 'zle' | 'popraw' } — gdy ustawione, klawiatura zablokowana
  const [komunikat, setKomunikat] = useState(null) // null = pytanie do zadania

  const z = zadania[i]
  const [a, op, b, c] = z.liczby
  const pytanie = z.luka === 3 ? 'Ile to jest? 🤔' : 'Jakiej liczby brakuje? 🤔'

  function dalej(zad, wyn) {
    if (i + 1 >= zad.length) return onKoniec(wyn, zad.length)
    setI(i + 1)
    setOdp(null)
    setKomunikat(null)
  }

  function odpowiedz(n) {
    if (odp) return
    const dobra = dobraOdpowiedz(z)
    onOdpowiedz(z, n === dobra)
    if (n === dobra) {
      const wyn = [...wyniki, true]
      setWyniki(wyn)
      setOdp({ n, stan: 'ok' })
      setKomunikat(POCHWALY[los(0, POCHWALY.length - 1)] + ' ⭐')
      dzwiekDobrze()
      setTimeout(() => dalej(zadania, wyn), 900)
    } else {
      const wyn = [...wyniki, false]
      const zad = [...zadania]
      zad.push(noweZadanie('+', zad))
      zad.push(noweZadanie('-', zad))
      setWyniki(wyn)
      setZadania(zad)
      setOdp({ n, stan: 'zle' })
      setKomunikat('Ups! +2 przykłady 💪')
      dzwiekZle()
      setTimeout(() => { setOdp({ n: dobra, stan: 'popraw' }); setKomunikat(`Dobrze jest: ${dobra}`) }, 700)
      setTimeout(() => dalej(zad, wyn), 2600)
    }
  }

  const pole = (v, idx) => idx === z.luka
    ? <span className={`luka ${odp ? odp.stan + ' pop' : ''}`} key={odp?.stan}>{odp ? odp.n : '?'}</span>
    : <span>{v}</span>

  return <>
    <div className="postep">
      {zadania.map((_, k) =>
        <i key={k} className={k < i ? (wyniki[k] ? 'ok' : 'zle') : k === i ? (wyniki[k] === undefined ? 'teraz' : wyniki[k] ? 'ok' : 'zle') : ''} />)}
    </div>
    <div className="card">
      <div className={`dzialanie ${odp?.stan === 'zle' ? 'trzes' : ''}`}>
        {pole(a, 0)}<span>{op === '-' ? '−' : '+'}</span>{pole(b, 2)}<span>=</span>{pole(c, 3)}
      </div>
      <div className="komunikat">{komunikat ?? pytanie}</div>
    </div>
    <div className={`klawiatura ${odp ? 'czeka' : ''}`}>
      {[...Array(11).keys()].map(n =>
        <button key={n} className={n === 10 ? 'dziesiec' : ''} style={{ background: KOLORY[n % KOLORY.length], color: n % KOLORY.length === 2 ? 'var(--tekst)' : '#fff' }}
          onClick={() => odpowiedz(n)}>{n}</button>)}
    </div>
  </>
}

function Koniec({ wynik, onDalej }) {
  const { bledy, bonus, zdobyte, nowyZwierzak } = wynik
  const konfetti = useMemo(() => Array.from({ length: 40 }, (_, k) => ({
    znak: ['⭐', '🎉', '🌟', '🎈', '🌈', '✨'][k % 6],
    left: Math.random() * 100 + 'vw',
    animationDuration: 1.8 + Math.random() * 1.8 + 's',
    animationDelay: Math.random() * 0.6 + 's',
  })), [])

  return <>
    {konfetti.map(({ znak, ...style }, k) => <span key={k} className="konfetti" style={style}>{znak}</span>)}
    <div className="card">
      <div className="maskotka">{bledy === 0 ? '🏆' : '🎉'}</div>
      <h1>{bledy === 0 ? 'Bez ani jednego błędu!' : 'Gotowe! Udało się!'}</h1>
      <div className="nagroda">+{zdobyte} ⭐</div>
      <small>{bonus ? `w tym +${bonus} za bezbłędną rundę` : `Błędy: ${bledy}`}</small>
      {nowyZwierzak && <div className="nowy">
        <span className="nowy-zwierzak">{nowyZwierzak}</span>
        <b>Nowy przyjaciel w zoo!</b>
      </div>}
    </div>
    <button className="big-btn" onClick={onDalej}>Dalej ➜</button>
  </>
}
