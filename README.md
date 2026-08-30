
## Responsiv design och Mobile First

Hemsidan är utvecklad enligt principen **Mobile First**. Det innebär att grundläggande CSS är utformad för små skärmar (mobiler) utan några `@media`-queries. Därefter byggs upplevelsen stegvis ut med brytpunkter (*breakpoints*) för större skärmar som surfplattor och datorskärmar.

### Kodexempel (CSS Grid & Media Queries)

Följande kod från `css/style.css` visar hur rutnätet för album och medlemmar anpassar sig dynamiskt efter användarens skärmbredd:

```css
/* 1. MOBILVY (Base Styles / Standard): 
   Enkelkolumn för maximal läsbarhet på små skärmar */
.albums-grid, 
.members-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
}

/* 2. TABLETVY (Surfplattor >= 768px): 
   Bryts ut till 2 kolumner när utrymme finns */
@media (min-width: 768px) {
    .albums-grid, 
    .members-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
    }
}

/* 3. DESKTOPVY (Datorskärmar >= 1024px): 
   3 kolumner för effektivt utnyttjande av storskärm */
@media (min-width: 1024px) {
    .albums-grid, 
    .members-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

```

### Förklaring av anpassningen

1. **Mobilvy (1fr):** I grundutförandet visas innehållet i en enda kolumn (`1fr`). Detta säkerställer att korten tar upp tillgänglig bredd utan att skapa horisontell scroll, vilket ger optimal läsbarhet och enkla klickytor på mobila enheter.
2. **Tabletvy (`@media (min-width: 768px)`):** När skärmytan nått minst 768px aktiveras brytpunkten som delar upp innehållet i två lika breda kolumner (`repeat(2, 1fr)`). Avståndet mellan korten (`gap`) ökas också till `2rem` för en luftigare layout.
3. **Desktopvy (`@media (min-width: 1024px)`):** På breda skärmar (från 1024px och uppåt) utökas rutnätet till tre kolumner (`repeat(3, 1fr)`). Det gör att fler objekt visas parallellt utan att enskilda kort blir oproportionerligt breda.

---

### Förslag på framtida förbättringar

För att utveckla den responsiva anpassningen ytterligare finns det två huvudsakliga förbättringsområden:

* **Pendlingsfri layout med `auto-fit` och `minmax()`:**
Istället för fasta brytpunkter vid 768px och 1024px kan CSS Grid ställas in helt flytande:
```css
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));

```


Detta gör att korten automatiskt anpassar antalet kolumner steglöst baserat på tillgängligt utrymme, vilket eliminerar behovet av manuella `@media`-queries för rutnätet.
* **Responsiv typografi med `clamp()`:**
Genom att använda CSS-funktionen `clamp()` för rubriker (t.ex. `font-size: clamp(1.8rem, 4vw, 3rem);`) skalar textstorleken mjukt mellan mobil och desktop istället för att ändras i plötsliga steg vid specifika brytpunkter.
