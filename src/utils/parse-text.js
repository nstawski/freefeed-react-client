import {
  withText,
  combine,
  hashTags,
  emails,
  mentions,
  linksEx,
  arrows,
  Link as TLink,
} from 'social-text-tokenizer';

import config from '../config';


const { textFormatter: { tldList }, siteDomains } = config;

export class Link extends TLink {
  localDomains = [];
  hostname = null;
  path = '/';

  constructor(link, localDomains) {
    super(link.offset, link.text);

    this.localDomains = localDomains;

    const m = this.href.match(/^https?:\/\/([^/]+)(.*)/i);
    if (m) {
      this.hostname = m[1].toLowerCase();
      this.path = m[2] || '/';
    }
  }

  get isLocal() {
    const p = this.localDomains.indexOf(this.hostname);
    if (p === -1) {
      return false;
    } else if (p === 0) {
      // First domain in localDomains list is the domain of main site.
      // These links are always local.
      return true;
    }

    // Other domains in localDomains list are alternative frontends or mirrors.
    // Such links should be treated as remote if theay lead to the domain root.
    return this.path !== '/';
  }

  get localURI() {
    return this.path;
  }
}

const tokenize = withText(combine(hashTags, emails, mentions, linksEx({ tldList }), arrows));

const enhanceLinks = (token) => (token instanceof TLink) ? new Link(token, siteDomains) : token;

export const parseText = (text) => tokenize(text).map(enhanceLinks);

export function getFirstLinkToEmbed(text) {
  return parseText(text)
    .filter((token) => (
      token instanceof Link
      && !token.isLocal
      && /^https?:\/\//i.test(token.text)
      && text.charAt(token.offset - 1) !== '!'
    ))
    .map((it) => it.href)[0];
}
