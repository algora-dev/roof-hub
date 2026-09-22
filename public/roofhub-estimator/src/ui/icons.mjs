// Original, replaceable inline SVG UI symbols. No external image/font requests.
const paths={
  arrow:'M5 12h14m-5-5 5 5-5 5',back:'M19 12H5m5-5-5 5 5 5',check:'m5 12 4 4L19 6',plus:'M12 5v14M5 12h14',close:'m6 6 12 12M6 18 18 6',
  home:'m3 11 9-8 9 8M5 10v10h14V10M10 20v-6h4v6',reroof:'M4 11 9 3l9 8M5 10v10h14v-5M16 3h5v5M21 3l-5 5',
  ruler:'m3 15 12-12 6 6L9 21zM7 11l3 3m1-7 3 3m1-7 3 3',plan:'M5 3h10l4 4v14H5zM14 3v5h5M8 12h8M8 16h5',
  shield:'m12 3 8 3v6c0 4-4 7-8 9-4-2-8-5-8-9V6zM8 12l3 3 5-6',lock:'M6 10h12v11H6zM8 10V7a4 4 0 0 1 8 0v3',
  info:'M12 11v6M12 7v.1',download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',upload:'M12 17V3m-5 5 5-5 5 5M4 17v4h16v-4',
  trash:'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 10v7m4-7v7',edit:'m4 16 12-12 4 4L8 20H4zM13 7l4 4',
  building:'M5 21V3h14v18M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3',
  layers:'m12 3 10 6-10 6L2 9zM2 13l10 6 10-6M2 17l10 6 10-6',spark:'m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',
  chevron:'m9 5 7 7-7 7',down:'m5 9 7 7 7-7',clock:'M12 7v5l4 2',mail:'M3 5h18v14H3zM3 5l9 8 9-8',
  print:'M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6zM17 12h1',undo:'M8 4 3 9l5 5M3 9h11a6 6 0 0 1 0 12',redo:'m16 4 5 5-5 5M21 9H10a6 6 0 0 0 0 12',
  pan:'M8 13V5a2 2 0 0 1 4 0v7M12 7a2 2 0 0 1 4 0v6M16 9a2 2 0 0 1 4 0v7c0 4-3 6-7 6-3 0-5-2-7-5l-3-5a2 2 0 0 1 3-2l2 3',
  zoom:'M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12m5 11 6 6M7 10h6m-3-3v6',minus:'M5 12h14',target:'M3 12h18M12 3v18',
};
export function icon(name,cls='') {
  const circle=['info','clock'].includes(name)?'<circle cx="12" cy="12" r="9"/>':'';
  return `<svg class="rh-icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${circle}<path d="${paths[name]||paths.home}"/></svg>`;
}
export function roofProfile(id) {
  let drawing='';
  if(id==='corrugate') {
    for(let y=0;y<4;y++) drawing+=`<path d="M22 ${48+y*11}q7-16 14 0t14 0t14 0t14 0t14 0t14 0"/>`;
  } else if(id==='five-rib') {
    for(let y=0;y<4;y++) drawing+=`<path d="M18 ${50+y*10}h11l4-10h5l4 10h13l4-10h5l4 10h13l4-10h5l4 10h13"/>`;
  } else if(id==='pressed-metal') {
    for(let row=0;row<3;row++) for(let x=0;x<4;x++) drawing+=`<path d="M${22+x*23+row*2} ${38+row*17}h21v14q-10 8-21 0z"/>`;
  } else {
    drawing='<path d="m20 84 24-55h68L90 84z"/><path d="m39 84 24-55m1 55 24-55M44 29l2 4m17-4 2 4m23-4 2 4"/><path d="m42 84 24-55m1 55 24-55"/>';
  }
  return `<svg class="rh-profile" viewBox="0 0 132 112" fill="none" aria-hidden="true"><path d="M10 98h112" stroke="currentColor" opacity=".1"/><g stroke="currentColor" stroke-width="1.5" stroke-linejoin="round">${drawing}</g></svg>`;
}
export function houseDrawing() {
  return `<svg class="rh-house-drawing" viewBox="0 0 280 190" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.1"><path d="m29 104 92-62 130 49-91 64z" opacity=".18"/><path d="m29 104 48-64 93-22 81 73-91 64z"/><path d="m77 40 83 76 91-25M160 116v39M29 104v27l131 49 91-62V91M160 155v25"/><path d="m43 90 91 34M52 79l91 34M61 66l91 34M69 55l92 35M84 38l84 75m-66-80 80 70m-61-74 75 66m-56-70 69 62m-51-66 63 58" opacity=".3"/><path d="M64 118v21l26 10v-22zM194 142v-20l29-20v20" opacity=".5"/><path d="m24 155 126 48m35-2 74-49" stroke-dasharray="3 4" opacity=".35"/></g></svg>`;
}
