const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const blackAndWhiteMap = require('./styles/OS_VTS_27700_Black_and_White.json')
const masterMap = require('./styles/OS_VTS_27700_Outdoor.json')
const masterMapDark = require('./styles/OS_VTS_27700_Dark.json')
const openTile = require('./styles/open-tile.json')
const vtsTile = require('./styles/vts-tile.json')

const folder = 'v3-9-0-0'

// Add your routes here

require('./router/addLocalsMiddleware')(router, folder)

// User journey wireframe page
router.get('/user-journey', function (req, res) {
  res.render(folder + '/user-journey')
})

// set up route variable results page option
require('./router/addResultsPageRoutes')(router, folder)

// The "Find a location" step has been removed from this version's user flow - map search is
// planned to cover NGR, easting/northing and lat/long instead (see design spec). Redirect so
// no links break, registered before addLocationPageRoutes so it takes priority.
router.get('/location', (req, res) => res.redirect('/' + folder + '/map'))

require('./router/addLocationPageRoutes')(router, folder)
require('./router/addTriagePageRoutes')(router, folder)
require('./router/addCheckBoundaryPageRoutes')(router, folder)

// location.html still posts to "mock" (the low-fi map mock-up that led to /upload, inherited from the boundary-upload version). This version's location page should go straight to the map.
router.post('/mock', (req, res) => res.redirect('/' + folder + '/map?cz=504621.1,118518,15.912013'))
router.get('/mock', (req, res) => res.redirect('/' + folder + '/map?cz=504621.1,118518,15.912013'))

router.get('/defra-map/config', function (req, res) {
  res.json({
    version: 'v3-9-0-0',
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

router.get('/map-help', (req, res) => res.redirect('/v3-9-0-0/help'))
// The map's "get summary" button goes to /results at the site root, so send it to this version's results page.
// setupRouter() returns the kit's shared router, so this route also matches inside version paths such as
// /v3-9-0-0/results – only redirect at the site root, to avoid a redirect loop.
router.get('/results', (req, res, next) => {
  if (req.baseUrl) return next()
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
  res.redirect('/v3-9-0-0/results' + query)
})
router.get('/product-one', (req, res) => res.redirect('/v3-9-0-0/product1'))

// Product 1 variations for user research.
// /v3-9-0-0/p1/<variation> stores the variation in the session and opens the map with the Product 1 site
// boundary already drawn. "Get summary report" opens the results page, and its button goes to
// /v3-9-0-0/view-product-1, which redirects to the stored variation.
// See /v3-9-0-0/product1-variations for how to use these links in research sessions.
// setupRouter() returns the kit's shared router, so only respond inside this version's path.
const p1Variations = {
  'existing-map-features': 'product1-3',
  main: 'product1-3', // earlier link, kept so it still works
  'solid-colours': 'product1-5'
}
// Site boundary shown on the Product 1 mock-up maps (British National Grid), next to Wheelwrights and Mount Road
const p1Polygon = '[[443564.0,161397.81],[443568.1,161393.01],[443565.74,161385.65],[443590.32,161361.76],[443582.68,161353.08],[443559.07,161385.17],[443560.11,161393.01],[443564.0,161397.81]]'
router.get('/p1/:variation', (req, res, next) => {
  if (req.baseUrl !== '/v3-9-0-0') return next()
  const page = p1Variations[req.params.variation]
  if (!page) return next()
  req.session.data.p1Variation = page
  res.redirect('/v3-9-0-0/map?polygon=' + p1Polygon)
})
router.get('/view-product-1', (req, res, next) => {
  if (req.baseUrl !== '/v3-9-0-0') return next()
  const page = Object.values(p1Variations).includes(req.session.data.p1Variation) ? req.session.data.p1Variation : 'product1-3'
  res.redirect('/v3-9-0-0/' + page)
})

router.get('/assets/*', (req, res) => {
  const newPath = req.originalUrl.replace('/assets', '/public')
  res.redirect(newPath)
})

module.exports = router
