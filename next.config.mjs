/** @type {import('next').NextConfig} */
import pwaWrapper from 'next-pwa'

const withPWA = pwaWrapper({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
})

export default withPWA({
    // other Next.js config
})