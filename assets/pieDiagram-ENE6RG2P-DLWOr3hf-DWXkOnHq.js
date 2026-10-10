import{m as rt}from"./chunk-JWPE2WC7-BPfUMuVx-BWhurgaw.js";import{f as nt,D as it,g as lt,h as st,z as ot,x as ct,e as g,I as K,u as ut,$ as pt,aa as dt,ab as ht,i as gt,O as ft,a0 as mt,ac as C,ad as yt,ae as V}from"./index-C4z2R8F4.js";import{y as xt}from"./cynefin-VYW2F7L2-BTJyEgdq-XyyeITFA.js";import{h as X}from"./arc-D_0w_X1x-C5kI_33h.js";import{h as vt}from"./ordinal-Cboi1Yqb-DUCuiKwa.js";import"./init-Gi6I4Gst-DHuO7-vr.js";function wt(t,r){return r<t?-1:r>t?1:r>=t?0:NaN}function St(t){return t}function $t(){var t=St,r=wt,w=null,p=C(0),f=C(V),S=C(0);function l(e){var s,n=(e=yt(e)).length,o,A,m=0,$=new Array(n),d=new Array(n),i=+p.apply(this,arguments),D=Math.min(V,Math.max(-V,f.apply(this,arguments)-i)),T,M=Math.min(Math.abs(D)/n,S.apply(this,arguments)),H=M*(D<0?-1:1),c;for(s=0;s<n;++s)(c=d[$[s]=s]=+t(e[s],s,e))>0&&(m+=c);for(r!=null?$.sort(function(O,z){return r(d[O],d[z])}):w!=null&&$.sort(function(O,z){return w(e[O],e[z])}),s=0,A=m?(D-n*H)/m:0;s<n;++s,i=T)o=$[s],c=d[o],T=i+(c>0?c*A:0)+H,d[o]={data:e[o],index:s,value:c,startAngle:i,endAngle:T,padAngle:M};return d}return l.value=function(e){return arguments.length?(t=typeof e=="function"?e:C(+e),l):t},l.sortValues=function(e){return arguments.length?(r=e,w=null,l):r},l.sort=function(e){return arguments.length?(w=e,r=null,l):w},l.startAngle=function(e){return arguments.length?(p=typeof e=="function"?e:C(+e),l):p},l.endAngle=function(e){return arguments.length?(f=typeof e=="function"?e:C(+e),l):f},l.padAngle=function(e){return arguments.length?(S=typeof e=="function"?e:C(+e),l):S},l}var bt=mt.pie,Q={sections:new Map,showData:!1},E=Q.sections,U=Q.showData,At=structuredClone(bt),Dt=g(()=>structuredClone(At),"getConfig"),Ct=g(()=>{E=new Map,U=Q.showData,ft()},"clear"),kt=g(({label:t,value:r})=>{if(r<0)throw new Error(`"${t}" has invalid value: ${r}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);E.has(t)||(E.set(t,r),K.debug(`added new section: ${t}, with value: ${r}`))},"addSection"),Tt=g(()=>E,"getSections"),Mt=g(t=>{U=t},"setShowData"),Ot=g(()=>U,"getShowData"),Y={getConfig:Dt,clear:Ct,setDiagramTitle:ct,getDiagramTitle:ot,setAccTitle:st,getAccTitle:lt,setAccDescription:it,getAccDescription:nt,addSection:kt,getSections:Tt,setShowData:Mt,getShowData:Ot},zt=g((t,r)=>{rt(t,r),r.setShowData(t.showData),t.sections.map(r.addSection)},"populateDb"),Rt={parse:g(async t=>{const r=await xt("pie",t);K.debug(r),zt(r,Y)},"parse")},Ft=g(t=>`
  .pieCircle{
    stroke: ${t.pieStrokeColor};
    stroke-width : ${t.pieStrokeWidth};
    opacity : ${t.pieOpacity};
  }
  .pieCircle.highlighted{
    scale: 1.05;
    opacity: 1;
  }
  .pieCircle.highlightedOnHover:hover{
    transition-duration: 250ms;
    scale: 1.05;
    opacity: 1;
  }
  .pieOuterCircle{
    stroke: ${t.pieOuterStrokeColor};
    stroke-width: ${t.pieOuterStrokeWidth};
    fill: none;
  }
  .pieTitleText {
    text-anchor: middle;
    font-size: ${t.pieTitleTextSize};
    fill: ${t.pieTitleTextColor};
    font-family: ${t.fontFamily};
  }
  .slice {
    font-family: ${t.fontFamily};
    fill: ${t.pieSectionTextColor};
    font-size:${t.pieSectionTextSize};
    // fill: white;
  }
  .legend text {
    fill: ${t.pieLegendTextColor};
    font-family: ${t.fontFamily};
    font-size: ${t.pieLegendTextSize};
  }
`,"getStyles"),Ht=Ft,Pt=g(t=>{const r=[...t.values()].reduce((p,f)=>p+f,0),w=[...t.entries()].map(([p,f])=>({label:p,value:f})).filter(p=>p.value/r*100>=1);return $t().value(p=>p.value).sort(null)(w)},"createPieArcs"),Wt=g((t,r,w,p)=>{var f;K.debug(`rendering pie chart
`+t);const S=p.db,l=ut(),e=pt(S.getConfig(),l.pie),s=40,n=18,o=4,A=450,m=A,$=dt(r),d=$.append("g");d.attr("transform","translate("+m/2+","+A/2+")");const{themeVariables:i}=l;let[D]=ht(i.pieOuterStrokeWidth);D??(D=2);const T=e.legendPosition,M=e.textPosition,H=e.donutHole>0&&e.donutHole<=.9?e.donutHole:0,c=Math.min(m,A)/2-s,O=X().innerRadius(H*c).outerRadius(c),z=X().innerRadius(c*M).outerRadius(c*M),R=d.append("g");R.append("circle").attr("cx",0).attr("cy",0).attr("r",c+D/2).attr("class","pieOuterCircle");const P=S.getSections(),Z=Pt(P),q=[i.pie1,i.pie2,i.pie3,i.pie4,i.pie5,i.pie6,i.pie7,i.pie8,i.pie9,i.pie10,i.pie11,i.pie12];let L=0;P.forEach(a=>{L+=a});const _=Z.filter(a=>(a.data.value/L*100).toFixed(0)!=="0"),N=vt(q).domain([...P.keys()]);R.selectAll("mySlices").data(_).enter().append("path").attr("d",O).attr("fill",a=>N(a.data.label)).attr("class",a=>{let u="pieCircle";return e.highlightSlice==="hover"?u+=" highlightedOnHover":e.highlightSlice===a.data.label&&(u+=" highlighted"),u}),R.selectAll("mySlices").data(_).enter().append("text").text(a=>(a.data.value/L*100).toFixed(0)+"%").attr("transform",a=>"translate("+z.centroid(a)+")").style("text-anchor","middle").attr("class","slice");const tt=d.append("text").text(S.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText"),F=[...P.entries()].map(([a,u])=>({label:a,value:u})),b=d.selectAll(".legend").data(F).enter().append("g").attr("class","legend");b.append("rect").attr("width",n).attr("height",n).style("fill",a=>N(a.label)).style("stroke",a=>N(a.label)),b.append("text").attr("x",n+o).attr("y",n-o).text(a=>S.getShowData()?`${a.label} [${a.value}]`:a.label);const k=Math.max(...b.selectAll("text").nodes().map(a=>(a==null?void 0:a.getBoundingClientRect().width)??0));let W=A,B=m+s;const h=n+o,I=F.length*h;switch(T){case"center":b.attr("transform",(a,u)=>{const y=h*F.length/2,x=-k/2-(n+o),v=u*h-y;return"translate("+x+","+v+")"});break;case"top":W+=I,b.attr("transform",(a,u)=>{const y=c,x=-k/2-(n+o),v=u*h-y;return`translate(${x}, ${v})`}),R.attr("transform",()=>`translate(0, ${I+h})`);break;case"bottom":W+=I,b.attr("transform",(a,u)=>{const y=-c-h,x=-k/2-(n+o),v=u*h-y;return"translate("+x+","+v+")"});break;case"left":B+=n+o+k,b.attr("transform",(a,u)=>{const y=h*F.length/2,x=-c-(n+o),v=u*h-y;return"translate("+x+","+v+")"}),R.attr("transform",()=>`translate(${k+n+o}, 0)`);break;case"right":default:B+=n+o+k,b.attr("transform",(a,u)=>{const y=h*F.length/2,x=12*n,v=u*h-y;return"translate("+x+","+v+")"});break}const j=((f=tt.node())==null?void 0:f.getBoundingClientRect().width)??0,et=m/2-j/2,at=m/2+j/2,G=Math.min(0,et),J=Math.max(B,at)-G;$.attr("viewBox",`${G} 0 ${J} ${W}`),gt($,W,J,e.useMaxWidth)},"draw"),Et={draw:Wt},Qt={parser:Rt,db:Y,renderer:Et,styles:Ht};export{Qt as diagram};
