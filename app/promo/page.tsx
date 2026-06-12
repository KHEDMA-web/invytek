"use client";
import { useEffect, useRef } from "react";

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --noir:#14110A;--or:#C9A86A;--or-clair:#E2C896;--or-fonce:#A8854A;--ivoire:#EFE6D2;
  --w1-deep:#8A6D24;
  --wine:#8A1726;--wine-b:#A82236;--wine-d:#6B0F1D;--rose:#E8C4C0;--w2-bg:#2A0A10;
  --biz-bg:#0D0D12;--biz-or:#D4B872;--biz-orc:#EAD9A8;
  --navy:#16284D;--navy-d:#0F1B36;--teal:#2AA792;--ice:#F4F9FB;
  --plum:#2A1030;--coral:#FF7A6B;--viol:#B07CE8;--bd-cream:#FFF7EE;
}
html,body{height:100%}
body{background:#000;display:flex;align-items:center;justify-content:center;
     font-family:'Cormorant Garamond',serif;overflow:hidden}
.stage{position:relative;height:100vh;height:100dvh;aspect-ratio:9/16;max-width:100vw;
       background:var(--noir);overflow:hidden}
.scene{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
       opacity:0;visibility:hidden;transition:opacity .45s ease;z-index:2}
.scene.show{opacity:1;visibility:visible}
#sLogo,#sFeat,#sCta{background:radial-gradient(ellipse at 50% 28%,#221a0e 0%,var(--noir) 65%)}
#sW1{background:radial-gradient(ellipse at 50% 22%,#2a2010 0%,var(--noir) 70%)}
#sW2{background:radial-gradient(ellipse at 50% 22%,#4E1119 0%,var(--w2-bg) 70%)}
#sBiz{background:radial-gradient(ellipse at 50% 22%,#1a1a26 0%,var(--biz-bg) 70%)}
#sMed{background:radial-gradient(ellipse at 50% 20%,#1d3560 0%,var(--navy-d) 72%)}
#sBd{background:radial-gradient(ellipse at 50% 22%,#3d1845 0%,var(--plum) 70%)}
.amb{position:absolute;inset:0;pointer-events:none;z-index:1}
.pt{position:absolute;border-radius:50%;background:var(--or-clair);box-shadow:0 0 6px var(--or);
    animation:risep linear infinite;opacity:0}
@keyframes risep{0%{transform:translateY(102%) scale(0);opacity:0}12%{opacity:.45}88%{opacity:.28}100%{transform:translateY(-4%) scale(1.2);opacity:0}}
.label{position:absolute;top:5.5%;left:0;right:0;text-align:center;
  font-family:'Marcellus',serif;font-size:12px;letter-spacing:4px;text-transform:uppercase;text-indent:4px;
  opacity:0;transform:translateY(-10px)}
.scene.show .label{animation:lblIn .8s ease .4s forwards}
@keyframes lblIn{to{opacity:1;transform:translateY(0)}}
#sLogo .arch{width:86px;margin-bottom:24px;filter:drop-shadow(0 0 24px rgba(201,168,106,.45));
  opacity:0;transform:scale(.92)}
#sLogo.show .arch{animation:popIn .9s cubic-bezier(.16,1,.3,1) .2s forwards}
#sLogo h1{font-family:'Marcellus',serif;font-size:52px;color:var(--ivoire);letter-spacing:3px;opacity:0}
#sLogo.show h1{animation:popIn .9s ease .5s forwards}
#sLogo h1 b{color:var(--or);font-weight:400}
#sLogo .tag{font-family:'Marcellus',serif;font-size:12.5px;letter-spacing:5px;text-transform:uppercase;
  color:var(--or);margin-top:13px;text-indent:5px;opacity:0}
#sLogo.show .tag{animation:popIn .9s ease .8s forwards}
@keyframes popIn{to{opacity:1;transform:scale(1) translateY(0)}}
.env{position:absolute;top:50%;left:50%;width:272px;height:186px;margin:-93px 0 0 -136px;opacity:0}
.scene.show .env{animation:envIn .9s ease .5s forwards,envOut .8s ease 3.6s forwards}
@keyframes envIn{from{opacity:0;transform:translateY(26px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes envOut{to{opacity:0;transform:translateY(34px) scale(.9)}}
.env .ebody{position:absolute;inset:0;border-radius:10px;overflow:hidden}
.env .pkL,.env .pkR{position:absolute;bottom:0;width:0;height:0;border-style:solid;z-index:3}
.env .pkL{left:0;border-width:93px 0 93px 136px}
.env .pkR{right:0;border-width:93px 136px 93px 0}
.env .ebot{position:absolute;bottom:0;left:0;right:0;height:0;z-index:4;
  border-left:136px solid transparent;border-right:136px solid transparent}
.env .eflap{position:absolute;top:0;left:0;right:0;height:0;z-index:6;transform-origin:top;
  border-left:136px solid transparent;border-right:136px solid transparent}
.scene.show .eflap{animation:flapGo .9s ease 2.7s forwards}
@keyframes flapGo{to{transform:rotateX(180deg)}}
.env .eseal{position:absolute;top:50%;left:50%;width:54px;height:54px;margin:-27px 0 0 -27px;z-index:7;border-radius:50%}
.scene.show .eseal{animation:sealGo .6s ease 2.7s forwards,sealPulse 2s ease-in-out infinite}
@keyframes sealGo{to{transform:scale(0) rotate(80deg);opacity:0}}
@keyframes sealPulse{0%,100%{box-shadow:0 6px 16px rgba(0,0,0,.5),0 0 0 0 rgba(255,255,255,.25)}50%{box-shadow:0 6px 16px rgba(0,0,0,.5),0 0 0 12px rgba(255,255,255,0)}}
.env .ehint{position:absolute;bottom:-44px;left:0;right:0;text-align:center;
  font-family:'Marcellus',serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;text-indent:3px;opacity:0}
.scene.show .ehint{animation:hintBl 1.8s ease-in-out 1s 2 forwards}
@keyframes hintBl{0%,100%{opacity:0}30%,70%{opacity:.85}}
#sW1 .ebody{background:linear-gradient(160deg,#FCFAF5,#F7F1E6);
  box-shadow:0 0 0 1px var(--or),0 0 0 4px var(--noir),0 0 0 5px rgba(201,168,106,.35),
             0 26px 60px rgba(0,0,0,.7),0 0 46px rgba(201,168,106,.2)}
#sW1 .pkL{border-color:transparent transparent transparent #f2e7cd}
#sW1 .pkR{border-color:transparent #f2e7cd transparent transparent}
#sW1 .ebot{border-bottom:95px solid #ede0c0}
#sW1 .eflap{border-top:93px solid #f5ecd2;box-shadow:0 2px 8px rgba(184,146,60,.15)}
#sW1 .eseal{background:radial-gradient(circle at 37% 32%,#FBEFC8 0%,var(--or-clair) 34%,var(--or) 60%,var(--w1-deep) 84%,#3E3208 100%);
  box-shadow:inset -4px -6px 11px rgba(62,50,8,.5),inset 3px 4px 9px rgba(255,240,200,.3),0 6px 16px rgba(0,0,0,.4)}
#sW1 .ehint{color:rgba(201,168,106,.8)}
#sW1 .label{color:var(--or)}
#sBiz .ebody{background:linear-gradient(160deg,#1d1d28,#13131b);
  box-shadow:0 0 0 1px var(--biz-or),0 0 0 4px var(--biz-bg),0 0 0 5px rgba(212,184,114,.3),
             0 26px 60px rgba(0,0,0,.7),0 0 46px rgba(212,184,114,.18)}
#sBiz .pkL{border-color:transparent transparent transparent #1f1f2b}
#sBiz .pkR{border-color:transparent #1f1f2b transparent transparent}
#sBiz .ebot{border-bottom:95px solid #23232f}
#sBiz .eflap{border-top:93px solid #262633;box-shadow:0 2px 8px rgba(212,184,114,.12)}
#sBiz .eseal{background:radial-gradient(circle at 37% 32%,#F2E2B5 0%,var(--biz-or) 38%,#9a7c3a 75%,#6e5626 100%);
  box-shadow:inset -4px -6px 11px rgba(60,45,12,.5),inset 3px 4px 9px rgba(255,240,200,.3),0 6px 16px rgba(0,0,0,.5)}
#sBiz .ehint{color:rgba(212,184,114,.75)}
#sBiz .label{color:var(--biz-or)}
.doorL,.doorR{position:absolute;top:0;bottom:0;width:50.5%;z-index:20}
.doorL{left:0}.doorR{right:0}
.scene.show .doorL{animation:dL 1.6s cubic-bezier(.76,0,.24,1) 3.2s forwards}
.scene.show .doorR{animation:dR 1.6s cubic-bezier(.76,0,.24,1) 3.2s forwards}
@keyframes dL{to{transform:translateX(-101%)}}
@keyframes dR{to{transform:translateX(101%)}}
.door-svg{position:absolute;top:50%;transform:translateY(-50%);height:90%;opacity:.5}
.doorL .door-svg{right:-36px}
.doorR .door-svg{left:-36px;transform:translateY(-50%) scaleX(-1)}
.ghint{position:absolute;top:calc(50% + 58px);left:0;right:0;text-align:center;z-index:21;
  font-family:'Marcellus',serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;text-indent:3px;opacity:0}
.scene.show .ghint{animation:hintBl 1.7s ease-in-out .9s 2 forwards}
#sW2 .doorL,#sW2 .doorR{background:linear-gradient(160deg,#3E1018 0%,var(--w2-bg) 100%)}
#sW2 .doorL{border-right:1px solid rgba(168,34,54,.5)}
#sW2 .doorR{border-left:1px solid rgba(168,34,54,.5)}
#sW2 .ghint{color:var(--rose)}
#sW2 .label{color:var(--rose)}
#sMed .doorL,#sMed .doorR{background:linear-gradient(165deg,#1A3158 0%,var(--navy-d) 100%)}
#sMed .doorL{border-right:1px solid rgba(42,167,146,.5)}
#sMed .doorR{border-left:1px solid rgba(42,167,146,.5)}
#sMed .ghint{color:rgba(160,200,225,.85)}
#sMed .label{color:var(--teal)}
.ecg{position:absolute;top:50%;left:0;right:0;height:90px;margin-top:-45px;z-index:21;pointer-events:none}
.ecg polyline{fill:none;stroke:var(--teal);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;
  filter:drop-shadow(0 0 7px rgba(42,167,146,.8));stroke-dasharray:1200;stroke-dashoffset:1200;opacity:0}
#sMed.show .ecg polyline{animation:ecgDraw 1.6s ease .7s forwards,ecgFade .5s ease 3.4s forwards}
@keyframes ecgDraw{from{stroke-dashoffset:1200;opacity:1}to{stroke-dashoffset:0;opacity:1}}
@keyframes ecgFade{to{opacity:0}}
.tall{position:absolute;left:50%;top:50%;width:min(316px,80%);height:82%;
  margin-left:calc(min(316px,80%) / -2);transform:translateY(-44%);
  overflow:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:13% 9%;text-align:center;opacity:0;z-index:10}
.scene.show .tall.fromEnv{animation:cardRise 1.3s cubic-bezier(.16,1,.3,1) 3.4s forwards}
.scene.show .tall.fromDoor{animation:cardPop 1.1s cubic-bezier(.16,1,.3,1) 3.6s forwards}
.scene.show .tall.fromBurst{animation:cardPop 1.1s cubic-bezier(.16,1,.3,1) 1.5s forwards}
@keyframes cardRise{from{opacity:0;transform:translateY(20%)}to{opacity:1;transform:translateY(-50%)}}
@keyframes cardPop{from{opacity:0;transform:translateY(-50%) scale(.92)}to{opacity:1;transform:translateY(-50%) scale(1)}}
.tall .it{opacity:0;transform:translateY(16px)}
.scene.show .tall .it{animation:itIn .8s ease forwards}
.scene.show .tall.fromEnv .i1{animation-delay:4.2s}.scene.show .tall.fromEnv .i2{animation-delay:4.55s}
.scene.show .tall.fromEnv .i3{animation-delay:4.9s}.scene.show .tall.fromEnv .i4{animation-delay:5.25s}
.scene.show .tall.fromEnv .i5{animation-delay:5.6s}
.scene.show .tall.fromDoor .i1{animation-delay:4.4s}.scene.show .tall.fromDoor .i2{animation-delay:4.75s}
.scene.show .tall.fromDoor .i3{animation-delay:5.1s}.scene.show .tall.fromDoor .i4{animation-delay:5.45s}
.scene.show .tall.fromDoor .i5{animation-delay:5.8s}
.scene.show .tall.fromBurst .i1{animation-delay:2.2s}.scene.show .tall.fromBurst .i2{animation-delay:2.55s}
.scene.show .tall.fromBurst .i3{animation-delay:2.9s}.scene.show .tall.fromBurst .i4{animation-delay:3.25s}
.scene.show .tall.fromBurst .i5{animation-delay:3.6s}
@keyframes itIn{to{opacity:1;transform:translateY(0)}}
.csweep{position:absolute;inset:0;overflow:hidden;pointer-events:none;border-radius:inherit}
.csweep::before{content:'';position:absolute;top:-50%;left:-80%;width:42%;height:200%;transform:rotate(9deg)}
.scene.show .csweep::before{animation:cs 5s ease-in-out 5.5s infinite}
@keyframes cs{0%{left:-80%}38%{left:140%}100%{left:140%}}
.eyebrow{font-family:'Marcellus',serif;font-size:10.5px;letter-spacing:4px;text-transform:uppercase;text-indent:4px}
.script{font-family:'Pinyon Script',cursive;font-weight:400;line-height:1.08;
  background-size:240% auto;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
  animation:shineTxt 5.5s ease-in-out infinite}
@keyframes shineTxt{0%,100%{background-position:0% center}50%{background-position:100% center}}
.inv{font-size:16.5px;font-style:italic;line-height:1.6;margin-top:13px}
.rule{width:54px;height:1px;margin:17px auto}
.daterow{display:flex;align-items:center;justify-content:center;gap:13px}
.daterow .d{font-family:'Marcellus',serif;font-size:26px;line-height:1}
.daterow .dot{width:4px;height:4px;border-radius:50%}
.day{font-family:'Marcellus',serif;font-size:12px;letter-spacing:4px;text-transform:uppercase;text-indent:4px;margin-top:9px}
.lieu{font-size:16.5px;line-height:1.65;margin-top:9px}
.btnrow{display:flex;gap:9px;justify-content:center;margin-top:18px}
.chip{font-family:'Marcellus',serif;font-size:9.5px;letter-spacing:2px;text-transform:uppercase;text-indent:2px;
  padding:11px 19px;border-radius:30px;white-space:nowrap}
.cdrow{display:flex;gap:8px;justify-content:center;margin-top:18px}
.cdbox{min-width:50px;padding:9px 6px 7px;border-radius:11px}
.cdbox .n{font-family:'Marcellus',serif;font-size:18px;line-height:1}
.cdbox .l{font-family:'Marcellus',serif;font-size:7px;letter-spacing:1.5px;text-transform:uppercase;margin-top:4px}
#sW1 .tall{border-radius:170px 170px 20px 20px;
  background:linear-gradient(170deg,#FCFAF5 0%,#F5EEE0 100%);
  box-shadow:0 0 0 1px var(--or),0 0 0 6px var(--noir),0 0 0 7px rgba(201,168,106,.3),
             0 36px 80px rgba(0,0,0,.75),0 0 60px rgba(201,168,106,.18)}
#sW1 .tall::before{content:'';position:absolute;inset:13px;border:1px solid rgba(184,146,60,.5);
  border-radius:158px 158px 13px 13px;pointer-events:none}
#sW1 .csweep::before{background:linear-gradient(100deg,transparent,rgba(255,244,214,.5),transparent)}
#sW1 .eyebrow{color:var(--w1-deep)}
#sW1 .script{font-size:44px;
  background-image:linear-gradient(115deg,#5A4612 0%,var(--w1-deep) 30%,#B8923C 50%,var(--w1-deep) 70%,#5A4612 100%)}
#sW1 .inv{color:#6B5C3E}
#sW1 .rule{background:linear-gradient(90deg,transparent,#B8923C,transparent)}
#sW1 .daterow .d{color:var(--w1-deep)}
#sW1 .daterow .dot{background:#D4AF61}
#sW1 .day{color:#B8923C}
#sW1 .lieu{color:#463A1E}
#sW1 .lieu b{color:var(--w1-deep);font-style:italic;font-weight:600}
#sW1 .chip.full{background:linear-gradient(135deg,#D4AF61,var(--w1-deep));color:#fff;box-shadow:0 6px 20px rgba(184,146,60,.35)}
#sW1 .chip.line{border:1px solid #B8923C;color:var(--w1-deep)}
#sW2 .tall{border-radius:50% / 9%;
  background:linear-gradient(170deg,#FFFFFF 0%,#FBF3ED 100%);
  box-shadow:0 0 0 6px var(--w2-bg),0 0 0 7px rgba(168,34,54,.4),
             0 36px 80px rgba(0,0,0,.7),0 0 60px rgba(138,23,38,.2)}
#sW2 .tall::before{content:'';position:absolute;inset:14px;border:1.5px solid var(--wine);
  border-radius:50% / 8%;pointer-events:none}
#sW2 .csweep::before{background:linear-gradient(100deg,transparent,rgba(255,235,235,.45),transparent)}
#sW2 .eyebrow{color:var(--wine)}
#sW2 .script{font-size:42px;
  background-image:linear-gradient(115deg,#540B16 0%,var(--wine) 35%,var(--wine-b) 50%,var(--wine) 65%,#540B16 100%)}
#sW2 .inv{color:#7A4A4E}
#sW2 .rule{background:linear-gradient(90deg,transparent,var(--wine-b),transparent)}
#sW2 .daterow .d{color:var(--wine-d)}
#sW2 .daterow .dot{background:var(--wine-b)}
#sW2 .day{color:var(--wine)}
#sW2 .lieu{color:#5C2A30}
#sW2 .lieu b{color:var(--wine-d);font-style:italic;font-weight:600}
#sW2 .chip.full{background:linear-gradient(135deg,var(--wine-b),var(--wine-d));color:#fff;box-shadow:0 6px 20px rgba(138,23,38,.35)}
#sW2 .chip.line{border:1px solid var(--wine);color:var(--wine-d)}
.w2fl{position:absolute;width:120px;opacity:.45;pointer-events:none}
.w2fl.tl{top:6px;left:6px}.w2fl.br{bottom:6px;right:6px;transform:rotate(180deg)}
#sBiz .tall{border-radius:170px 170px 20px 20px;
  background:linear-gradient(170deg,#1A1A24 0%,#121219 100%);
  box-shadow:0 0 0 1px var(--biz-or),0 0 0 6px var(--biz-bg),0 0 0 7px rgba(212,184,114,.28),
             0 36px 80px rgba(0,0,0,.75),0 0 60px rgba(212,184,114,.15)}
#sBiz .tall::before{content:'';position:absolute;inset:13px;border:1px solid rgba(212,184,114,.5);
  border-radius:158px 158px 13px 13px;pointer-events:none}
#sBiz .csweep::before{background:linear-gradient(100deg,transparent,rgba(255,244,214,.13),transparent)}
#sBiz .eyebrow{color:var(--biz-or)}
#sBiz .script{font-size:44px;
  background-image:linear-gradient(115deg,#9a7c3a 0%,var(--biz-or) 35%,var(--biz-orc) 50%,var(--biz-or) 65%,#9a7c3a 100%)}
#sBiz .inv{color:#B5AC97}
#sBiz .rule{background:linear-gradient(90deg,transparent,var(--biz-or),transparent)}
#sBiz .daterow .d{color:var(--biz-orc)}
#sBiz .daterow .dot{background:var(--biz-or)}
#sBiz .day{color:var(--biz-or)}
#sBiz .lieu{color:#C9C2B0}
#sBiz .lieu b{color:var(--biz-orc);font-style:italic;font-weight:500}
#sBiz .cdbox{background:rgba(212,184,114,.07);border:1px solid rgba(212,184,114,.35)}
#sBiz .cdbox .n{color:var(--biz-orc)}
#sBiz .cdbox .l{color:#8d8775}
#sBiz .chip.full{background:linear-gradient(135deg,var(--biz-orc),#9a7c3a);color:#101018;box-shadow:0 6px 20px rgba(212,184,114,.3)}
#sBiz .chip.line{border:1px solid rgba(212,184,114,.55);color:var(--biz-or)}
#sMed .tall{border-radius:24px;height:80%;
  background:linear-gradient(172deg,#FFFFFF 0%,var(--ice) 100%);
  border-top:6px solid var(--teal);
  box-shadow:0 0 0 5px var(--navy-d),0 0 0 6px rgba(42,167,146,.35),
             0 36px 80px rgba(0,0,0,.6),0 0 55px rgba(42,167,146,.2)}
#sMed .tall::before{content:'';position:absolute;inset:12px;border:1px solid rgba(42,167,146,.3);
  border-radius:16px;pointer-events:none}
#sMed .csweep::before{background:linear-gradient(100deg,transparent,rgba(42,167,146,.1),transparent)}
.mcross{position:absolute;top:-30px;right:-30px;width:150px;height:150px;opacity:.07;pointer-events:none}
.picto{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(135deg,var(--teal),#1d7363);box-shadow:0 6px 18px rgba(42,167,146,.35)}
.picto svg{width:24px;height:24px;color:#fff}
#sMed .eyebrow{font-size:9.5px;letter-spacing:3px;color:var(--teal);margin-top:14px;line-height:1.8}
#sMed h2{font-family:'Marcellus',serif;font-size:24px;line-height:1.3;color:var(--navy);margin-top:9px}
#sMed .rule{background:linear-gradient(90deg,transparent,var(--teal),transparent);margin:15px auto}
#sMed .dates{font-family:'Marcellus',serif;font-size:19px;color:var(--teal);letter-spacing:1px}
#sMed .lieu{color:#3d4f6b;margin-top:7px}
.badges{display:flex;gap:7px;justify-content:center;margin-top:15px;flex-wrap:wrap}
.bdg{font-family:'Marcellus',serif;font-size:8.5px;letter-spacing:1.2px;text-transform:uppercase;
  background:rgba(42,167,146,.09);border:1px solid rgba(42,167,146,.4);color:#1f7a6b;
  padding:7px 13px;border-radius:20px}
#sMed .chip.full{background:linear-gradient(135deg,var(--teal),#1d7363);color:#fff;box-shadow:0 6px 20px rgba(42,167,146,.35)}
#sMed .chip.line{border:1px solid rgba(42,167,146,.55);color:#1f7a6b}
#sBd .label{color:var(--coral)}
.burst{position:absolute;top:50%;left:50%;width:0;height:0;z-index:8;pointer-events:none}
.cf{position:absolute;width:9px;height:13px;border-radius:2px;opacity:0;
  transform:translate(0,0) rotate(0)}
#sBd.show .cf{animation:cfGo 1.6s cubic-bezier(.13,.66,.32,1) .6s forwards}
@keyframes cfGo{
  0%{opacity:0;transform:translate(0,0) rotate(0) scale(.4)}
  12%{opacity:1}
  100%{opacity:0;transform:translate(var(--tx),var(--ty)) rotate(var(--rz)) scale(1)}
}
#sBd .tall{border-radius:26px;height:78%;
  background:linear-gradient(172deg,var(--bd-cream) 0%,#FCEEE6 100%);
  box-shadow:0 0 0 5px var(--plum),0 0 0 6px rgba(255,122,107,.45),
             0 36px 80px rgba(0,0,0,.6),0 0 55px rgba(255,122,107,.22)}
#sBd .tall::before{content:'';position:absolute;left:0;right:0;top:0;height:7px;
  background:linear-gradient(90deg,var(--coral),var(--viol),#FFC46B,var(--coral));background-size:300% 100%;
  animation:ribbon 5s linear infinite}
@keyframes ribbon{to{background-position:300% 0}}
#sBd .tall::after{content:'';position:absolute;inset:13px;border:1px dashed rgba(255,122,107,.45);
  border-radius:18px;pointer-events:none}
#sBd .csweep::before{background:linear-gradient(100deg,transparent,rgba(255,200,160,.35),transparent)}
#sBd .eyebrow{color:#C45A4D}
#sBd .script{font-size:42px;
  background-image:linear-gradient(115deg,#C45A4D 0%,var(--coral) 35%,#FFAA7E 50%,var(--coral) 65%,#C45A4D 100%)}
#sBd .agenum{font-family:'Marcellus',serif;font-size:58px;line-height:1;margin-top:6px;
  background:linear-gradient(135deg,var(--coral),var(--viol));
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
#sBd .inv{color:#8A5A50}
#sBd .rule{background:linear-gradient(90deg,transparent,var(--coral),transparent)}
#sBd .daterow .d{color:#C45A4D}
#sBd .daterow .dot{background:var(--coral)}
#sBd .day{color:#C45A4D}
#sBd .lieu{color:#6E4138}
#sBd .lieu b{color:#C45A4D;font-style:italic;font-weight:600}
#sBd .chip.full{background:linear-gradient(135deg,var(--coral),var(--viol));color:#fff;box-shadow:0 6px 20px rgba(255,122,107,.4)}
#sBd .chip.line{border:1px solid var(--coral);color:#C45A4D}
#sFeat{gap:13px;padding:8% 10%}
#sFeat .head{font-family:'Marcellus',serif;font-size:13px;letter-spacing:4px;text-transform:uppercase;
  text-indent:4px;color:var(--or);margin-bottom:10px;opacity:0}
#sFeat.show .head{animation:itIn .8s ease .3s forwards}
.feat{display:flex;align-items:center;gap:14px;width:100%;max-width:330px;
  background:rgba(255,255,255,.045);border:1px solid rgba(201,168,106,.35);
  border-radius:16px;padding:15px 18px;opacity:0;transform:translateX(-24px)}
#sFeat.show .feat{animation:fIn .7s ease .2s forwards}
#sFeat.show .feat:nth-of-type(2){animation-delay:.6s}
#sFeat.show .feat:nth-of-type(3){animation-delay:1.0s}
#sFeat.show .feat:nth-of-type(4){animation-delay:1.4s}
#sFeat.show .feat:nth-of-type(5){animation-delay:1.8s}
@keyframes fIn{to{opacity:1;transform:translateX(0)}}
.feat svg{width:25px;height:25px;flex-shrink:0;color:var(--or)}
.feat .t{font-family:'Marcellus',serif;font-size:13.5px;letter-spacing:1px;color:var(--ivoire)}
.feat .d{font-size:13.5px;color:#a99e85;font-style:italic;line-height:1.35}
#sCta .arch{width:62px;margin-bottom:18px;filter:drop-shadow(0 0 18px rgba(201,168,106,.4));opacity:0;transform:scale(.92)}
#sCta.show .arch{animation:popIn .9s ease .2s forwards}
#sCta h1{font-family:'Marcellus',serif;font-size:40px;color:var(--ivoire);letter-spacing:2px;opacity:0}
#sCta.show h1{animation:popIn .9s ease .5s forwards}
#sCta h1 b{color:var(--or);font-weight:400}
#sCta .line2{font-size:20px;font-style:italic;color:#bdb094;margin-top:13px;text-align:center;line-height:1.5;opacity:0}
#sCta.show .line2{animation:popIn .9s ease .8s forwards}
#sCta .btn{margin-top:24px;font-family:'Marcellus',serif;font-size:11.5px;letter-spacing:3px;text-transform:uppercase;
  text-indent:3px;background:linear-gradient(135deg,var(--or-clair),var(--or-fonce));color:#14110A;
  padding:14px 32px;border-radius:40px;opacity:0;cursor:pointer;text-decoration:none;display:inline-block;
  box-shadow:0 8px 30px rgba(201,168,106,.4)}
#sCta.show .btn{animation:popIn .9s ease 1.1s forwards,pulse 2.2s ease-in-out 2s infinite}
@keyframes pulse{0%,100%{box-shadow:0 8px 30px rgba(201,168,106,.4)}50%{box-shadow:0 8px 30px rgba(201,168,106,.4),0 0 0 14px rgba(201,168,106,0)}}
.wipe{position:absolute;inset:-2% -30%;z-index:40;pointer-events:none;
  transform:translateX(-130%) skewX(-12deg)}
.wipe.go{animation:wipeGo 1.1s cubic-bezier(.65,0,.35,1) forwards}
@keyframes wipeGo{0%{transform:translateX(-130%) skewX(-12deg)}100%{transform:translateX(130%) skewX(-12deg)}}
.wipe.c-gold{background:linear-gradient(100deg,transparent 0%,#B8923C 18%,#E2C896 50%,#B8923C 82%,transparent 100%)}
.wipe.c-wine{background:linear-gradient(100deg,transparent 0%,#6B0F1D 18%,#A82236 50%,#6B0F1D 82%,transparent 100%)}
.wipe.c-biz{background:linear-gradient(100deg,transparent 0%,#13131b 14%,#D4B872 50%,#13131b 86%,transparent 100%)}
.wipe.c-teal{background:linear-gradient(100deg,transparent 0%,#16284D 16%,#2AA792 50%,#16284D 84%,transparent 100%)}
.wipe.c-coral{background:linear-gradient(100deg,transparent 0%,#B07CE8 16%,#FF7A6B 50%,#B07CE8 84%,transparent 100%)}
.wipe.c-dark{background:linear-gradient(100deg,transparent 0%,#221a0e 16%,#C9A86A 50%,#221a0e 84%,transparent 100%)}
.progress{position:absolute;bottom:0;left:0;height:3px;width:0;z-index:50;
  background:linear-gradient(90deg,var(--or-fonce),var(--or-clair))}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`;

export default function PromoPage() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    /* particules */
    const amb = document.getElementById("amb");
    if (amb) {
      for (let i = 0; i < 22; i++) {
        const p = document.createElement("div");
        p.className = "pt";
        p.style.left = Math.random() * 100 + "%";
        const s = Math.random() * 2.6 + 1.2;
        p.style.width = p.style.height = s + "px";
        p.style.animationDuration = Math.random() * 11 + 8 + "s";
        p.style.animationDelay = Math.random() * 12 + "s";
        amb.appendChild(p);
      }
    }

    /* confettis anniversaire */
    const burst = document.getElementById("burst");
    if (burst) {
      const cfCols = ["#FF7A6B", "#B07CE8", "#FFC46B", "#6BD3C2", "#FF9ECF"];
      for (let i = 0; i < 42; i++) {
        const c = document.createElement("div");
        c.className = "cf";
        const ang = Math.random() * Math.PI * 2;
        const dist = 130 + Math.random() * 220;
        c.style.setProperty("--tx", Math.cos(ang) * dist + "px");
        c.style.setProperty("--ty", Math.sin(ang) * dist - 60 + "px");
        c.style.setProperty("--rz", Math.random() * 720 - 360 + "deg");
        c.style.background = cfCols[i % cfCols.length];
        c.style.animationDelay = 0.6 + Math.random() * 0.25 + "s";
        burst.appendChild(c);
      }
    }

    /* compte à rebours business */
    const bjEl = document.getElementById("bj");
    const bhEl = document.getElementById("bh");
    const bmEl = document.getElementById("bm");
    const bsEl = document.getElementById("bs");
    function cdb() {
      const t = new Date("2026-09-24T19:30:00").getTime() - Date.now();
      if (t < 0) return;
      if (bjEl) bjEl.textContent = String(Math.floor(t / 86400000));
      if (bhEl) bhEl.textContent = String(Math.floor((t % 86400000) / 3600000)).padStart(2, "0");
      if (bmEl) bmEl.textContent = String(Math.floor((t % 3600000) / 60000)).padStart(2, "0");
      if (bsEl) bsEl.textContent = String(Math.floor((t % 60000) / 1000)).padStart(2, "0");
    }
    cdb();
    const cdInterval = setInterval(cdb, 1000);

    /* ORCHESTRATION */
    const TL = [
      { id: "sLogo", dur: 4, wipe: null },
      { id: "sW1", dur: 14, wipe: "c-gold" },
      { id: "sW2", dur: 14, wipe: "c-wine" },
      { id: "sBiz", dur: 14, wipe: "c-biz" },
      { id: "sMed", dur: 14, wipe: "c-teal" },
      { id: "sBd", dur: 14, wipe: "c-coral" },
      { id: "sFeat", dur: 8, wipe: "c-dark" },
      { id: "sCta", dur: 8, wipe: "c-gold" },
    ];
    const TOTAL = TL.reduce((a, b) => a + b.dur, 0);
    const wipeEl = document.getElementById("wipe");
    const progEl = document.getElementById("prog");
    let idx = 0;
    let t0 = performance.now();
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    function showScene(i: number) {
      TL.forEach((s, k) => {
        const el = document.getElementById(s.id);
        if (!el) return;
        if (k === i) {
          el.classList.remove("show");
          void el.offsetWidth;
          el.classList.add("show");
        } else {
          el.classList.remove("show");
        }
      });
    }

    function fireWipe(cls: string | null) {
      if (!cls || !wipeEl) return;
      wipeEl.className = "wipe " + cls;
      void wipeEl.offsetWidth;
      wipeEl.classList.add("go");
    }

    function schedule() {
      const cur = TL[idx];
      const next = (idx + 1) % TL.length;
      timeouts.push(setTimeout(() => fireWipe(TL[next].wipe), (cur.dur - 0.55) * 1000));
      timeouts.push(
        setTimeout(() => {
          idx = next;
          if (idx === 0) t0 = performance.now();
          showScene(idx);
          schedule();
        }, cur.dur * 1000)
      );
    }

    showScene(0);
    schedule();

    let rafId: number;
    function tick() {
      if (progEl) {
        const e = ((performance.now() - t0) / 1000) % TOTAL;
        progEl.style.width = (e / TOTAL) * 100 + "%";
      }
      rafId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      clearInterval(cdInterval);
      timeouts.forEach(clearTimeout);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="stage" id="stage">
        <div className="amb" id="amb" />

        {/* LOGO */}
        <div className="scene show" id="sLogo">
          <svg className="arch" viewBox="0 0 40 44" fill="none">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E2C896" />
                <stop offset="100%" stopColor="#A8854A" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="3" r="2.4" fill="url(#g1)" />
            <path d="M5 42 L5 20 A15 15 0 0 1 35 20 L35 42 Z" stroke="url(#g1)" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M14 42 L14 22 A6 6 0 0 1 26 22 L26 42 Z" stroke="url(#g1)" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          <h1>Invy<b>tek</b></h1>
          <div className="tag">Invitations interactives</div>
        </div>

        {/* MARIAGE OR */}
        <div className="scene" id="sW1">
          <div className="label">Thème · Mariage — Or</div>
          <div className="tall fromEnv">
            <div className="csweep" />
            <div className="eyebrow it i1">Famille Benali</div>
            <h2 className="script it i1">Sara &amp; Yacine</h2>
            <div className="inv it i2">ont l&apos;immense joie de vous convier<br />à la cérémonie de leur mariage</div>
            <div className="rule it i2" />
            <div className="it i3">
              <div className="daterow"><span className="d">19</span><span className="dot" /><span className="d">06</span><span className="dot" /><span className="d">2027</span></div>
              <div className="day">Vendredi · 14h00</div>
              <div className="lieu"><b>Salle des fêtes Les Jardins</b><br />Alger</div>
            </div>
            <div className="btnrow it i4">
              <span className="chip full">Enregistrer la date</span>
              <span className="chip line">Itinéraire</span>
            </div>
          </div>
          <div className="env">
            <div className="ebody" /><div className="pkL" /><div className="pkR" />
            <div className="ebot" /><div className="eflap" /><div className="eseal" />
            <div className="ehint">Touchez pour ouvrir</div>
          </div>
        </div>

        {/* MARIAGE BORDEAUX */}
        <div className="scene" id="sW2">
          <div className="label">Thème · Mariage — Bordeaux</div>
          <div className="tall fromDoor">
            <div className="csweep" />
            <svg className="w2fl tl" viewBox="0 0 120 120" fill="none"><g stroke="#8A1726" strokeWidth="1">
              <path d="M10 10 C45 16 75 38 82 75" fill="none" /><path d="M10 10 C16 45 38 75 75 82" fill="none" />
              <path d="M25 13 C37 18 42 28 39 40 C31 33 26 25 25 13Z" fill="rgba(138,23,38,.08)" />
              <path d="M13 25 C18 37 28 42 40 39 C33 31 25 26 13 25Z" fill="rgba(138,23,38,.08)" />
              <circle cx="10" cy="10" r="2.4" fill="#8A1726" /></g></svg>
            <svg className="w2fl br" viewBox="0 0 120 120" fill="none"><g stroke="#8A1726" strokeWidth="1">
              <path d="M10 10 C45 16 75 38 82 75" fill="none" /><path d="M10 10 C16 45 38 75 75 82" fill="none" />
              <path d="M25 13 C37 18 42 28 39 40 C31 33 26 25 25 13Z" fill="rgba(138,23,38,.08)" />
              <circle cx="10" cy="10" r="2.4" fill="#8A1726" /></g></svg>
            <div className="eyebrow it i1">Famille Hammoud</div>
            <h2 className="script it i1">Lina &amp; Mehdi</h2>
            <div className="inv it i2">ont l&apos;immense joie de vous convier<br />à la célébration de leur mariage</div>
            <div className="rule it i2" />
            <div className="it i3">
              <div className="daterow"><span className="d">13</span><span className="dot" /><span className="d">06</span><span className="dot" /><span className="d">2027</span></div>
              <div className="day">Samedi · 17h00</div>
              <div className="lieu"><b>Salle des fêtes Le Pavillon</b><br />Dely Brahim</div>
            </div>
            <div className="btnrow it i4">
              <span className="chip full">Enregistrer la date</span>
              <span className="chip line">Itinéraire</span>
            </div>
          </div>
          <div className="doorL">
            <svg className="door-svg" viewBox="0 0 120 600" fill="none"><g stroke="#A82236" strokeWidth="1.4" strokeLinecap="round">
              <path d="M110 0 C70 90 95 180 60 270 C90 360 65 460 100 600" fill="none" />
              <path d="M105 60 C75 80 60 70 55 50 C72 48 92 52 105 60Z" fill="rgba(168,34,54,.18)" />
              <path d="M95 130 C65 150 50 140 45 120 C62 116 82 122 95 130Z" fill="rgba(168,34,54,.15)" />
              <path d="M100 210 C70 230 55 220 50 200 C67 196 87 202 100 210Z" fill="rgba(168,34,54,.15)" />
              <path d="M85 300 C55 318 42 308 38 290 C55 286 73 292 85 300Z" fill="rgba(168,34,54,.13)" />
              <path d="M100 400 C70 418 56 408 52 390 C69 386 88 392 100 400Z" fill="rgba(168,34,54,.12)" />
              <path d="M90 500 C60 518 47 508 43 490 C60 486 78 492 90 500Z" fill="rgba(168,34,54,.12)" />
              <circle cx="105" cy="40" r="3" fill="#A82236" /><circle cx="92" cy="350" r="3" fill="#A82236" /></g></svg>
          </div>
          <div className="doorR">
            <svg className="door-svg" viewBox="0 0 120 600" fill="none"><g stroke="#A82236" strokeWidth="1.4" strokeLinecap="round">
              <path d="M110 0 C70 90 95 180 60 270 C90 360 65 460 100 600" fill="none" />
              <path d="M105 60 C75 80 60 70 55 50 C72 48 92 52 105 60Z" fill="rgba(168,34,54,.18)" />
              <path d="M95 130 C65 150 50 140 45 120 C62 116 82 122 95 130Z" fill="rgba(168,34,54,.15)" />
              <path d="M100 210 C70 230 55 220 50 200 C67 196 87 202 100 210Z" fill="rgba(168,34,54,.15)" />
              <path d="M85 300 C55 318 42 308 38 290 C55 286 73 292 85 300Z" fill="rgba(168,34,54,.13)" />
              <path d="M100 400 C70 418 56 408 52 390 C69 386 88 392 100 400Z" fill="rgba(168,34,54,.12)" />
              <circle cx="105" cy="40" r="3" fill="#A82236" /></g></svg>
          </div>
          <div className="ghint">Touchez pour ouvrir</div>
        </div>

        {/* BUSINESS */}
        <div className="scene" id="sBiz">
          <div className="label">Thème · Business</div>
          <div className="tall fromEnv">
            <div className="csweep" />
            <div className="eyebrow it i1">TechVision Group</div>
            <h2 className="script it i1">Soirée de Gala</h2>
            <div className="inv it i2">a le plaisir de vous convier à<br />sa soirée annuelle d&apos;exception</div>
            <div className="rule it i2" />
            <div className="it i3">
              <div className="daterow"><span className="d">24</span><span className="dot" /><span className="d">09</span><span className="dot" /><span className="d">2026</span></div>
              <div className="day">Jeudi · 19h30</div>
              <div className="lieu"><b>Hôtel Sofitel</b><br />Alger</div>
            </div>
            <div className="cdrow it i4">
              <div className="cdbox"><div className="n" id="bj">––</div><div className="l">Jours</div></div>
              <div className="cdbox"><div className="n" id="bh">––</div><div className="l">Heures</div></div>
              <div className="cdbox"><div className="n" id="bm">––</div><div className="l">Min</div></div>
              <div className="cdbox"><div className="n" id="bs">––</div><div className="l">Sec</div></div>
            </div>
            <div className="btnrow it i5">
              <span className="chip full">Confirmer</span>
              <span className="chip line">Itinéraire</span>
            </div>
          </div>
          <div className="env">
            <div className="ebody" /><div className="pkL" /><div className="pkR" />
            <div className="ebot" /><div className="eflap" /><div className="eseal" />
            <div className="ehint">L&apos;invitation s&apos;ouvre…</div>
          </div>
        </div>

        {/* MÉDICAL */}
        <div className="scene" id="sMed">
          <div className="label">Thème · Médical</div>
          <div className="tall fromDoor">
            <svg className="mcross" viewBox="0 0 100 100" fill="#16284D"><path d="M38 10h24v28h28v24H62v28H38V62H10V38h28z" /></svg>
            <div className="csweep" />
            <div className="picto it i1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h4l2.5-6 4 12 2.5-6h5" />
              </svg>
            </div>
            <div className="eyebrow it i1">Société Algérienne<br />de Cardiologie</div>
            <h2 className="it i2">12ᵉ Congrès International<br />de Cardiologie</h2>
            <div className="rule it i2" />
            <div className="it i3">
              <div className="dates">15 – 17 Octobre 2026</div>
              <div className="lieu">Centre International de Conférences<br />Alger</div>
            </div>
            <div className="badges it i4">
              <span className="bdg">Programme</span><span className="bdg">Accréditation</span><span className="bdg">40 intervenants</span>
            </div>
            <div className="btnrow it i5">
              <span className="chip full">S&apos;inscrire</span>
              <span className="chip line">Itinéraire</span>
            </div>
          </div>
          <div className="doorL" /><div className="doorR" />
          <svg className="ecg" viewBox="0 0 405 90" preserveAspectRatio="none">
            <polyline points="0,45 95,45 115,45 126,20 138,70 148,10 160,62 172,45 250,45 262,32 274,52 284,45 405,45" />
          </svg>
          <div className="ghint">Touchez pour ouvrir</div>
        </div>

        {/* ANNIVERSAIRE */}
        <div className="scene" id="sBd">
          <div className="label">Thème · Anniversaire</div>
          <div className="burst" id="burst" />
          <div className="tall fromBurst">
            <div className="csweep" />
            <div className="eyebrow it i1">On fête ça !</div>
            <h2 className="script it i1">Yasmine</h2>
            <div className="agenum it i2">30</div>
            <div className="inv it i2">vous invite à célébrer<br />ses trente ans</div>
            <div className="rule it i3" />
            <div className="it i3">
              <div className="daterow"><span className="d">07</span><span className="dot" /><span className="d">11</span><span className="dot" /><span className="d">2026</span></div>
              <div className="day">Samedi · 20h00</div>
              <div className="lieu"><b>Rooftop Le Panorama</b><br />Oran</div>
            </div>
            <div className="btnrow it i4">
              <span className="chip full">Je serai là !</span>
              <span className="chip line">Itinéraire</span>
            </div>
          </div>
        </div>

        {/* FONCTIONS */}
        <div className="scene" id="sFeat">
          <div className="head">Tout est inclus</div>
          <div className="feat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M20 6 9 17l-5-5" /></svg>
            <div><div className="t">Confirmations RSVP</div><div className="d">Suivez vos invités en temps réel</div></div>
          </div>
          <div className="feat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
            <div><div className="t">Compte à rebours en direct</div><div className="d">L&apos;attente devient un événement</div></div>
          </div>
          <div className="feat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>
            <div><div className="t">Itinéraire intégré</div><div className="d">Vos invités arrivent sans se perdre</div></div>
          </div>
          <div className="feat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg>
            <div><div className="t">Lien unique partageable</div><div className="d">WhatsApp, email, QR code…</div></div>
          </div>
          <div className="feat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.8H20l-5 3.6 1.9 5.8-4.9-3.6-4.9 3.6L9 12.4 4 8.8h6.1z" /></svg>
            <div><div className="t">Thèmes par catégorie</div><div className="d">Mariage, business, médical, fêtes…</div></div>
          </div>
        </div>

        {/* CTA */}
        <div className="scene" id="sCta">
          <svg className="arch" viewBox="0 0 40 44" fill="none">
            <defs>
              <linearGradient id="g5" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E2C896" />
                <stop offset="100%" stopColor="#A8854A" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="3" r="2.4" fill="url(#g5)" />
            <path d="M5 42 L5 20 A15 15 0 0 1 35 20 L35 42 Z" stroke="url(#g5)" strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M14 42 L14 22 A6 6 0 0 1 26 22 L26 42 Z" stroke="url(#g5)" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          <h1>Invy<b>tek</b></h1>
          <div className="line2">Des invitations<br />qu&apos;on n&apos;oublie pas.</div>
          <a href="/create" className="btn">Créer la vôtre</a>
        </div>

        <div className="wipe" id="wipe" />
        <div className="progress" id="prog" />
      </div>
    </>
  );
}
