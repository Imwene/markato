if(!self.define){let e,s={};const n=(n,i)=>(n=new URL(n+".js",i).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(i,r)=>{const o=e||("document"in self?document.currentScript.src:"")||location.href;if(s[o])return;let l={};const a=e=>n(e,o),u={module:{uri:o},exports:l,require:a};s[o]=Promise.all(i.map((e=>u[e]||a(e)))).then((e=>(r(...e),l)))}}define(["./workbox-1ea6f077"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"android-chrome-192x192.png",revision:"1ef026ed13d7693a19a8a45829654b25"},{url:"android-chrome-512x512.png",revision:"a0ebb06ccaa8088f0a936e6f7904a383"},{url:"apple-touch-icon.png",revision:"e0d17b43f6db63a530c767af38b27793"},{url:"assets/chunk/admin-HGP0qAwK.js",revision:null},{url:"assets/chunk/BookingComponent-f4IX4Wkc.js",revision:null},{url:"assets/chunk/BusinessMap-mO1fNyK1.js",revision:null},{url:"assets/chunk/FeatureSection-Ddb5EF0m.js",revision:null},{url:"assets/chunk/Footer-C47QJ0xv.js",revision:null},{url:"assets/chunk/HeroSection-CRSAlhBj.js",revision:null},{url:"assets/chunk/Login-DzWdq_qh.js",revision:null},{url:"assets/chunk/useConfig-Bs4z4don.js",revision:null},{url:"assets/chunk/utils-l0sNRNKZ.js",revision:null},{url:"assets/chunk/Workflow-f28aRlYV.js",revision:null},{url:"assets/css/index-CR--Glhh.css",revision:null},{url:"assets/images/markato-logo-DizJd7vt.svg",revision:null},{url:"assets/index-BASjt89t.js",revision:null},{url:"assets/vendor/auth-vendor-sPk1YpsG.js",revision:null},{url:"assets/vendor/map-vendor-OUBG0Ih5.js",revision:null},{url:"assets/vendor/react-vendor-D7383juu.js",revision:null},{url:"assets/vendor/ui-vendor-B-ENX0mK.js",revision:null},{url:"favicon-16x16.png",revision:"546558831e04a279ca27056c86b12e33"},{url:"favicon-32x32.png",revision:"eee9f3bee3588887df3230d174ab161a"},{url:"icon-192.png",revision:"d41d8cd98f00b204e9800998ecf8427e"},{url:"icon-512.png",revision:"d41d8cd98f00b204e9800998ecf8427e"},{url:"index.html",revision:"a1932b1fa1e9ec4bf0b791ee3664b7e1"},{url:"maskable-icon.png",revision:"a9e6a6e7e3b114a268dd3ff11a83d3f1"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"vite.svg",revision:"8e3a10e157f75ada21ab742c022d5430"},{url:"android-chrome-192x192.png",revision:"1ef026ed13d7693a19a8a45829654b25"},{url:"android-chrome-512x512.png",revision:"a0ebb06ccaa8088f0a936e6f7904a383"},{url:"apple-touch-icon.png",revision:"e0d17b43f6db63a530c767af38b27793"},{url:"manifest.webmanifest",revision:"8ac8b89145ba666b41b6eabed0bb7995"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html"))),e.registerRoute(/^https:\/\/api\.your-domain\.com\/.*/i,new e.NetworkFirst({cacheName:"api-cache",plugins:[new e.ExpirationPlugin({maxEntries:100,maxAgeSeconds:86400})]}),"GET")}));
