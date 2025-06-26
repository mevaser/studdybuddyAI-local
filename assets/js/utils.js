// js/utils.js
export const select = (el, all = false) => {
  el = el.trim();
  return all ? [...document.querySelectorAll(el)] : document.querySelector(el);
};

export const on = (type, el, listener, all = false) => {
  if (all) {
    select(el, true).forEach((e) => e.addEventListener(type, listener));
  } else {
    const element = select(el);
    if (element) element.addEventListener(type, listener);
  }
};

export const onscroll = (el, listener) => {
  el.addEventListener("scroll", listener);
};

export function escapeHTML(str) {
  const div = document.createElement("div");
  div.innerText = str;
  return div.innerHTML;
}
