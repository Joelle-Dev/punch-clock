import{p as S,X as D,d as i,F as I,y as W,aS as G,aE as R,D as j,E as $,o as g,j as z,a as t,w as s,t as N,c as K,k as X,B as Y,e as b,h as E,r,P as q,K as h,H as w}from"./index-CgpopoQe.js";import{C as J,F as Q}from"./index-n6g1busq.js";import{_ as Z}from"./_plugin-vue_export-helper-DlAUqK2U.js";import"./use-id-Cw62sKAC.js";const[ee,V]=j("cell-group"),te={title:String,inset:Boolean,border:D};var ie=S({name:ee,inheritAttrs:!1,props:te,setup(o,{slots:n,attrs:v}){const d=()=>{var a;return i("div",W({class:[V({inset:o.inset}),{[R]:o.border&&!o.inset}]},v,G()),[(a=n.default)==null?void 0:a.call(n)])},p=()=>i("div",{class:V("title",{inset:o.inset})},[n.title?n.title():o.title]);return()=>o.title||n.title?i(I,null,[p(),d()]):d()}});const ne=$(ie),se={class:"tab-panel active mine-page"},le={class:"mine-main"},ae={class:"mine-card","aria-label":"设置"},oe={class:"mine-cell-value"},pe={class:"tip-popup-inner"},ce={class:"tip-popup-title"},re=["innerHTML"],de={class:"name-edit-inner"},ue={class:"name-edit-actions"},me="潘秋瑾",ve=`
  <div class="tip-section">
    <p class="tip-section-title">打我</p>
    <p class="tip-line">选类型点「打我」，可看今日次数、连续、成就和本月热力图。</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">成就</p>
    <p class="tip-line">每次点「打我」后会自动检查，达成条件即解锁～</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">小本本</p>
    <p class="tip-line">看记录、按时间/类型筛选，左滑删除。右上 ⋯ 可补一下～、导出/导入/清空。</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">姨妈记</p>
    <p class="tip-line">记「来的第一天」「结束了」猜下次。右上 ⋯ 可补一下～、导出/导入/清空。记过啥左滑删除。</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">主题颜色</p>
    <p class="tip-line">自选颜色，弹层里可重置为按星期自动。</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">检查更新</p>
    <p class="tip-line">点「检查更新」查新版本，有则提示刷新。</p>
  </div>
`,fe={__name:"MineView",setup(o){const n=w("userName",r("")),v=w("setUserName",()=>{}),d=E(()=>n.value&&n.value.trim()?n.value.trim():me),p=r(!1),a=r("");function x(){a.value=n.value&&n.value.trim()?n.value.trim():"",p.value=!0}function y(){const l=a.value?a.value.trim():"";v(l),p.value=!1,h(l?"保存啦～":"已清空，将使用默认名字")}function B(){a.value="",v(""),p.value=!1,h("已重置为默认名字～")}const M=w("openThemeModal",()=>{}),C=E(()=>typeof navigator<"u"&&"serviceWorker"in navigator);function H(){C.value&&navigator.serviceWorker.getRegistration().then(l=>{l&&l.update(),h("正在检查更新，如有新版本将提示刷新")})}const u=r(!1),f=r(""),_=r("");function P(l){return`
  <p class="tip-line tip-intro">${l&&l.trim()?l.trim():"潘秋瑾"}宝宝专属「打我」小本本</p>
  <p class="tip-line tip-desc">记下每一个美好瞬间 ✨</p>
  <p class="tip-line tip-version">版本 1.0.0</p>
`}function U(){M()}function A(){f.value="关于",_.value=P(d.value),u.value=!0}function F(){f.value="使用帮助",_.value=ve,u.value=!0}return(l,e)=>{const m=J,L=ne,k=Y,T=q,O=Q;return g(),z("div",se,[e[13]||(e[13]=t("header",{class:"mine-header"},[t("h1",{class:"mine-title"},"我呀"),t("p",{class:"mine-subtitle"},"设置与帮助")],-1)),t("main",le,[t("section",ae,[i(L,{border:!1},{default:s(()=>[i(m,{title:"我的名字","is-link":"",onClick:x},{icon:s(()=>[...e[4]||(e[4]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"✏️",-1)])]),value:s(()=>[t("span",oe,N(d.value),1)]),_:1}),i(m,{title:"主题颜色","is-link":"",onClick:U},{icon:s(()=>[...e[5]||(e[5]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"🎨",-1)])]),_:1}),i(m,{title:"使用帮助","is-link":"",onClick:F},{icon:s(()=>[...e[6]||(e[6]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"❓",-1)])]),_:1}),i(m,{title:"关于","is-link":"",onClick:A},{icon:s(()=>[...e[7]||(e[7]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"ℹ️",-1)])]),_:1}),C.value?(g(),K(m,{key:0,title:"检查更新","is-link":"",onClick:H},{icon:s(()=>[...e[8]||(e[8]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"🔄",-1)])]),_:1})):X("",!0)]),_:1})])]),i(T,{show:u.value,"onUpdate:show":e[1]||(e[1]=c=>u.value=c),position:"center",round:"",class:"tip-popup","z-index":9999},{default:s(()=>[t("div",pe,[t("h3",ce,N(f.value),1),t("div",{class:"tip-modal-body",innerHTML:_.value},null,8,re),i(k,{type:"primary",block:"",round:"",class:"tip-modal-btn tip-modal-btn-theme",onClick:e[0]||(e[0]=c=>u.value=!1)},{default:s(()=>[...e[9]||(e[9]=[b(" 好哒 ",-1)])]),_:1})])]),_:1},8,["show"]),i(T,{show:p.value,"onUpdate:show":e[3]||(e[3]=c=>p.value=c),position:"center",round:"",class:"name-edit-popup",style:{width:"85%",maxWidth:"320px"}},{default:s(()=>[t("div",de,[e[12]||(e[12]=t("h3",{class:"name-edit-title"},"我的名字",-1)),i(O,{modelValue:a.value,"onUpdate:modelValue":e[2]||(e[2]=c=>a.value=c),placeholder:"输入你的名字～",maxlength:"6","show-word-limit":"",clearable:"",class:"name-edit-field"},null,8,["modelValue"]),t("div",ue,[i(k,{block:"",round:"",class:"name-edit-btn",onClick:B},{default:s(()=>[...e[10]||(e[10]=[b("重置为默认",-1)])]),_:1}),i(k,{type:"primary",block:"",round:"",class:"name-edit-btn",onClick:y},{default:s(()=>[...e[11]||(e[11]=[b("保存",-1)])]),_:1})])])]),_:1},8,["show"])])}}},we=Z(fe,[["__scopeId","data-v-41b0c484"]]);export{we as default};
