import{m as B,W as w,d as i,F as M,x,b1 as H,aS as P,C as y,D as O,o as _,j as V,a as t,w as a,c as L,k as N,t as S,B as G,e as W,h as A,r as v,P as D,G as E,J as F}from"./index-BraOb1rX.js";import{C as I}from"./index-BNrTUXGb.js";import{_ as R}from"./_plugin-vue_export-helper-DlAUqK2U.js";const[U,f]=y("cell-group"),j={title:String,inset:Boolean,border:w};var z=B({name:U,inheritAttrs:!1,props:j,setup(n,{slots:s,attrs:p}){const c=()=>{var o;return i("div",x({class:[f({inset:n.inset}),{[P]:n.border&&!n.inset}]},p,H()),[(o=s.default)==null?void 0:o.call(s)])},l=()=>i("div",{class:f("title",{inset:n.inset})},[s.title?s.title():n.title]);return()=>n.title||s.title?i(M,null,[l(),c()]):c()}});const J=O(z),$={class:"tab-panel active mine-page"},q={class:"mine-main"},K={class:"mine-card","aria-label":"设置"},Q={class:"tip-popup-inner"},X={class:"tip-popup-title"},Y=["innerHTML"],Z=`
  <p class="tip-line tip-intro">秋瑾宝宝专属「打我」小本本</p>
  <p class="tip-line tip-desc">记下每一个美好瞬间 ✨</p>
  <p class="tip-line tip-version">版本 1.0.0</p>
`,ee=`
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
`,te={__name:"MineView",setup(n){const s=E("openThemeModal",()=>{}),p=A(()=>typeof navigator<"u"&&"serviceWorker"in navigator);function c(){p.value&&navigator.serviceWorker.getRegistration().then(u=>{u&&u.update(),F("正在检查更新，如有新版本将提示刷新")})}const l=v(!1),o=v(""),d=v("");function k(){s()}function h(){o.value="关于",d.value=Z,l.value=!0}function T(){o.value="使用帮助",d.value=ee,l.value=!0}return(u,e)=>{const r=I,b=J,C=G,g=D;return _(),V("div",$,[e[7]||(e[7]=t("header",{class:"mine-header"},[t("h1",{class:"mine-title"},"我呀"),t("p",{class:"mine-subtitle"},"设置与帮助")],-1)),t("main",q,[t("section",K,[i(b,{border:!1},{default:a(()=>[i(r,{title:"主题颜色","is-link":"",onClick:k},{icon:a(()=>[...e[2]||(e[2]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"🎨",-1)])]),_:1}),i(r,{title:"使用帮助","is-link":"",onClick:T},{icon:a(()=>[...e[3]||(e[3]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"❓",-1)])]),_:1}),i(r,{title:"关于","is-link":"",onClick:h},{icon:a(()=>[...e[4]||(e[4]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"ℹ️",-1)])]),_:1}),p.value?(_(),L(r,{key:0,title:"检查更新","is-link":"",onClick:c},{icon:a(()=>[...e[5]||(e[5]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"🔄",-1)])]),_:1})):N("",!0)]),_:1})])]),i(g,{show:l.value,"onUpdate:show":e[1]||(e[1]=m=>l.value=m),position:"center",round:"",class:"tip-popup","z-index":9999},{default:a(()=>[t("div",Q,[t("h3",X,S(o.value),1),t("div",{class:"tip-modal-body",innerHTML:d.value},null,8,Y),i(C,{type:"primary",block:"",round:"",class:"tip-modal-btn tip-modal-btn-theme",onClick:e[0]||(e[0]=m=>l.value=!1)},{default:a(()=>[...e[6]||(e[6]=[W(" 好哒 ",-1)])]),_:1})])]),_:1},8,["show"])])}}},le=R(te,[["__scopeId","data-v-852c3d99"]]);export{le as default};
