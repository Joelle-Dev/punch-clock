import{o as b,i as k,a as e,d as i,w as s,t as T,B as C,e as h,r as p,ae as M,ag as w}from"./index-CuE4afov.js";import{C as H}from"./index-C1F4Sj16.js";import{C as x}from"./index-BwNGz_35.js";import{_ as B}from"./_plugin-vue_export-helper-DlAUqK2U.js";const L={class:"tab-panel active mine-page"},V={class:"mine-main"},g={class:"mine-card","aria-label":"设置"},y={class:"tip-popup-inner"},N={class:"tip-popup-title"},A=["innerHTML"],E=`
  <p class="tip-line tip-intro">秋瑾宝宝专属「打我」小本本</p>
  <p class="tip-line tip-desc">记下每一个美好瞬间 ✨</p>
  <p class="tip-line tip-version">版本 1.0.0</p>
`,O=`
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
`,P={__name:"MineView",setup(U){const d=w("openThemeModal",()=>{}),n=p(!1),o=p(""),l=p("");function r(){d()}function u(){o.value="关于",l.value=E,n.value=!0}function m(){o.value="使用帮助",l.value=O,n.value=!0}return(j,t)=>{const a=x,_=H,v=C,f=M;return b(),k("div",L,[t[6]||(t[6]=e("header",{class:"mine-header"},[e("h1",{class:"mine-title"},"我呀"),e("p",{class:"mine-subtitle"},"设置与帮助")],-1)),e("main",V,[e("section",g,[i(_,{border:!1},{default:s(()=>[i(a,{title:"主题颜色","is-link":"",onClick:r},{icon:s(()=>[...t[2]||(t[2]=[e("span",{class:"mine-cell-icon","aria-hidden":"true"},"🎨",-1)])]),_:1}),i(a,{title:"使用帮助","is-link":"",onClick:m},{icon:s(()=>[...t[3]||(t[3]=[e("span",{class:"mine-cell-icon","aria-hidden":"true"},"❓",-1)])]),_:1}),i(a,{title:"关于","is-link":"",onClick:u},{icon:s(()=>[...t[4]||(t[4]=[e("span",{class:"mine-cell-icon","aria-hidden":"true"},"ℹ️",-1)])]),_:1})]),_:1})])]),i(f,{show:n.value,"onUpdate:show":t[1]||(t[1]=c=>n.value=c),position:"center",round:"",class:"tip-popup","z-index":9999},{default:s(()=>[e("div",y,[e("h3",N,T(o.value),1),e("div",{class:"tip-modal-body",innerHTML:l.value},null,8,A),i(v,{type:"primary",block:"",round:"",class:"tip-modal-btn tip-modal-btn-theme",onClick:t[0]||(t[0]=c=>n.value=!1)},{default:s(()=>[...t[5]||(t[5]=[h(" 好哒 ",-1)])]),_:1})])]),_:1},8,["show"])])}}},S=B(P,[["__scopeId","data-v-da7b1c2a"]]);export{S as default};
