import{o as u,i as T,a as t,d as s,w as i,c as g,af as w,t as M,B,e as H,h as x,r as c,ae as y,ag as V,av as L}from"./index-BtTNhxWS.js";import{C as N}from"./index-DrDBelZ6.js";import{C as U}from"./index-6PJ49DFE.js";import{_ as W}from"./_plugin-vue_export-helper-DlAUqK2U.js";const A={class:"tab-panel active mine-page"},E={class:"mine-main"},O={class:"mine-card","aria-label":"设置"},P={class:"tip-popup-inner"},S={class:"tip-popup-title"},j=["innerHTML"],z=`
  <p class="tip-line tip-intro">秋瑾宝宝专属「打我」小本本</p>
  <p class="tip-line tip-desc">记下每一个美好瞬间 ✨</p>
  <p class="tip-line tip-version">版本 1.0.0</p>
`,D=`
  <div class="tip-section">
    <p class="tip-section-title">打我</p>
    <p class="tip-line">在主页选类型（如厕/饭否/健身/其他）后点「打我」按钮。可看今日次数、连续天数、成就和本月热力图。</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">小本本</p>
    <p class="tip-line">底部「小本本」tab 可看全部记录，按时间、类型筛选，单条可删掉（有二次确认）。标题栏右侧 ⋯ 可补一刀、导出/导入/清空数据。</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">姨妈记</p>
    <p class="tip-line">记经期「来的第一天」和「结束了」，可猜下次开始日期。标题栏右侧 ⋯ 可导出/导入/清空姨妈记数据。</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">主题颜色</p>
    <p class="tip-line">上方「主题颜色」可自选颜色；在弹层中点击「重置为按星期自动」可恢复按星期（日～六）自动切换主题。</p>
  </div>
  <div class="tip-section">
    <p class="tip-section-title">检查更新</p>
    <p class="tip-line">从主屏幕打开时，点「检查更新」可主动检查是否有新版本；若有会弹出「发现新版本，请刷新」提示，点刷新即可。</p>
  </div>
`,F={__name:"MineView",setup(G){const v=V("openThemeModal",()=>{}),r=x(()=>typeof navigator<"u"&&"serviceWorker"in navigator);function m(){r.value&&navigator.serviceWorker.getRegistration().then(p=>{p&&p.update(),L("正在检查更新，如有新版本将提示刷新")})}const n=c(!1),a=c(""),l=c("");function _(){v()}function f(){a.value="关于",l.value=z,n.value=!0}function k(){a.value="使用帮助",l.value=D,n.value=!0}return(p,e)=>{const o=U,b=N,h=B,C=y;return u(),T("div",A,[e[7]||(e[7]=t("header",{class:"mine-header"},[t("h1",{class:"mine-title"},"我呀"),t("p",{class:"mine-subtitle"},"设置与帮助")],-1)),t("main",E,[t("section",O,[s(b,{border:!1},{default:i(()=>[s(o,{title:"主题颜色","is-link":"",onClick:_},{icon:i(()=>[...e[2]||(e[2]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"🎨",-1)])]),_:1}),s(o,{title:"使用帮助","is-link":"",onClick:k},{icon:i(()=>[...e[3]||(e[3]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"❓",-1)])]),_:1}),s(o,{title:"关于","is-link":"",onClick:f},{icon:i(()=>[...e[4]||(e[4]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"ℹ️",-1)])]),_:1}),r.value?(u(),g(o,{key:0,title:"检查更新","is-link":"",onClick:m},{icon:i(()=>[...e[5]||(e[5]=[t("span",{class:"mine-cell-icon","aria-hidden":"true"},"🔄",-1)])]),_:1})):w("",!0)]),_:1})])]),s(C,{show:n.value,"onUpdate:show":e[1]||(e[1]=d=>n.value=d),position:"center",round:"",class:"tip-popup","z-index":9999},{default:i(()=>[t("div",P,[t("h3",S,M(a.value),1),t("div",{class:"tip-modal-body",innerHTML:l.value},null,8,j),s(h,{type:"primary",block:"",round:"",class:"tip-modal-btn tip-modal-btn-theme",onClick:e[0]||(e[0]=d=>n.value=!1)},{default:i(()=>[...e[6]||(e[6]=[H(" 好哒 ",-1)])]),_:1})])]),_:1},8,["show"])])}}},J=W(F,[["__scopeId","data-v-b9fee37c"]]);export{J as default};
