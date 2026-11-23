'use strict';
// Frontend demonstration only. Role selection is not authentication.
// window.name keeps fictional state across local HTML pages in the same tab.
const initialState = () => ({version:1,role:null,profile:{email:'alex.taylor@example.com',phone:'',address:''},requests:[]});
let state=initialState();
try { const saved=JSON.parse(window.name || '{}'); if(saved.nzftcDemo?.version===1) state=saved.nzftcDemo; } catch {}
// Extend V1 state without discarding the existing employee's demo changes.
state.employees ||= [
 {id:'EMP-DEMO-01',name:'Alex Taylor',email:state.profile.email,department:'Operations',job:'Coordinator',status:'Active',salary:78000,leave:20,history:'Joined Operations in 2024.',performance:'Sample annual review pending.',training:'Induction completed.'},
 {id:'EMP-DEMO-02',name:'Sam Chen',email:'sam.chen@example.com',department:'Finance',job:'Accounts officer',status:'Active',salary:65000,leave:15,history:'Joined Finance in 2025.',performance:'Sample objectives agreed.',training:'Spreadsheet workshop completed.'},
 {id:'EMP-DEMO-03',name:'Riley Morgan',email:'riley.morgan@example.com',department:'Customer Services',job:'Team coordinator',status:'Active',salary:72000,leave:18,history:'Joined in 2023.',performance:'Sample review scheduled.',training:'Customer service training.'}
];
state.company ||= {name:'New Zealand Finance and Trade Company',email:'people@example.com',phone:'',address:'Example office — demonstration only',description:'The NZFTC employee portal brings leave requests, payroll information and employee details into one interface.'};
state.events ||= [{id:'event-1',title:'Team catch-up',date:'2026-11-30',type:'Company event'},{id:'event-2',title:'End-of-year gathering',date:'2026-12-18',type:'Company event'}];
state.policy ||= {max:30,note:'Discuss planned time away with your manager before submitting a request.'};
state.paySettings ||= {frequency:'Fortnightly',deduction:20};
state.payRuns ||= [];
state.requests.forEach(r=>r.employeeId ||= 'EMP-DEMO-01');
const employee = id=>state.employees.find(e=>e.id===(id||'EMP-DEMO-01'));
const money = n=>new Intl.NumberFormat('en-NZ',{style:'currency',currency:'NZD'}).format(n);
const roundMoney=n=>Math.round((n+Number.EPSILON)*100)/100;
const save=()=>{window.name=JSON.stringify({nzftcDemo:state});};
const $=id=>document.getElementById(id);
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const balance=(id='EMP-DEMO-01')=>(employee(id)?.leave||0)-state.requests.filter(r=>r.employeeId===id&&r.status==='Approved'&&r.type==='Annual leave').reduce((n,r)=>n+r.days,0);
const reserved=(id='EMP-DEMO-01')=>state.requests.filter(r=>r.employeeId===id&&r.status==='Pending'&&r.type==='Annual leave').reduce((n,r)=>n+r.days,0);
function weekdays(start,end){let count=0;const date=new Date(start+'T12:00:00Z'),last=new Date(end+'T12:00:00Z');for(;date<=last;date.setUTCDate(date.getUTCDate()+1)){if(date.getUTCDay()!==0&&date.getUTCDay()!==6)count++;}return count;}
const page=document.body.dataset.page;
const employeePages=['dashboard.html','leave.html','payroll.html','profile.html'];
let allowed=true;
if(employeePages.includes(page)&&state.role!=='employee')allowed=false;
const adminPages=['admin.html','employees.html','admin-payroll.html','admin-leave.html','company.html'];
if(adminPages.includes(page)&&state.role!=='admin')allowed=false;
if(!allowed)$('page-content').innerHTML='<section class="card"><h1>Choose the right demo account</h1><p>This screen belongs to a different account view.</p><a class="button" href="login.html">Choose demo account</a></section>';
let links=[['MANAGE_NZFTC.html','Home']];
if(state.role==='employee')links.push(['dashboard.html','Dashboard'],['leave.html','Leave'],['payroll.html','Payroll'],['profile.html','Profile']);
if(state.role==='admin')links.push(['admin.html','Administration']);
links.push(['about.html','About / Contact'],['login.html',state.role?'Switch demo account':'Login']);
$('navigation').innerHTML=links.map(([url,title])=>`<a href="${url}" ${page===url?'aria-current="page"':''}>${title}</a>`).join('')+(state.role?'<button class="secondary" id="logout">Sign out</button>':'');
$('logout')?.addEventListener('click',()=>{state.role=null;save();location.href='MANAGE_NZFTC.html';});
$('reset').addEventListener('click',()=>{if(confirm('Reset all fictional demo changes?')){state=initialState();save();location.href='MANAGE_NZFTC.html';}});
$('demo-login')?.addEventListener('submit',event=>{event.preventDefault();state.role=$('role').value;save();location.href=state.role==='admin'?'admin.html':'dashboard.html';});
if($('balance'))$('balance').textContent=balance();
if($('pending'))$('pending').textContent=state.requests.filter(r=>r.employeeId==='EMP-DEMO-01'&&r.status==='Pending').length;
if($('greeting'))$('greeting').textContent='Welcome back, '+employee().name.split(' ')[0];
function message(id,text,error=false){$(id).textContent=text;$(id).className=error?'error':'success';}
function renderRequests(admin=false){const target=$(admin?'admin-requests':'requests');if(!target)return;
const displayed=state.requests.filter(r=>admin?(!$('leave-filter')||$('leave-filter').value==='All'||r.status===$('leave-filter').value):r.employeeId==='EMP-DEMO-01');
if(!displayed.length){target.innerHTML='<p class="muted">No leave requests yet. Submit one using the employee demo.</p>';return;}
target.innerHTML='<table><thead><tr><th>Employee / type</th><th>Dates</th><th>Days</th><th>Note</th><th>Status</th><th>Action</th></tr></thead><tbody>'+displayed.map(r=>`<tr><td>${escapeHtml(employee(r.employeeId)?.name||'Unknown employee')}<br>${escapeHtml(r.type)}</td><td>${escapeHtml(r.start)} to ${escapeHtml(r.end)}</td><td>${r.days}</td><td>${escapeHtml(r.reason||'—')}</td><td><span class="badge ${escapeHtml(r.status)}">${escapeHtml(r.status)}</span></td><td>${r.status==='Pending'?(admin?`<button data-id="${r.id}" data-action="Approved">Approve</button> <button class="secondary" data-id="${r.id}" data-action="Declined">Decline</button>`:`<button class="secondary" data-id="${r.id}" data-action="Cancelled">Cancel</button>`):'—'}</td></tr>`).join('')+'</tbody></table>';
target.querySelectorAll('[data-action]').forEach(button=>button.addEventListener('click',()=>{const r=state.requests.find(x=>x.id===button.dataset.id);if(!r||r.status!=='Pending')return;
if(admin&&state.role!=='admin')return;
if(button.dataset.action==='Approved'&&r.type==='Annual leave'&&r.days>balance(r.employeeId)){message('admin-message','Not enough annual leave available.',true);return;}
r.status=button.dataset.action;save();renderRequests(admin);if($('balance'))$('balance').textContent=balance();if(admin){document.dispatchEvent(new Event('leave-updated'));}if(admin)message('admin-message',`Demo request ${r.status.toLowerCase()}.`);
}));}
renderRequests(page==='admin-leave.html');
$('leave-form')?.addEventListener('submit',event=>{event.preventDefault();const start=$('start').value,end=$('end').value,type=$('leave-type').value;
if(!start||!end||end<start){message('leave-message','Choose an end date on or after the start date.',true);return;}
const days=weekdays(start,end);
if(days<1||days>state.policy.max){message('leave-message',`Choose a date range containing 1 to ${state.policy.max} weekdays.`,true);return;}
if(state.requests.some(r=>r.employeeId==='EMP-DEMO-01'&&!['Declined','Cancelled'].includes(r.status)&&start<=r.end&&end>=r.start)){message('leave-message','These dates overlap an existing pending or approved request.',true);return;}
if(type==='Annual leave'&&days>balance()-reserved()){message('leave-message','This request exceeds your available annual leave after pending requests.',true);return;}
state.requests.push({employeeId:'EMP-DEMO-01',id:Date.now().toString(36),type,start,end,days,reason:$('reason').value.trim(),status:'Pending'});save();renderRequests();event.target.reset();message('leave-message',`Demo request submitted for ${days} weekday(s). Status: Pending.`);
});
if($('profile-form')){for(const key of ['email','phone','address'])$(key).value=state.profile[key];$('profile-form').addEventListener('submit',event=>{event.preventDefault();for(const key of ['email','phone','address'])state.profile[key]=$(key).value.trim();employee().email=state.profile.email;save();message('profile-message','Demo contact details saved for this tab.');});}
document.querySelectorAll('[data-slip]').forEach(button=>button.addEventListener('click',()=>{$('slip-period').textContent=button.dataset.slip;$('payslip').showModal();}));
$('close-slip').addEventListener('click',()=>$('payslip').close());
$('print-slip').addEventListener('click',()=>window.print());

// Shared dynamic views. Text from editable records is escaped before HTML insertion.
if(allowed&&adminPages.includes(page)){
 const menu=document.createElement('nav');menu.className='admin-menu';menu.setAttribute('aria-label','Administration');
 menu.innerHTML=[['admin.html','Overview'],['employees.html','Employees'],['admin-payroll.html','Payroll'],['admin-leave.html','Leave'],['company.html','Company information']].map(([url,label])=>`<a href="${url}" ${page===url?'aria-current="page"':''}>${label}</a>`).join('');
 $('page-content').prepend(menu);
}
function renderCalendar(){if($('company-events'))$('company-events').innerHTML=state.events.length?state.events.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(e=>`<p><strong>${escapeHtml(e.date)}</strong><br>${escapeHtml(e.title)} <span class="badge">${escapeHtml(e.type)}</span></p>`).join(''):'<p>No company dates added.</p>';}
renderCalendar();
if($('employment-details'))$('employment-details').innerHTML=[['Employee',employee().name],['Employee ID',employee().id],['Department',employee().department],['Position',employee().job],['Status',employee().status]].map(([key,value])=>`<dt>${key}</dt><dd>${escapeHtml(value)}</dd>`).join('');
if($('public-company-name')){
 $('public-company-name').textContent=state.company.name;$('public-company-description').textContent=state.company.description;
 $('public-company-contact').innerHTML=[state.company.email,state.company.phone,state.company.address].filter(Boolean).map(v=>`<p>${escapeHtml(v)}</p>`).join('');
}
const ownSlips=state.payRuns.flatMap(run=>run.rows.filter(r=>r.employeeId==='EMP-DEMO-01').map(row=>({...row,start:run.start,end:run.end}))).reverse();
if($('latest-pay'))$('latest-pay').textContent=ownSlips.length?money(ownSlips[0].net):'$2,300.00';
function showSlip(slip){
 $('payslip').innerHTML=`<h2 id="slip-title">Sample payslip</h2><p>${escapeHtml(slip.name)} · ${escapeHtml(slip.employeeId)}</p><p>${escapeHtml(slip.start)} to ${escapeHtml(slip.end)}</p><dl><dt>Gross pay</dt><dd>${money(slip.gross)}</dd><dt>Sample deductions</dt><dd>${money(slip.deduction)}</dd><dt>Net pay</dt><dd>${money(slip.net)}</dd></dl><p>Fictional demonstration only. Not an official payslip or tax calculation.</p><div class="actions no-print"><button id="print-current">Print payslip</button><button class="secondary" id="close-current">Close</button></div>`;
 $('print-current').onclick=()=>window.print();$('close-current').onclick=()=>$('payslip').close();$('payslip').showModal();
}
if($('employee-payslips')){
 const slips=[...ownSlips,{employeeId:'EMP-DEMO-01',name:employee().name,start:'2026-11-01',end:'2026-11-15',gross:3000,deduction:700,net:2300}];
 $('employee-payslips').innerHTML='<table><thead><tr><th>Period</th><th>Gross</th><th>Deductions</th><th>Net</th><th>Details</th></tr></thead><tbody>'+slips.map((r,i)=>`<tr><td>${escapeHtml(r.start)} to ${escapeHtml(r.end)}</td><td>${money(r.gross)}</td><td>${money(r.deduction)}</td><td>${money(r.net)}</td><td><button data-generated-slip="${i}">View payslip</button></td></tr>`).join('')+'</tbody></table>';
 document.querySelectorAll('[data-generated-slip]').forEach(b=>b.onclick=()=>showSlip(slips[Number(b.dataset.generatedSlip)]));
}
save();

if($('leave-policy-guidance'))$('leave-policy-guidance').textContent=state.policy.note+' Maximum '+state.policy.max+' weekdays per request.';
