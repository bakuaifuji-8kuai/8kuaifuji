import{o as rt}from"./chunk-JWPE2WC7-BPfUMuVx-BWhurgaw-CoPl3vX_.js";import{j as nt,i as it,k as lt,l as st,L as ot,H as ct,Z as h,I as Z,x as ut,a0 as dt,ab as pt,ac as gt,m as ht,U as ft,a1 as mt,ad as k,ae as xt,af as I}from"./index-C38Q3iSC.js";import{g as yt}from"./cynefin-VYW2F7L2-BTJyEgdq-XyyeITFA-Bk2wJR-i.js";import{d as Y}from"./arc-D_0w_X1x-C5kI_33h-CvZl-Xwt.js";import{g as vt}from"./ordinal-Cboi1Yqb-DUCuiKwa-CWcq1aj8.js";import"./init-Gi6I4Gst-DHuO7-vr-BTi8F14B.js";function wt(t,r){return r<t?-1:r>t?1:r>=t?0:NaN}function St(t){return t}function $t(){var t=St,r=wt,w=null,d=k(0),f=k(I),S=k(0);function l(e){var s,n=(e=xt(e)).length,o,A,m=0,$=new Array(n),p=new Array(n),i=+d.apply(this,arguments),T=Math.min(I,Math.max(-I,f.apply(this,arguments)-i)),D,M=Math.min(Math.abs(T)/n,S.apply(this,arguments)),R=M*(T<0?-1:1),c;for(s=0;s<n;++s)(c=p[$[s]=s]=+t(e[s],s,e))>0&&(m+=c);for(r!=null?$.sort(function(O,z){return r(p[O],p[z])}):w!=null&&$.sort(function(O,z){return w(e[O],e[z])}),s=0,A=m?(T-n*R)/m:0;s<n;++s,i=D)o=$[s],c=p[o],D=i+(c>0?c*A:0)+R,p[o]={data:e[o],index:s,value:c,startAngle:i,endAngle:D,padAngle:M};return p}return l.value=function(e){return arguments.length?(t=typeof e=="function"?e:k(+e),l):t},l.sortValues=function(e){return arguments.length?(r=e,w=null,l):r},l.sort=function(e){return arguments.length?(w=e,r=null,l):w},l.startAngle=function(e){return arguments.length?(d=typeof e=="function"?e:k(+e),l):d},l.endAngle=function(e){return arguments.length?(f=typeof e=="function"?e:k(+e),l):f},l.padAngle=function(e){return arguments.length?(S=typeof e=="function"?e:k(+e),l):S},l}var bt=mt.pie,Q={sections:new Map,showData:!1},B=Q.sections,U=Q.showData,At=structuredClone(bt),Tt=h(()=>structuredClone(At),"getConfig"),kt=h(()=>{B=new Map,U=Q.showData,ft()},"clear"),Ct=h(({label:t,value:r})=>{if(r<0)throw new Error(`"${t}" has invalid value: ${r}. Negative values are not allowed in pie charts. All slice values must be >= 0.`);B.has(t)||(B.set(t,r),Z.debug(`added new section: ${t}, with value: ${r}`))},"addSection"),Dt=h(()=>B,"getSections"),Mt=h(t=>{U=t},"setShowData"),Ot=h(()=>U,"getShowData"),_={getConfig:Tt,clear:kt,setDiagramTitle:ct,getDiagramTitle:ot,setAccTitle:st,getAccTitle:lt,setAccDescription:it,getAccDescription:nt,addSection:Ct,getSections:Dt,setShowData:Mt,getShowData:Ot},zt=h((t,r)=>{rt(t,r),r.setShowData(t.showData),t.sections.map(r.addSection)},"populateDb"),Ht={parse:h(async t=>{const r=await yt("pie",t);Z.debug(r),zt(r,_)},"parse")},Pt=h(t=>`
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
`,"getStyles"),Rt=Pt,Ft=h(t=>{const r=[...t.values()].reduce((d,f)=>d+f,0),w=[...t.entries()].map(([d,f])=>({label:d,value:f})).filter(d=>d.value/r*100>=1);return $t().value(d=>d.value).sort(null)(w)},"createPieArcs"),Wt=h((t,r,w,d)=>{var f;Z.debug(`rendering pie chart
`+t);const S=d.db,l=ut(),e=dt(S.getConfig(),l.pie),s=40,n=18,o=4,A=450,m=A,$=pt(r),p=$.append("g");p.attr("transform","translate("+m/2+","+A/2+")");const{themeVariables:i}=l;let[T]=gt(i.pieOuterStrokeWidth);T??(T=2);const D=e.legendPosition,M=e.textPosition,R=e.donutHole>0&&e.donutHole<=.9?e.donutHole:0,c=Math.min(m,A)/2-s,O=Y().innerRadius(R*c).outerRadius(c),z=Y().innerRadius(c*M).outerRadius(c*M),H=p.append("g");H.append("circle").attr("cx",0).attr("cy",0).attr("r",c+T/2).attr("class","pieOuterCircle");const F=S.getSections(),K=Ft(F),X=[i.pie1,i.pie2,i.pie3,i.pie4,i.pie5,i.pie6,i.pie7,i.pie8,i.pie9,i.pie10,i.pie11,i.pie12];let N=0;F.forEach(a=>{N+=a});const V=K.filter(a=>(a.data.value/N*100).toFixed(0)!=="0"),E=vt(X).domain([...F.keys()]);H.selectAll("mySlices").data(V).enter().append("path").attr("d",O).attr("fill",a=>E(a.data.label)).attr("class",a=>{let u="pieCircle";return e.highlightSlice==="hover"?u+=" highlightedOnHover":e.highlightSlice===a.data.label&&(u+=" highlighted"),u}),H.selectAll("mySlices").data(V).enter().append("text").text(a=>(a.data.value/N*100).toFixed(0)+"%").attr("transform",a=>"translate("+z.centroid(a)+")").style("text-anchor","middle").attr("class","slice");const tt=p.append("text").text(S.getDiagramTitle()).attr("x",0).attr("y",-400/2).attr("class","pieTitleText"),P=[...F.entries()].map(([a,u])=>({label:a,value:u})),b=p.selectAll(".legend").data(P).enter().append("g").attr("class","legend");b.append("rect").attr("width",n).attr("height",n).style("fill",a=>E(a.label)).style("stroke",a=>E(a.label)),b.append("text").attr("x",n+o).attr("y",n-o).text(a=>S.getShowData()?`${a.label} [${a.value}]`:a.label);const C=Math.max(...b.selectAll("text").nodes().map(a=>(a==null?void 0:a.getBoundingClientRect().width)??0));let W=A,L=m+s;const g=n+o,j=P.length*g;switch(D){case"center":b.attr("transform",(a,u)=>{const x=g*P.length/2,y=-C/2-(n+o),v=u*g-x;return"translate("+y+","+v+")"});break;case"top":W+=j,b.attr("transform",(a,u)=>{const x=c,y=-C/2-(n+o),v=u*g-x;return`translate(${y}, ${v})`}),H.attr("transform",()=>`translate(0, ${j+g})`);break;case"bottom":W+=j,b.attr("transform",(a,u)=>{const x=-c-g,y=-C/2-(n+o),v=u*g-x;return"translate("+y+","+v+")"});break;case"left":L+=n+o+C,b.attr("transform",(a,u)=>{const x=g*P.length/2,y=-c-(n+o),v=u*g-x;return"translate("+y+","+v+")"}),H.attr("transform",()=>`translate(${C+n+o}, 0)`);break;case"right":default:L+=n+o+C,b.attr("transform",(a,u)=>{const x=g*P.length/2,y=12*n,v=u*g-x;return"translate("+y+","+v+")"});break}const q=((f=tt.node())==null?void 0:f.getBoundingClientRect().width)??0,et=m/2-q/2,at=m/2+q/2,G=Math.min(0,et),J=Math.max(L,at)-G;$.attr("viewBox",`${G} 0 ${J} ${W}`),ht($,W,J,e.useMaxWidth)},"draw"),Bt={draw:Wt},Qt={parser:Ht,db:_,renderer:Bt,styles:Rt};export{Qt as diagram};
