import '@testing-library/jest-dom'

class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}

window.ResizeObserver = ResizeObserver

if (typeof window.TextEncoder === 'undefined') {
    const { TextEncoder, TextDecoder } = require('util')
    global.TextEncoder = TextEncoder
    global.TextDecoder = TextDecoder
}
