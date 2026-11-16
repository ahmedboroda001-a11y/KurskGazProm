const toggle=document.querySelector('#mobileToggle');
const mobile=document.querySelector('#mobilePanel');
if(toggle&&mobile){toggle.addEventListener('click',()=>{const on=mobile.classList.toggle('open');toggle.setAttribute('aria-expanded',String(on));});}
let toastTimer;
function notify(msg){const el=document.querySelector('#toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),6000);}
const cfg=window.KGP_CONFIG||{};
if(cfg.telegramBotUsername&&/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(cfg.telegramBotUsername)){
  document.querySelectorAll('[data-telegram-bot]').forEach(a=>{a.href='https://t.me/'+cfg.telegramBotUsername;a.hidden=false;});
}
document.querySelectorAll('form[data-lead]').forEach(form=>{
  const started=Date.now();
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(!form.reportValidity())return;
    const data=Object.fromEntries(new FormData(form).entries());
    const message={name:String(data['Имя']||''),phone:String(data['Телефон']||''),email:String(data['Почта']||''),service:String(data['Услуга']||''),locality:String(data['Населённый пункт']||''),comment:String(data['Комментарий']||''),website:String(data.company_website||''),consent:!!data.consent,elapsedMs:Date.now()-started,page:location.pathname};
    const status=form.querySelector('.form-status');const btn=form.querySelector('button[type=submit]');
    const setStatus=s=>{if(status)status.textContent=s;notify(s);};
    if(message.website){setStatus('Спасибо за обращение.');return;}
    if(!cfg.apiBase){setStatus('Сервер отправки заявок ещё не подключён. Напишите на gazstroi46@mail.ru или позвоните: 8 (910) 731-02-00.');return;}
    btn.disabled=true;setStatus('Отправляем обращение…');
    try{
      const ac=new AbortController();const timer=setTimeout(()=>ac.abort(),13000);
      let resp;try{resp=await fetch(cfg.apiBase.replace(/\/$/,'')+'/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(message),signal:ac.signal});}finally{clearTimeout(timer);}
      const reply=await resp.json().catch(()=>({}));
      if(!resp.ok||!reply.ok)throw new Error(reply.error||'Не удалось отправить сообщение');
      setStatus('Заявка принята и отправлена! Мы свяжемся с вами в рабочее время.');window.kgpGoal?.('lead_success');form.reset();
    }catch(err){setStatus('Не удалось доставить заявку. Позвоните: 8 (910) 731-02-00 или напишите на gazstroi46@mail.ru.');}
    finally{btn.disabled=false;}
  });
});


/* Calculator: preliminary work-scope estimate; monetary tariffs not configured. */
(function(){
 const form=document.getElementById('scopeCalculator');if(!form)return;
 const steps=[...form.querySelectorAll('.calc-step')],bar=[...document.querySelectorAll('.calc-progress span')];
 const next=document.getElementById('calcNext'),prev=document.getElementById('calcPrev'),send=document.getElementById('calcSend');let index=0;
 const str=(key)=>String(form.elements[key]?.value||'').trim();
 const num=(key)=>{const v=Number(str(key));return Number.isFinite(v)&&v>=0?v:0};
 const build=()=>{
  const total=num('outdoor')+num('indoor');
  const detail=[['Тип объекта',str('objectType')||'Не указан'],['Расположение',str('locality')||'Не указано'],['Технические условия',str('tu')],['Наружная сеть',str('outdoor')?str('outdoor')+' м':'Длина не уточнена'],['Внутренняя сеть',str('indoor')?str('indoor')+' м':'Длина не уточнена'],['Протяжённость указанных сетей',total?total+' м':'Не рассчитана: длины не указаны'],['Прокладка',str('trench')],['Оборудование',str('equipment')||'Не выбрано'],['Состав услуг',str('needs')],['Комментарий',str('notes')||'Нет']];
  const out=document.getElementById('calcSummary');if(out){out.replaceChildren();detail.forEach(([label,value])=>{const row=document.createElement('div'),name=document.createElement('span'),val=document.createElement('strong');name.textContent=label;val.textContent=value;row.append(name,val);out.append(row)});}
  return detail.map(([a,b])=>a+': '+b).join('\n');
 };
 const render=()=>{steps.forEach((x,i)=>{x.classList.toggle('active',i===index);x.hidden=i!==index});bar.forEach((x,i)=>x.classList.toggle('on',i<=index));prev.hidden=index===0;next.hidden=index===steps.length-1;send.hidden=index!==steps.length-1;if(index===3)build();};
 next.addEventListener('click',()=>{if(index===0){for(const f of [form.elements.objectType,form.elements.locality]){if(!f.checkValidity()){f.reportValidity();return;}}}if(index<steps.length-1)index++;render();});
 prev.addEventListener('click',()=>{if(index>0)index--;render();});
 send.addEventListener('click',()=>{window.kgpGoal?.('calculator_to_lead');const p=new URLSearchParams();p.set('service','Газификация частных домов');p.set('locality',str('locality'));p.set('comment','Предварительные параметры из калькулятора\n'+build());const href='contacts.html?'+p.toString();if(window.KGP_PREVIEW_MODE&&window.parent!==window){window.parent.postMessage({kind:'kgp-route',href},'*');}else{location.href=href;}});
 render();
})();
(function(){const p=new URLSearchParams(window.KGP_PREVIEW_SEARCH||location.search);if(!p.has('comment'))return;document.querySelectorAll('form[data-lead]').forEach(f=>{const c=f.querySelector('textarea[name="Комментарий"]');if(c)c.value=p.get('comment')||'';const loc=f.querySelector('[name="Населённый пункт"]');if(loc)loc.value=p.get('locality')||'';const service=f.querySelector('[name="Услуга"]');if(service){const wanted=p.get('service')||'';if([...service.options].some(o=>o.value===wanted))service.value=wanted;}});})();
