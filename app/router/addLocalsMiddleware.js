const backlink = '<a href="javascript:history.back()" class="govuk-back-link">Back</a>'

const addLocalsMiddleware = (router, folder, mapCodeUrl) => {
  router.use(function (req, res, next) {
    // set a folder and store in locals
    // this can then be used in pages as {{folder}}
    res.locals.folder = folder
    res.locals.mapCodeUrl = mapCodeUrl
    res.locals.backlink = backlink
    // permit and autostore data set in all statement at bottom
    res.locals.permit = res.locals.data
    next()
  })
}

module.exports = addLocalsMiddleware
