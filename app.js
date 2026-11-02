(() => {
  'use strict';
  // Hooks are local CustomEvents only. No trackers, cookies, storage or network calls.
  const emit = (event, placement, extra = {}) => window.dispatchEvent(new CustomEvent('fiftig:interaction', {detail: {event, placement, ...extra}}));
  const message = purpose => `Hi Fiftig Seofon, saya nak book slot.\nTujuan: ${purpose}\nTarikh:\nMasa:\nJumlah orang:\nBoleh bantu semak kekosongan?`;
  document.querySelectorAll('[data-whatsapp]').forEach(link => {
    link.href = `https://wa.me/${document.body.dataset.bookingNumber}?text=${encodeURIComponent(message(link.dataset.whatsapp))}`;
    link.addEventListener('click', () => emit('whatsapp_click', link.dataset.placement, {occasion: link.dataset.whatsapp}));
  });
  document.querySelectorAll('[data-event]').forEach(link => link.addEventListener('click', () => emit(link.dataset.event, link.dataset.placement)));
  const menuDialog = document.querySelector('#menu-dialog');
  const menuFrame = menuDialog.querySelector('iframe');
  let menuOpener;
  document.querySelectorAll('[data-menu-open]').forEach(link => {
    link.setAttribute('aria-haspopup','dialog');
    link.setAttribute('aria-controls','menu-dialog');
    link.addEventListener('click', event => {
      event.preventDefault();
      menuOpener = link;
      if (!menuFrame.hasAttribute('src')) menuFrame.src = menuFrame.dataset.src;
      document.body.classList.add('menu-is-open');
      menuDialog.showModal();
    });
  });
  menuDialog.addEventListener('close', () => {
    document.body.classList.remove('menu-is-open');
    menuOpener?.focus({preventScroll:true});
  });
  menuDialog.addEventListener('click', event => {
    if(event.target !== menuDialog) return;
    const r=menuDialog.getBoundingClientRect();
    if(event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) menuDialog.close();
  });
  const gallery=document.querySelector('.drink-gallery');
  const previous=document.querySelector('[data-drinks-prev]');
  const next=document.querySelector('[data-drinks-next]');
  const updateGallery=()=>{
    previous.disabled=gallery.scrollLeft<4;
    next.disabled=gallery.scrollLeft+gallery.clientWidth>=gallery.scrollWidth-4;
  };
  [previous,next].forEach((button,index)=>button.addEventListener('click',()=>{
    const step=gallery.querySelector('figure').getBoundingClientRect().width+20;
    gallery.scrollBy({left:index?step:-step,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }));
  gallery.addEventListener('scroll',updateGallery,{passive:true});
  new ResizeObserver(updateGallery).observe(gallery);
  const tablist = document.querySelector('.menu-tabs');
  const tabs = [...tablist.querySelectorAll('a')];
  const panels = tabs.map(tab => document.querySelector(tab.getAttribute('href')));
  tablist.setAttribute('role','tablist');
  tablist.setAttribute('aria-label','Kategori menu');
  tabs.forEach((tab,i) => {
    tab.setAttribute('role','tab');
    tab.setAttribute('aria-controls',panels[i].id);
    panels[i].setAttribute('role','tabpanel');
    panels[i].setAttribute('aria-labelledby',tab.id);
    panels[i].tabIndex = 0;
  });
  function select(index, focus=false, track=true) {
    tabs.forEach((tab,i) => {
      tab.setAttribute('aria-selected', String(i===index));
      tab.tabIndex = i===index ? 0 : -1;
      panels[i].hidden = i!==index;
    });
    if(focus) tabs[index].focus();
    if(track) emit('menu_open','menu_selector',{category:tabs[index].textContent.trim()});
  }
  tabs.forEach((tab,i) => {
    tab.addEventListener('click',event => {event.preventDefault();select(i);});
    tab.addEventListener('keydown',event => {
      let next;
      if(event.key==='ArrowRight') next=(i+1)%tabs.length;
      if(event.key==='ArrowLeft') next=(i+tabs.length-1)%tabs.length;
      if(event.key==='Home') next=0;
      if(event.key==='End') next=tabs.length-1;
      if(next!==undefined){event.preventDefault();select(next,true);}
      if(event.key===' '){event.preventDefault();select(i);}
    });
  });
  select(0,false,false);
  if ('IntersectionObserver' in window) {
    const bar=document.querySelector('.mobile-booking');
    let finalVisible=false;
    const protectedContent=[...document.querySelectorAll('main h1, main h2, main h3, .menu-tabs, .offer-main, .offer-secondary, .offer-terms')];
    const updateBar=()=>{
      const edge=innerHeight-bar.offsetHeight;
      const collision=scrollY>20 && protectedContent.some(el=>{
        const r=el.getBoundingClientRect();
        return r.height>0 && r.bottom>edge && r.top<innerHeight;
      });
      const hidden=finalVisible||collision;
      bar.classList.toggle('is-hidden',hidden);
      bar.inert=hidden;
    };
    let queued=false;
    const scheduleBar=()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;updateBar();});}};
    addEventListener('scroll',scheduleBar,{passive:true});
    addEventListener('resize',scheduleBar);
    tablist.addEventListener('click',scheduleBar);
    const bookingObserver=new IntersectionObserver(entries => {
      finalVisible=entries[0].isIntersecting;
      updateBar();
    },{threshold:0,rootMargin:'0px 0px -80px 0px'});
    bookingObserver.observe(document.querySelector('#booking'));
    updateBar();
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
      const observer=new IntersectionObserver(entries => entries.forEach(entry => {
        if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}
      }),{threshold:.08});
      document.querySelectorAll('.reveal').forEach((el,i) => {el.style.setProperty('--delay',`${(i%3)*65}ms`);observer.observe(el);});
    }
  }
})();
