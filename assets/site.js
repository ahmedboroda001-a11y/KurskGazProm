const toggle=document.querySelector('#mobileToggle');
const mobile=document.querySelector('#mobilePanel');
if(toggle&&mobile){toggle.addEventListener('click',()=>{const on=mobile.classList.toggle('open');toggle.setAttribute('aria-expanded',String(on));});}
let toastTimer;
function notify(msg){const el=document.querySelector('#toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),6000);}
const cfg=window.KGP_CONFIG||{};
if(cfg.telegramBotUsername&&/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(cfg.telegramBotUsername)){
  document.querySelectorAll('[data-telegram-bot]').forEach(a=>{a.href='https://t.me/'+cfg.telegramBotUsername;a.hidden=false;});
}
// The site is static. A message is prepared on the client; sending occurs in a messenger.
document.querySelectorAll('form[data-lead]').forEach(form=>{
  const status=form.querySelector('.form-status');
  const setStatus=text=>{if(status)status.textContent=text;notify(text);};
  const value=name=>String(form.elements.namedItem(name)?.value||'').trim();
  const createMessage=()=>[
    'Заявка с сайта КурскГазПром',
    'Имя: '+value('Имя'),
    'Телефон: '+value('Телефон'),
    'Услуга: '+(value('Услуга')||'Не выбрана'),
    'Населённый пункт: '+(value('Населённый пункт')||'Не указан'),
    'Комментарий: '+(value('Комментарий')||'Нет'),
    'Страница: '+location.href.split('?')[0].split('#')[0]
  ].join('\n');
  form.addEventListener('submit',e=>{e.preventDefault();setStatus('Выберите Telegram, WhatsApp или MAX, чтобы подготовить сообщение.');});
  form.querySelectorAll('[data-messenger]').forEach(button=>button.addEventListener('click',()=>{
    if(!form.reportValidity())return;
    const honey=form.elements.namedItem('company_website');
    if(honey&&honey.value)return;
    const message=createMessage(),type=button.dataset.messenger;
    const phone=String(cfg.messengerPhone||'79107310200').replace(/\D/g,'');
    let url='';
    if(type==='whatsapp'){
      url='https://wa.me/'+phone+'?text='+encodeURIComponent(message);
    }else if(type==='telegram'){
      const username=String(cfg.telegramContactUsername||'').replace(/^@/,'');
      if(username&&!/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(username)){
        setStatus('Указан неверный Telegram username в настройках сайта.');return;
      }
      // Number links may be blocked by Telegram privacy settings. Prefer business username when provided.
      url='https://t.me/'+(username||('+'+phone))+'?text='+encodeURIComponent(message);
    }else if(type==='max'){
      const chat=String(cfg.maxChatUrl||'').trim();
      if(chat){
        try{const parsed=new URL(chat);if(parsed.protocol!=='https:'||parsed.hostname!=='max.ru')throw Error('invalid');}
        catch(e){setStatus('Некорректная ссылка на MAX в настройках сайта.');return;}
        // A known MAX chat URL does not support reliable prefill: offer clipboard message.
        if(navigator.clipboard?.writeText){navigator.clipboard.writeText(message).catch(()=>{});}
        url=chat;
      }else{
        // MAX official share link requires user to select the recipient.
        url='https://max.ru/:share?text='+encodeURIComponent(message);
      }
    }else{return;}
    if(typeof window.kgpGoal==='function')window.kgpGoal(type+'_click');
    setStatus(type==='max'&&!cfg.maxChatUrl
      ?'Откроется MAX с текстом заявки. Выберите чат КурскГазПром и нажмите «Отправить».'
      :'Сообщение подготовлено. Проверьте получателя и нажмите «Отправить» в мессенджере.');
    // A normal navigation avoids duplicate tabs and browser popup blockers.
    window.location.assign(url);
  }));
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

/* Fixed, always-visible contact panel. It works without a backend or JS-generated HTML on every page. */
(function setupQuickMessengers(){
  if(document.querySelector('.kgp-quick-messengers'))return;
  const number=String(cfg.messengerPhone||'79107310200').replace(/\D/g,'');
  const msg='Здравствуйте! Интересует газификация. Хочу получить консультацию.';
  const uname=String(cfg.telegramContactUsername||'').replace(/^@/,'').trim();
  const tg=uname&&/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(uname)
    ? 'https://t.me/'+uname : 'https://t.me/+'+number;
  const knownMax=String(cfg.maxChatUrl||'').trim();
  const maxUrl=/^https:\/\/max\.ru\//i.test(knownMax)
    ? knownMax : 'https://max.ru/:share?text='+encodeURIComponent(msg);
  const dock=document.createElement('aside');
  dock.className='kgp-quick-messengers';
  dock.setAttribute('aria-label','Быстрая связь с КурскГазПром');
  const heading=document.createElement('div');
  heading.className='kgp-quick-messengers-title';
  heading.textContent='Напишите нам';
  dock.appendChild(heading);
  const actions=document.createElement('div');
  actions.className='kgp-quick-messengers-actions';
  const options=[
    {type:'telegram',label:'Telegram',symbol:'TG',href:tg,title:'Открыть Telegram КурскГазПром по номеру телефона (при доступности профиля)'},
    {type:'whatsapp',label:'WhatsApp',symbol:'WA',href:'https://wa.me/'+number+'?text='+encodeURIComponent(msg),title:'Написать КурскГазПром в WhatsApp'},
    {type:'max',label:'MAX',symbol:'М',href:maxUrl,title:knownMax?'Открыть чат КурскГазПром в MAX':'Открыть MAX: потребуется выбрать чат получателя'}
  ];
  options.forEach(o=>{
    const a=document.createElement('a');
    a.className='kgp-quick-messengers-button kgp-quick-'+o.type;
    a.href=o.href;
    a.target='_blank';
    a.rel='noopener noreferrer';
    a.title=o.title;
    a.setAttribute('aria-label',o.title);
    const glyph=document.createElement('span');
    glyph.className='kgp-quick-messengers-glyph';
    glyph.setAttribute('aria-hidden','true');
    glyph.textContent=o.symbol;
    const label=document.createElement('span');
    label.textContent=o.label;
    a.append(glyph,label);
    a.addEventListener('click',()=>window.kgpGoal?.(o.type+'_click'));
    actions.appendChild(a);
  });
  dock.appendChild(actions);
  document.body.appendChild(dock);
})();

