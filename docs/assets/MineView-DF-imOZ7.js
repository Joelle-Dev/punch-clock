import{o as u,j as T,a as t,d as s,w as i,c as w,m as M,t as g,B,e as H,h as x,r as c,P as y,ai as V,I as L}from"./index-DxUjHE30.js";import{C as N}from"./index-BXTIZ6PB.js";import{C as P}from"./index-BcZct203.js";import{_ as U}from"./_plugin-vue_export-helper-DlAUqK2U.js";const W={class:"tab-panel active mine-page"},j={class:"mine-main"},A={class:"mine-card","aria-label":"设置"},E={class:"tip-popup-inner"},I={class:"tip-popup-title"},O=["innerHTML"],S=`
  <p class="tip-line tip-intro">秋瑾宝宝专属「打我」小本本</p>
  <p class="tip-line tip-desc">记下每一个美好瞬间 ✨</p>
  <p class="tip-line tip-version">版本 1.0.0</p>
`,z=`
  <div class="tip-section">
    <p class="tip-section-title">打我</p>
    <p class="tip-line">选类型点「打我」，可看今日次数、连续、成就和本月热力图。</p>
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
`,D={__name:"MineView",setup(F){const m=V("openThemeModal",()=>{}),r=x(()=>typeof navigator<"u"&&"serviceWorker"in navigator);function v(){r.value&&navigator.serviceWorker.getRegistration().then(p=>{p&&p.update(),L("正在检查更新，如有新版本将提示刷新")})}const n=c(!1),a=c(""),l=c("");function _(){m()}function f(){a.value="关于",l.value=S,n.value=!0}function k(){a.value="使用帮助",l.value=z,n.value=!0}return(p,e)=>{const o=P,h=N,b=B,C=y;return u(),T("div",W,[e[7]||(e[7]=t("header",{class:"mine-header"},[t("h1",{class:"mine-title"},"我呀"),t("p",{class:"mine-subtitle"},"设置与帮助")],-1)),t("main",j,[t("section",A,[s(h,{border:!1},{default:i(()=>[s(o,{title:"主题颜色","is-link":"",onClick:_},{icon:i(()=>[...e[2]||(e[2]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"🎨",-1)])]),_:1}),s(o,{title:"使用帮助","is-link":"",onClick:k},{icon:i(()=>[...e[3]||(e[3]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"❓",-1)])]),_:1}),s(o,{title:"关于","is-link":"",onClick:f},{icon:i(()=>[...e[4]||(e[4]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"ℹ️",-1)])]),_:1}),r.value?(u(),w(o,{key:0,title:"检查更新","is-link":"",onClick:v},{icon:i(()=>[...e[5]||(e[5]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"🔄",-1)])]),_:1})):M("",!0)]),_:1})])]),s(C,{show:n.value,"onUpdate:show":e[1]||(e[1]=d=>n.value=d),position:"center",round:"",class:"tip-popup","z-index":9999},{default:i(()=>[t("div",E,[t("h3",I,g(a.value),1),t("div",{class:"tip-modal-body",innerHTML:l.value},null,8,O),s(b,{type:"primary",block:"",round:"",class:"tip-modal-btn tip-modal-btn-theme",onClick:e[0]||(e[0]=d=>n.value=!1)},{default:i(()=>[...e[6]||(e[6]=[H(" 好哒 ",-1)])]),_:1})])]),_:1},8,["show"])])}}},J=U(D,[["__scopeId","data-v-8bfa8e28"]]);export{J as default};
