import {isBrowser} from "../components/Redoc/Markdown/SanitizedMdBlock";

export const scrollToId = (id) => {
  if(isBrowser()) {
    const element = document.getElementById(id);
    if (element != null) {
      element.scrollIntoView({behavior: "smooth"});
    }
  }
}