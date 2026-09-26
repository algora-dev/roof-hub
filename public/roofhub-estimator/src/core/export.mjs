import { unitLabel, roofName, existingName } from './model.mjs';
export const escapeHtml = value => String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export const numericFormat = value => Number(value).toLocaleString('en-NZ',{maximumFractionDigits:2});
export const formatMoney = (value, decimals=0) => new Intl.NumberFormat('en-NZ',{style:'currency',currency:'NZD',minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(value);
export function shownRange(estimate,tax='incl') {return tax==='incl'?estimate.total:estimate.subtotal;}
export function formatRange(range,roundOutward=false) {
  if(!range) return '—';
  const low=roundOutward?Math.floor(range.min/100)*100:range.min;
  const high=roundOutward?Math.ceil(range.max/100)*100:range.max;
  return `${formatMoney(low)} – ${formatMoney(high)}`;
}
export function projectExport(project,estimate=null) {
  return {format:'roofhub-project',schemaVersion:1,exportedAt:new Date().toISOString(),project,estimate,
    privacy:'Measurements and custom rates only. Uploaded plan images and contact details are not included in this project export.'};
}
function cell(value) {
  let text=String(value??'');
  // CSV formula injection prevention, including spreadsheet whitespace bypasses.
  if(/^[\s]*[=+\-@]/.test(text)) text=`'${text}`;
  return `"${text.replaceAll('"','""')}"`;
}
export function estimateCsv(project,estimate) {
  const rows=[['RoofHub detailed estimate — not a quote'],['Project',project.name||'Untitled project'],['Rate card',estimate.rateCardId],['Status',estimate.complete?'Priced scope':'Partial estimate — unpriced items remain'],['All line amounts below exclude GST'],[],
    ['Section','Item','Quantity','Unit','Low NZD excl GST','High NZD excl GST','Status','Notes']];
  for(const l of estimate.lines) rows.push([l.section,l.label,Number(l.quantity.toFixed(4)),unitLabel(l.unit),l.amount.min.toFixed(2),l.amount.max.toFixed(2),l.missing.length?'Partial':l.status,l.note]);
  rows.push([],['Subtotal excl GST','','','',estimate.subtotal.min.toFixed(2),estimate.subtotal.max.toFixed(2)],['GST','','','',estimate.tax.min.toFixed(2),estimate.tax.max.toFixed(2)],['Total incl GST','','','',estimate.total.min.toFixed(2),estimate.total.max.toFixed(2)],[],['Unpriced items']);
  for(const x of estimate.unpriced) rows.push([x.label,x.reason]);
  rows.push([],['Assumptions / exclusions']);
  for(const x of [...estimate.assumptions,...estimate.notes,...estimate.exclusions]) rows.push([x]);
  return '\ufeff'+rows.map(row=>row.map(cell).join(',')).join('\r\n');
}
export function printableHtml(project,estimate) {
  const e=escapeHtml; const title=estimate.complete?'Estimated cost range':'Priced subtotal · incomplete scope';
  return `<!doctype html><html lang="en-NZ"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>RoofHub estimate</title><style>
  body{font:14px/1.6 system-ui,sans-serif;color:#1e2928;max-width:920px;margin:40px auto;padding:0 24px}h1{font-size:36px;line-height:1.1}h2{margin-top:30px}header{border-bottom:2px solid #235851;padding-bottom:20px}small,.muted{color:#56655f}.range{font-size:36px;font-weight:650;letter-spacing:-1px}table{border-collapse:collapse;width:100%}td,th{padding:10px 8px;border-bottom:1px solid #ddd;text-align:left}td:last-child,th:last-child{text-align:right}.warning{background:#faf0da;padding:14px;border:1px solid #dfc78e}tr{break-inside:avoid}@media print{body{margin:0;padding:0}button{display:none}thead{display:table-header-group}h2{break-after:avoid}}@page{size:A4;margin:16mm}</style></head><body>
  <header><strong>RoofHub</strong><span class="muted"> / Detailed roof estimate</span><h1>${e(project.name||'Your roofing project')}</h1><p>${project.projectType==='reroof'?'Re-roof':'New roof'} · ${e(roofName(project.roofSystem))} · ${numericFormat(estimate.roofArea)} m² actual roof surface</p></header>
  <h2>${title}</h2><div class="range">${formatRange(shownRange(estimate,project.displayTax),true)}</div><p>NZD ${project.displayTax==='incl'?'including':'excluding'} GST. Headline rounded outwards to the nearest $100. This is a budget estimate, not a formal quote.</p>
  ${!estimate.approved?'<p class="warning">Preliminary pricing: material/scaffold allowances and GST treatment still require confirmation. Use this result for planning, not as a quote.</p>':''}
  <h2>Measured and priced scope</h2><p class="muted">The detailed line amounts below exclude GST.</p><table><thead><tr><th>Item</th><th>Quantity</th><th>Amount range</th></tr></thead><tbody>${estimate.lines.map(l=>`<tr><td>${e(l.label)}${l.missing.length?'<br><small>Partially priced</small>':''}</td><td>${numericFormat(l.quantity)} ${unitLabel(l.unit)}</td><td>${formatRange(l.amount)}</td></tr>`).join('')}</tbody></table>
  <p><strong>Subtotal:</strong> ${formatRange(estimate.subtotal)}<br><strong>GST:</strong> ${formatRange(estimate.tax)}<br><strong>Total incl GST:</strong> ${formatRange(estimate.total)}</p>
  ${estimate.unpriced.length?`<h2>Not yet priced</h2>${estimate.unpriced.map(x=>`<p><strong>${e(x.label)}:</strong> ${e(x.reason)}</p>`).join('')}`:''}
  <h2>Assumptions and exclusions</h2>${[...estimate.assumptions,...estimate.notes,...estimate.exclusions].map(x=>`<p>${e(x)}</p>`).join('')}
  <footer><p class="muted">Rate card ${e(estimate.rateCardId)} · Estimate ${e(estimate.projectId)} · ${e(estimate.createdAt.slice(0,10))}</p><button onclick="window.print()">Print / save as PDF</button></footer></body></html>`;
}
export function downloadText(name,text,type='application/json') {
  const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function enquiryPayload(project,estimate,contact) {
  return {schemaVersion:1,type:'roofhub-quote-request',createdAt:new Date().toISOString(),contact:{name:contact.name.trim(),email:contact.email.trim(),phone:contact.phone.trim(),location:contact.location.trim(),notes:contact.notes.trim()},
    consent:{shareWithRoofHubAndPartner:true,version:'roofhub-quote-consent-v1',at:new Date().toISOString()},
    project:projectExport({...project,rateOverrides:{}},estimate),customRateCardRedacted:true,measurementsRequireVerification:true};
}
