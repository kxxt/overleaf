import Settings from '@overleaf/settings'
import { HttpsProxyAgent } from 'https-proxy-agent'

let proxyAgent
let proxyUrl

/**
 * Return the proxy agent for Zotero requests, or null when no proxy is
 * configured via the ZOTERO_HTTP_PROXY setting.
 */
function getProxyAgent() {
  const configuredUrl = Settings.zotero?.httpProxy
  if (!configuredUrl) {
    proxyAgent = null
    proxyUrl = null
    return null
  }
  if (!proxyAgent || proxyUrl !== configuredUrl) {
    proxyUrl = configuredUrl
    proxyAgent = new HttpsProxyAgent(configuredUrl)
  }
  return proxyAgent
}

/**
 * Return fetch options that route Zotero requests through the proxy
 * configured via the ZOTERO_HTTP_PROXY setting. Returns an empty object
 * when no proxy is configured.
 */
function getProxyFetchOpts() {
  const agent = getProxyAgent()
  return agent ? { agent } : {}
}

export { getProxyAgent, getProxyFetchOpts }
