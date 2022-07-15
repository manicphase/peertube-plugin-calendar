function register ({ registerClientRoute, registerHook, peertubeHelpers }) {
  registerClientRoute({
    route: 'calendar',
    onMount: ({ rootEl }) => {
      rootEl.innerHTML = 'hello'
    }
  })
}

export {
  register
}
