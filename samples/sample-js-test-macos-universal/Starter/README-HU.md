# JavaScript mintazárthelyi – A világirodalom nagyjai

## Tudnivalók

A mintazárthelyi három, egymástól független feladatból áll, összesen **40 pontért (12 + 14 + 14)**.

A világirodalom legnagyobb alakjai idén egy különleges irodalmi fesztiválra gyűlnek össze. A szervezők azonban kissé elvesztek a regények, verseskötetek és vaskos klasszikusok rengetegében. A könyvtár nyilvántartása még átláthatatlan, az ünnepi olvasóest programja nem készült el, a kiállítóteremben pedig a könyvek egyelőre rendezetlenül várják méltó helyüket.

**A fesztivál megnyitójáig már nincs sok idő, segíts rendet teremteni a világirodalom remekművei között!**

## 1. Könyvtári körkép (task-1, 12 pont)

A fesztivál könyvtárába a világirodalom számos híres szerzőjének művei érkeztek, a könyvtárosok azonban a rengeteg kötet között már alig igazodnak el. Többek között szeretnék megtudni, kik írták a leghosszabb regényeket, mely művek születtek több mint egy évszázada, és hány oldalnyi olvasnivaló gyűlt össze összesen.

**Segíts a könyvtárosoknak eligazodni a gyűjteményben, és válaszold meg a kérdéseiket az adatok alapján!**

Alapértelmezés szerint az angol `dataEN.js` töltődik be. Magyar adatokhoz az `index.html` fájlban a `data.js` szkriptet töltsd be helyette! A 2–3. feladat magyar státuszüzeneteihez állítsd a dokumentum nyelvét `lang="hu"` értékre.

A `data.js` fájl `authors` tömbje a következőket tartalmazza:

- a szarző neve (`name`)
- a szerző nyelve (`language`)
- a szerző könyvei (`books`), minden könyv tartalmazza:
  - a címet (`title`)
  - megjelenési évet (`year`)
  - oldalszámot (`pages`)
  - műfajlistát (`genres`)

Oldd meg az alábbi feladatokat:

- a. (1 pont) A `#taskA` elembe írd ki, van-e olyan szerző, akinek legalább két, 1900 előtt megjelent könyve szerepel!
- b. (2 pont) A `#taskB` elembe írd ki, minden szerzőnek van-e legalább egy olyan könyve, amelynek műfajai között szerepel a `regény`!
- c. (2 pont) A `#taskC` elembe írd ki azon szerzők nevét, akiknek van 500 oldalnál hosszabb, `regény` műfajú könyve!
- d. (2 pont) A `#taskD` elembe írd ki a felsorolt könyvek összesített oldalszámát!
- e. (2 pont) A `#taskE` elembe írd ki annak a szerzőnek a nevét, akinek a könyvei összesen a legtöbb oldalt teszik ki! Holtversenyben az adatokban előbb szereplő szerző nyer.
- f. (3 pont) A `#taskF` elembe írd ki az 1900 előtt megjelent, `regény` műfajú könyvek átlagos oldalszámát két tizedesjeggyel! Egy könyv akkor is csak egyszer számít, ha több műfaja van.

## 2. Olvasóest-tervező (task-2, 14 pont)

A fesztivál szervezői egy nagyszabású olvasóesttel szeretnék megkoronázni az eseményt. A lelkes műsorvezető azonban legszívesebben az egész világirodalmat felolvasná egyetlen este alatt, ami még a legkitartóbb közönség türelmét is próbára tenné. Ráadásul a kiválasztott könyvek között akadnak igazi féltéglák is, így nem mindegy, milyen tempóban halad a felolvasás.

**Segíts összeállítani az est programját, és derítsd ki, belefér-e minden a rendelkezésre álló időbe, mielőtt a közönség az utolsó fejezet helyett a kijáratot kezdené keresni!**

A feladathoz nem tartozik adatfájl, minden szükséges elem megtalálható az `index.html`-ben. A fontosabb elemeket az `index.js` elején már kiválasztottuk, a megoldásodat ebbe a fájlba írd! Az `index.css` tartalmazza a szükséges stílusokat. Ebben a feladatban közvetlen eseménykezelőket használj!

Oldd meg az alábbi feladatokat:

- a. (1 pont) A `#add-work` gomb megnyomására a `#work-input` mezőbe írt könyvcímet vedd fel új listaelemként (`li`) a `#reading-list` listába!
- b. (2 pont) Ellenőrizd a felvett címeket!
  - (1 pont) A beírt szöveg elejéről és végéről távolítsd el a szóközöket (`trim()`)! Üres vagy csak szóközökből álló címet ne lehessen felvenni!
  - (1 pont) A listában már szereplő címet kis- és nagybetűtől függetlenül ne lehessen újra felvenni! A szövegen belüli szóközöket nem kell módosítani. Sikeres felvétel után ürítsd ki a beviteli mezőt, elutasításkor maradjon meg a tartalma!
- c. (1 pont) A `#work-count` elemben mindig a listában lévő címek száma látszódjon! Legfeljebb négy cím lehet a listában: ha elértük a négyet, a `#add-work` gomb legyen letiltva (`disabled`)! A felvételt végző eseménykezelő se engedjen négynél több elemet felvenni!
- d. (1 pont) A `#edition` legördülő lista változásakor (`change` esemény) cseréld le a borítóképet (`img#cover`) a kiválasztott kiadáséra! Az `option` elemek `value` attribútuma a kép elérési útja: ezt írd a kép `src` attribútumába, az opció szövegét pedig az `alt` attribútumába!
- e. (2 pont) A `#minutes` csúszka mozgatásakor (`input` esemény) jelenítsd meg a rendelkezésre álló időt!
  - (1 pont) Írd ki a csúszka aktuális értékét a `#minutes-value` elembe!
  - (1 pont) Állítsd a `#time-bar` elem magasságát (`height`) ennyi pixelre!
- f. (2 pont) A `#pace` csúszka mozgatásakor (`input` esemény) jelenítsd meg az olvasás sebességét!
  - (1 pont) Írd ki a csúszka aktuális értékét a `#pace-value` elembe, és állítsd mindkét `page` stílusosztályú `span` elem szélességét (`width`) az érték húszszorosára, pixelben!
  - (1 pont) Ha a sebesség legalább 4 oldal/perc, mindkét oldal kapja meg a `fast` stílusosztályt, egyébként kerüljön le róluk!
- g. (4 pont) A `#check` gomb megnyomására döntsd el, belefér-e a program az időkeretbe!
  - (1 pont) Ha a lista üres, a `#status` elembe írd ki: `Előbb adj meg legalább egy címet!` A `#planner` elem ne kapja meg a `ready` stílusosztályt, és ne tilts le egyetlen vezérlőt sem!
  - (1 pont) Egyébként számold ki a szükséges időt: `szükséges idő = kiválasztott könyv oldalszáma / olvasási sebesség + címek száma * 5`. Az oldalszámot a `#edition` lista éppen kiválasztott `option` elemének `data-pages` attribútuma tartalmazza. A kiválasztott kiadás egy közös felolvasási kötet, a listában szereplő címek egyenként ötperces bevezetőt jelentenek.
  - (1 pont) Ha a rendelkezésre álló idő legalább a szükséges idő, a `#planner` elem kapja meg a `ready` stílusosztályt, a `#status` tartalma pedig legyen `A program belefér! (X perc)`! Egyébként a `ready` stílusosztály ne legyen rajta, és a `#status` tartalma legyen `Rövid az időkeret! (X perc)`!
  - (1 pont) Az `X` helyére a szükséges időt írd két tizedesjegyre kerekítve (pl. `A program belefér! (85.00 perc)`)! Az összehasonlításhoz a kerekítetlen értéket használd!
- h. (1 pont) Sikeres ellenőrzés után a két csúszka, a kiadásválasztó, a címmező, a hozzáadó és az ellenőrző gomb legyen letiltva (`disabled`)! Sikertelen próbálkozás után lehessen tovább szerkeszteni a programot!

A csúszkák kijelzőinek kezdőértékét és a szemléltető elemek kezdeti méretét az `index.html` már tartalmazza, ezeket nem kell külön beállítanod.

## 3. Könyvek visszapakolása (task-3, 14 pont)

A világirodalmi fesztivál véget ért, a vendégek hazamentek, a szervezők pedig elégedetten hátradőltek. Egyetlen apróságról feledkeztek meg: a kiállított könyvek még mindig a rendezőasztalon hevernek, és a könyvtáros már a felmondását fontolgatja. Szerencsére minden írónak saját polca van, így csak azt kell kideríteni, melyik kötet hová tartozik.

**Segíts visszapakolni a könyveket a megfelelő polcokra!** Az asztalon nyugodtan rendezgetheted őket, de vigyázz: ami egyszer a helyére került, ahhoz már nem nyúlunk. Ha minden könyv visszatalált a szerzőjéhez, végre a könyvtáros is hazamehet...remélhetőleg még a következő fesztivál előtt!

A megoldásodat az `index.js` fájlba írd! A `data.js` fájlban megadott `library` objektumhoz már hozzáférsz. Az objektum adatai:

- a térkép sorainak (`rows`) és oszlopainak (`cols`) száma,
- a polcok tömbje (`shelves`): minden polchoz tartozik egy szerzőnév (`author`), sorindex (`row`) és oszlopindex (`col`),
- a könyvek tömbje (`books`): minden könyvnek van címe (`title`), szerzője (`author`), sorindexe (`row`) és oszlopindexe (`col`).

A sor- és oszlopindexek nullától indulnak. Kezdetben minden könyv külön cellában van, egyik sem polcon. Minden szerzőhöz pontosan egy polc tartozik, azon az összes könyve elfér.

A térképet az üres `#map` táblázatba generáld! A táblázatban találsz egy HTML-mintát megjegyzésként. A szükséges stílusok az `index.css` fájlban vannak. A polcok és a könyvek szerzőjét a CSS a `data-author` attribútum alapján jeleníti meg.

A kezdőcsomagban megadtuk a `delegate(parent, child, when, what)` segédfüggvényt: a `parent` elemen kezeli a `when` típusú eseményt, és a `child` szelektorra illeszkedő elemhez meghívja a `what(event, elem)` függvényt. A kattintásokat **delegálással** kezeld!

- Generálás
  - a. (1 pont) Generálj a `#map` táblázatba `rows` darab sort (`tr`), mindegyikben `cols` darab cellával (`td`)!
  - b. (2 pont) Jelenítsd meg a polcokat a saját cellájukban (a polc `row` sorában és `col` oszlopában)! Egy cellát így is elérhetsz: `table.rows[sor].cells[oszlop]`.
    - (1 pont) A megfelelő cella kapja meg a `shelf` stílusosztályt!
    - (1 pont) A `data-author` attribútumába írd a polchoz tartozó szerző nevét!
  - c. (2 pont) Minden könyvhöz generálj egy `book` stílusosztályú gombot (`button`) a saját cellájába!
    - (1 pont) A gomb `type` attribútuma `button`, szövege a könyv címe, `title` attribútuma pedig `Szerző: Cím` formátumú legyen (pl. `Jane Austen: Emma`)!
    - (1 pont) A gomb a megfelelő cellában legyen, és a `data-author` attribútumába írd a szerző nevét!
- Eseménykezelés
  - d. (2 pont) Egy könyvre kattintva az kapja meg a `selected` stílusosztályt, ha a már kijelölt könyvre kattintunk, kerüljön le róla!
    - (1 pont) A kijelölés ki-be kapcsolása működik.
    - (1 pont) Egyszerre legfeljebb egy könyv legyen kijelölve: másik könyvre kattintva az előző kijelölése szűnjön meg!
  - e. (2 pont) Ha van kijelölt könyv, és az asztal egy üres cellájára (nincs `shelf` stílusosztálya, és nincs benne könyv) kattintunk, a kijelölt könyv kerüljön át ebbe a cellába, majd a kijelölése szűnjön meg!
    - (1 pont) Az áthelyezés és a kijelölés megszüntetése működik.
    - (1 pont) Ha nincs kijelölt könyv, vagy az asztal cellájában már van könyv, ne történjen semmi! Könyvre kattintás csak a kijelölést kezelje, ne indítson áthelyezést!
    - Ha egy már az oldalon lévő elemet `appendChild`-dal egy másik elembe teszel, az áthelyeződik (nem másolódik).
  - f. (3 pont) Tedd a könyveket a helyükre!
    - (1 pont) Polcra kattintva a kijelölt könyv akkor kerüljön át oda, ha a könyv és a polc `data-author` értéke megegyezik! Sikeres áthelyezés után szűnjön meg a kijelölés! Más szerző polcára kattintva ne változzon semmi, a kijelölés is maradjon meg! Egy polcon több könyv is lehet.
    - (1 pont) Polcon lévő könyvet ne lehessen kijelölni vagy elmozdítani! Rákattintva egy másik, már kijelölt könyv se mozduljon el!
    - (1 pont) Amikor minden könyv polcra került, a `#status` elembe írd ki: `Minden könyv a helyén!` Addig az elem maradjon üres!
  - g. (2 pont) A d–f. részfeladatokat **delegálással** oldd meg! Az eseménykezelőket a `#map` táblázatra regisztráld!
    - (1 pont) A könyvekre kattintás (kijelölés).
    - (1 pont) A cellákra kattintás (áthelyezés és polcra helyezés).
