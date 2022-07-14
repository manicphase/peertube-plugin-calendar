async function register ({
  registerHook,
  registerSetting,
  settingsManager,
  storageManager,
  videoCategoryManager,
  videoLicenceManager,
  videoLanguageManager,
  getRouter
}) {
  const router = getRouter()
  router.get('/ping', (req, res) => res.json({ message: 'pong' }))
}

async function unregister () {
  return
}

module.exports = {
  register,
  unregister
}
