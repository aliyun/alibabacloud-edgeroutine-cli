(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([[1],{"83Zx":function(e,t,i){"use strict";var a=i("fbTi"),n=i("mZ4U");Object.defineProperty(t,"__esModule",{value:!0}),t.default=void 0,i("IkMd");var r=n(i("EiKI")),s=a(i("FQm9")),d=n(i("jCnN")),o=n(i("sY0p"));i("Payx");var A=r.default.Content;class u extends s.Component{constructor(e){super(e),this.initTitle=(()=>{document.title="ER";var e=document.createElement("link");e.setAttribute("type","image/x-icon"),e.setAttribute("rel","icon"),e.setAttribute("href",o.default),document.head.appendChild(e)}),this.state={width:e.width||-1,height:e.height||-1}}componentDidMount(){this.updateSize(),window.addEventListener("resize",()=>this.updateSize())}componentWillUnmount(){window.removeEventListener("resize",()=>this.updateSize())}updateSize(){try{var e=d.default.findDOMNode(this).parentNode,t=this.props,i=t.width,a=t.height;i||(i=e.offsetWidth),this.setState({width:i,height:a})}catch(e){}}render(){var e=this.props.children;return this.initTitle(),s.default.createElement(r.default,null,s.default.createElement(A,null,e))}}var h=u;t.default=h},Payx:function(e,t,i){e.exports={verticalLine:"verticalLine"}},sY0p:function(e,t){e.exports="data:image/vnd.microsoft.icon;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAACgUlEQVRIS8WXPYgTQRTH/2835pKZC5yIhaDiF1eejWehFmflaaWC16hzBAs5W2200VSKaCNoIXIxe4eIVyiIojZaiOJXJQjaKNoICgbjzsY7dubYTXaZhOAluazZYnmzO+/93nszb/YtoekauFnebKXSI+T7W5vfdTUm67XyrQ/VfPaLqU/mIOvISwR9sivAEkoEzLmCT0TTYjBzXG3qatCzXjhA0GOmHSl4yAxv3HHvaOBQOEGrgo8Vt/5OZj71ApwpehtsW12M7GvQZU+wUxS8sGz1ue5FQzp6AY5ssFLlHMg6G4x9tbCFmOPuA/AgeKB8a2PzJugVfKBUHbbJ/xgm1aKDFHkSrKkn2O5egVrZyTryabjmWhW6Ag9OV1b7KToMYIpAL5RvFdrJVNvgXOn3Kt+2N4XeK2gp+NtAZCX3BAhXjaiuS8GPx+s5645GsjzC30RyZ2Cyf9YVRyNwbMAgR2USOjbjXYNWUwDuScEP9AzMZtz90LhrcM9Lwc/EEScFHir+Gpq30/cB7ILWP5Syt5trnFjEtXWO6/KlFHyHuYuXDWaOG2yMbaFRwjt5lNfkJMHZWbmWlP5mRqJBE55gc8mCp+U6SumvJpigx10x+DhRcL1en4Owsw5/LwUfSTzVASA8QFrUcRsRP4RWewG8Svvz4+X8ynKgs+wD5F9g5rjHANyIMqNBFzzBTicObvi21+jfpeBrkgCj4bg0vrv1qB9JwYO0d5bqBaR4lLbqJIt3eaYk17d6zp0/exSsKwQ9DK2faNJFT+RudwQ2S6lTOVOsjFXzuYa+re3N1SlsqfmN4H61Pn1r9oL09KW9jY/AfjT0EbwvvzAR/H/9tC0CmXhrtZ0ygzQAAAAASUVORK5CYII="}}]);