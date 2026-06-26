/* AfriversalAI — shared messaging utilities
 * Loaded by dashboard.html and admin.html before their inline scripts.
 * Defines the shared localStorage bus constants and escapeHtml.
 */
const MSG_KEY = 'afv_admin_threads'
function loadThreads() { try { return JSON.parse(localStorage.getItem(MSG_KEY) || '{}') } catch (e) { return {} } }
function saveThreads(t) { localStorage.setItem(MSG_KEY, JSON.stringify(t)) }
function escapeHtml(s) { return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])) }
