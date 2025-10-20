// sample cases: each case = {id,title,meta,pages: [pageHtmlStrings], revealIsSpoiler:true/false}
const CASES = [
  {
    id: "case-001",
    title: "The Lantern House — December Fog",
    meta: "Rural town • Victim: Marisol Reyes • Age 34",
    pages: [
      `<div class="case-page"><div class="case-title">The Lantern House — Case File</div>
       <div class="case-meta">December 1, 2023  ·  Lakeside village</div>
       <div class="case-text">Marisol Reyes was found alive but unconscious in her kitchen beside a single broken lantern. Neighbors say the lights in the area flickered that night. Her phone shows a 1-minute call to an unknown number at 10:47 PM. The door was locked from inside. There were muddy boot prints leading to the backdoor; the garden gate had scrape marks low to the left.</div></div>`
      ,
      `<div class="case-page"><div class="case-text">Evidence:
       • Lantern (broken) — soot pattern concentrated on right side.
       • Phone: incoming call from +62 8**-****; last message draft unsent: "I saw you with—"
       • Garden: soil disturbed near the old elm; cigarette butt with brand "Kestrel" (local brand)</div></div>`
      ,
      `<div class="case-page"><div class="case-text">Witness statements:
       • Neighbor Ana: "I saw someone in a grey coat at 10:30 heading toward the lake."
       • Mail carrier: "Package delivered earlier that day, handwriting looked rushed."
       • Ex-partner note: "We argued about the lighthouse light shift last week."</div></div>`
    ],
    // last page reveal content — it will be appended as final page
    reveal: `<div class="case-page"><div class="case-title">CASE RESOLUTION</div>
             <div class="case-text">The killer: <strong>Diego Almoro</strong> — Marisol's colleague. Motive: a secret ledger showing he diverted funds; he visited the Lantern House at night to recover a ledger but left an overturned lantern that started a small smoke, causing the scramble. The phone draft was from Marisol about confronting Diego. The muddy boot print matched Diego's boot tread; cigarette brand traced to his pack.</div></div>`
  },

  {
    id: "case-002",
    title: "Midnight Backlot — The Camera Reel",
    meta: "City district • Victim: Tomas Velasquez • Age 27",
    pages: [
      `<div class="case-page"><div class="case-title">Midnight Backlot — Case File</div>
       <div class="case-meta">June 18, 2024  ·  Abandoned cinema alley</div>
       <div class="case-text">Tomas, an indie cinematographer, was found with his camera bag open. The last footage contains 12 seconds of static and a shadow moving across the frame. His calendar shows a meeting with "Aleph" at 9:00 PM. A theater ticket stub with seat 13 was in his jacket.</div></div>`
      ,
      `<div class="case-page"><div class="case-text">Evidence:
       • Camera memory: corrupted but first 4 frames show a silver cufflink with engraved initials.
       • Ticket stub: "Palacio Cinema" — seat 13, 21:00.
       • Texts: "Don't come alone" — from unknown number.</div></div>`
      ,
      `<div class="case-page"><div class="case-text">Leads:
       • Alley spray-painted with symbol of an eye within a hexagon.
       • Tomas owed money to a local collector.
       • Cufflink engraving looks like "R.M."</div></div>`
    ],
    reveal: `<div class="case-page"><div class="case-title">CASE RESOLUTION</div>
             <div class="case-text">The killer: <strong>Raffi Mercado</strong> — a local collector who forced Tomas to deliver a film reel. The cufflink matched Raffi's suit, and surveillance near Palacio Cinema captured him leaving seat 13. Motive: debt and a private reel Tomas refused to hand over.</div></div>`
  },

  {
    id: "case-003",
    title: "Station B—The Late Shift",
    meta: "Metro train station • Victim: Unknown (John Doe)",
    pages: [
      `<div class="case-page"><div class="case-title">Station B — Case File</div>
       <div class="case-meta">April 2, 2022  ·  Eastern Line</div>
       <div class="case-text">A body was found at 02:12 on platform B2 near the turnstiles. No ID. Wallet empty. Witnesses heard a muffled argument at 01:58 involving a woman saying "You promised". The station clerk remembers a man buying a coffee at 1:45 with exact change — a habit.</div></div>`,
      `<div class="case-page"><div class="case-text">Evidence:
       • A torn commuter pass with handwriting "M. Torres".
       • Scuff marks on platform edge consistent with a fight.
       • A folded receipt for coffee shop "Arco" dated 01:45, paid exact 55.00</div></div>`
    ],
    reveal: `<div class="case-page"><div class="case-title">CASE RESOLUTION</div>
             <div class="case-text">The killer: <strong>Marcela Torres</strong> — whose torn pass matched the receipt name, and the argument witnesses recalled. She admitted a scuffle when the victim threatened to expose her embezzlement; an altercation led to the fatal fall. The "exact change" habit matched Marcela's transaction history at Arco.</div></div>`
  }
];

// utilities
const casesRoot = document.getElementById('cases');
const reader = document.getElementById('reader');
const pageContainer = document.getElementById('pageContainer');
const pageCounter = document.getElementById('pageCounter');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const closeReader = document.getElementById('closeReader');
const downloadBtn = document.getElementById('downloadBtn');

let currentCase = null;
let currentIndex = 0;
let pagesForRender = [];

function makeCard(c){
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <h3>${c.title}</h3>
    <p class="small">${c.meta}</p>
    <p>${(c.pages[0].replace(/<[^>]*>?/gm,'').slice(0,140))}…</p>
    <div class="actions">
      <button class="btn open">Open</button>
      <button class="btn" data-id="${c.id}" onclick="downloadCasePdf('${c.id}')">Download PDF</button>
    </div>
  `;
  el.querySelector('.open').addEventListener('click', ()=> openCase(c.id));
  return el;
}

function renderCards(){
  casesRoot.innerHTML = '';
  CASES.forEach(c => casesRoot.appendChild(makeCard(c)));
}

function openCase(id){
  const c = CASES.find(x=>x.id===id);
  if(!c) return;
  currentCase = c;
  // pages to render: original pages + reveal appended
  pagesForRender = [...c.pages];
  if(c.reveal) pagesForRender.push(c.reveal);
  currentIndex = 0;
  showPage();
  reader.classList.remove('hidden');
  reader.setAttribute('aria-hidden','false');
}

function showPage(){
  const html = pagesForRender[currentIndex];
  pageContainer.innerHTML = html;
  pageCounter.textContent = `${currentIndex+1} / ${pagesForRender.length}`;
  prevBtn.disabled = currentIndex===0;
  nextBtn.disabled = currentIndex===pagesForRender.length-1;
}

prevBtn.addEventListener('click', ()=>{
  if(currentIndex>0){ currentIndex--; showPage(); }
});
nextBtn.addEventListener('click', ()=>{
  if(currentIndex < pagesForRender.length-1){ currentIndex++; showPage(); }
});

closeReader.addEventListener('click', ()=>{ reader.classList.add('hidden'); reader.setAttribute('aria-hidden','true'); });

// PDF generation using html2canvas + jsPDF
async function generatePdfFromPages(pageHtmlArray, filename){
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({orientation:'p', unit:'mm', format:'a4'});
  // A4 size in mm
  const a4Width = 210;
  const a4Height = 297;
  for(let i=0;i<pageHtmlArray.length;i++){
    const pageHtml = pageHtmlArray[i];
    // create a temporary container with same styling
    const tmp = document.createElement('div');
    tmp.style.width = '720px'; // render width
    tmp.style.padding = '28px';
    tmp.style.background = '#0b0c0e';
    tmp.style.color = '#e7eef8';
    tmp.style.fontFamily = 'Inter, system-ui, Arial';
    tmp.innerHTML = pageHtml;
    document.body.appendChild(tmp);

    // render to canvas
    // scale to improve quality
    const scale = 2;
    const canvas = await html2canvas(tmp, {scale: scale, backgroundColor: null});
    const imgData = canvas.toDataURL('image/png');

    // compute image dims in mm while preserving ratio
    const imgWidthMm = a4Width;
    const pxToMm = (imgWidthMm) / (canvas.width);
    const imgHeightMm = canvas.height * pxToMm;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMm, imgHeightMm);
    if(i < pageHtmlArray.length - 1) pdf.addPage();
    tmp.remove();
  }

  pdf.save(filename);
}

// hook download button inside modal for current case
downloadBtn.addEventListener('click', async ()=>{
  if(!currentCase) return;
  const filename = `${currentCase.id}-${currentCase.title.replace(/\s+/g,'_')}.pdf`;
  await generatePdfFromPages(pagesForRender, filename);
});

// quick download from grid button
async function downloadCasePdf(id){
  const c = CASES.find(x=>x.id===id);
  if(!c) return;
  const pages = [...c.pages];
  if(c.reveal) pages.push(c.reveal);
  const filename = `${c.id}-${c.title.replace(/\s+/g,'_')}.pdf`;
  await generatePdfFromPages(pages, filename);
}

// initial render
renderCards();
