import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
    locales: ['en', 'hi', 'te', 'ta', 'mr'],
    defaultLocale: 'en'
})

export const config = {
    matcher: ['/((?!api|auth|_next|.*\\..*).*)']
}
