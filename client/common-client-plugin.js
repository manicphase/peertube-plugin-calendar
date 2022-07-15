function register ({ registerClientRoute, registerHook, peertubeHelpers }) {

  registerHook({
    target: 'filter:left-menu.links.create.result',
    handler: (result) => {
      return [
        {
          key: 'in-my-stuff',
          title: 'In my stuff',
          links: [
            {
              path: '/about',
              icon: 'alert',
              shortLabel: 'About',
              label: 'About'
            },

            {
              path: peertubeHelpers.getBasePluginClientPath() + '/my-super/route',
              icon: '',
              shortLabel: 'super route',
              label: 'Super route'
            }
          ]
        }
      ].concat(result)
    }
  })

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
