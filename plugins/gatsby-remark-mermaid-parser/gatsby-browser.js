exports.onRouteUpdate = () => {
  if(window.mermaid) {
    window.mermaid.contentLoaded();
  }
}