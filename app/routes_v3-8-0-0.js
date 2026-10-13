const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const blackAndWhiteMap = require('./styles/OS_VTS_27700_Black_and_White.json')
const masterMap = require('./styles/OS_VTS_27700_Outdoor.json')
const masterMapDark = require('./styles/OS_VTS_27700_Dark.json')
const openTile = require('./styles/open-tile.json')
const vtsTile = require('./styles/vts-tile.json')

const folder = 'v3-8-0-0'
const mapCodeUrl = process.env.FMP_MAP_CODE_URL || 'https://defra.github.io/fmp-map'

// Add your routes here

require('./router/addLocalsMiddleware')(router, folder, mapCodeUrl)

// User journey wireframe page
router.get('/user-journey', function (req, res) {
  res.render(folder + '/user-journey')
})

// set up route variable results page option
require('./router/addResultsPageRoutes')(router, folder)
require('./router/addLocationPageRoutes')(router, folder)
require('./router/addTriagePageRoutes')(router, folder)
require('./router/addCheckBoundaryPageRoutes')(router, folder)

// location.html still posts to "mock" (the low-fi map mock-up that led to /upload, inherited from the boundary-upload version). This version's location page should go straight to the map.
router.post('/mock', (req, res) => res.redirect('/' + folder + '/map?cz=504621.1,118518,15.912013'))
router.get('/mock', (req, res) => res.redirect('/' + folder + '/map?cz=504621.1,118518,15.912013'))

router.get('/defra-map/config', function (req, res) {
  res.json({
    version: 'v3-8-0-0',
    OS_ACCOUNT_NUMBER: '12345678',
    layerNameSuffix: '_NON_PRODUCTION',
    agolServiceUrl: 'https://services1.arcgis.com/JZM7qJpmv7vJ0Hzx/arcgis/rest/services',
    agolVectorTileUrl: 'https://tiles.arcgis.com/tiles/JZM7qJpmv7vJ0Hzx/arcgis/rest/services'
  })
})

router.get('/map/styles/open-tile.json', (req, res) => res.json(openTile))
router.get('/map/styles/vts-tile.json', (req, res) => res.json(vtsTile))
router.get('/map/styles/black-and-white-map', (req, res) => res.json(blackAndWhiteMap))
router.get('/map/styles/master-map', (req, res) => res.json(masterMap))
router.get('/map/styles/master-map-dark', (req, res) => res.json(masterMapDark))

router.get('/defra-map/info-panel', async (req, res) => {
  const params = req.query
  res.render(`${folder}/info-panel`, { ...params, gaId: '12345' })
})

router.get('/map-help', (req, res) => res.redirect('/v3-8-0-0/help'))
// The map's "get summary" button goes to /results at the site root, so send it to this version's results page.
// setupRouter() returns the kit's shared router, so this route also matches inside version paths such as
// /v3-8-0-0/results – only redirect at the site root, to avoid a redirect loop.
router.get('/results', (req, res, next) => {
  if (req.baseUrl) return next()
  // v3-9-0-0 uses the same shared map, so let its own /results route handle requests from its pages
  if ((req.get('Referer') || '').includes('/v3-9-0-0/')) return next()
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
  res.redirect('/v3-8-0-0/results' + query)
})
router.get('/product-one', (req, res) => res.redirect('/v3-8-0-0/product1'))

router.get('/assets/*', (req, res) => {
  const newPath = req.originalUrl.replace('/assets', '/public')
  res.redirect(newPath)
})

module.exports = router
