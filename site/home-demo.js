// Guided, fictional demonstration. This module never calls the scheduling API.
export function mountDemo(root,track=()=>{}){
 const messages=root.querySelector('#demo-messages'),controls=root.querySelector('#demo-controls'),panel=root.querySelector('#demo-panel'),trace=root.querySelector('#demo-trace'),agent=root.querySelector('#demo-agent');
 let mode='booking',step=0,time='';
 const make=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text)el.textContent=text;return el;};
 function bubble(text,role='assistant'){messages.append(make('p',`bubble ${role}`,text));}
 function choice(label,action,primary=false){const btn=make('button',primary?'confirm':'',label);btn.type='button';btn.addEventListener('click',()=>{action();controls.querySelector('button,a')?.focus({preventScroll:true});});controls.append(btn);}
 function title(text,subtitle){panel.append(make('h3','panel-title',text),make('p','panel-subtitle',subtitle));}
 function fact(label,value){const row=make('div','panel-fact');row.append(make('small','',label),make('strong','',value));panel.append(row);}
 function calendar(){
  title('Terça-feira','Clínica Aurora · agenda fictícia');
  for(const slot of ['10:00','14:30','15:30']){
   const booked=step===2&&time===slot,row=make('div',`panel-slot${booked?' booked':''}`);row.append(make('time','',slot));
   if(booked){const entry=make('div');entry.append(make('strong','','Marina · confirmado'),make('small','','Primeira consulta'));row.append(entry);}else row.append(make('span','empty-slot'));
   panel.append(row);
  }
 }
 function complete(){
  const done=make('p','demo-done','✓ Demonstração concluída');controls.append(done);
  const link=make('a','','Quero conhecer o piloto');link.href='#piloto';link.addEventListener('click',()=>track('cta_click_demo'));controls.append(link);
  track('demo_complete');
 }
 function render(){
  messages.replaceChildren();controls.replaceChildren();panel.replaceChildren();
  agent.textContent=mode==='human'&&step===1?'Recepção · atendimento humano':'Assistente virtual IZMED';
  if(mode==='booking'){
   bubble('Olá! Gostaria de marcar uma consulta.','patient');
   bubble('Olá, Marina! Sou a assistente virtual da Clínica Aurora. Estes são os horários disponíveis na nossa agenda demonstrativa.');
   if(step===0){for(const slot of ['10:00','14:30','15:30'])choice(slot,()=>{time=slot;step=1;track('demo_start');render();});trace.textContent='Escolha um horário para continuar.';}
   else{
    bubble(`Gostaria de agendar às ${time}.`,'patient');
    if(step===1){bubble(`Confira: primeira consulta de Marina, na terça-feira, às ${time}. Podemos confirmar?`);choice('Confirmar agendamento',()=>{step=2;render();},true);choice('Escolher outro horário',()=>{step=0;render();});trace.textContent='Resumo apresentado. Nenhuma reserva antes da confirmação.';}
    else{bubble('Pode confirmar.','patient');bubble(`Pronto! A consulta demonstrativa de Marina está confirmada para terça-feira, às ${time}.`);complete();trace.textContent='Confirmação recebida. Horário registrado na agenda ilustrativa.';}
   }
   calendar();
  }else if(mode==='price'){
   bubble('Qual é o valor da consulta?','patient');
   if(!step){bubble('Vou consultar as informações cadastradas pela clínica.');choice('Ver a resposta',()=>{step=1;track('demo_start');render();},true);trace.textContent='Informação consultada no cadastro demonstrativo.';}
   else{bubble('A consulta particular custa R$ 350,00, conforme o cadastro da Clínica Aurora. Você gostaria de conhecer os horários disponíveis?');complete();trace.textContent='Resposta vinculada à informação cadastrada.';}
   title('Informações autorizadas','Exemplo fictício · não é preço da IZMED');fact('Serviço','Consulta particular');fact('Valor cadastrado','R$ 350,00');fact('Atendimento','Seg a sex, 8h às 18h');
  }else{
   bubble('Gostaria de falar com uma pessoa da recepção.','patient');
   bubble('Claro. Vou encaminhar sua conversa para a equipe.');
   if(!step){choice('Simular a equipe assumindo',()=>{step=1;track('demo_start');render();},true);trace.textContent='Encaminhada para a recepção.';}
   else{bubble('Olá, Marina! Aqui é a recepção. Já estou com a sua conversa e vou continuar seu atendimento.');complete();trace.textContent='Equipe assumiu. A automação permanece pausada.';}
   title(step?'Recepção assumiu':'Aguardando a equipe','Histórico preservado para continuar a conversa.');
   const person=make('div','panel-person'),avatar=make('span','round-avatar peach','R'),info=make('div');info.append(make('strong','','Recepção'),make('small','',step?'Atendimento humano':'Atendimento encaminhado'));person.append(avatar,info);panel.append(person,make('span','pill neutral','Automação pausada'));
  }
 }
 for(const btn of root.querySelectorAll('[data-scenario]'))btn.addEventListener('click',()=>{
  mode=btn.dataset.scenario;step=0;time='';
  for(const other of root.querySelectorAll('[data-scenario]')){const active=other===btn;other.classList.toggle('active',active);other.setAttribute('aria-pressed',String(active));}
  render();
 });
 root.querySelector('.reset-demo').addEventListener('click',()=>{step=0;time='';render();});
 render();
}
