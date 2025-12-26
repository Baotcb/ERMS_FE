import { renderHook, act } from '@testing-library/react'
import { useStore } from './store'

describe('Zustand Store', () => {
    beforeEach(() => {
        const { result } = renderHook(() => useStore())
        act(() => {
            result.current.reset()
        })
    })

    it('should start with count 0', () => {
        const { result } = renderHook(() => useStore())
        expect(result.current.count).toBe(0)
    })

    it('should increase count', () => {
        const { result } = renderHook(() => useStore())
        act(() => {
            result.current.increase()
        })
        expect(result.current.count).toBe(1)
    })

    it('should decrease count', () => {
        const { result } = renderHook(() => useStore())
        // First increase to test decrease from 1
        act(() => {
            result.current.increase()
        })
        act(() => {
            result.current.decrease()
        })
        expect(result.current.count).toBe(0)
    })

    it('should reset count', () => {
        const { result } = renderHook(() => useStore())
        act(() => {
            result.current.increase()
            result.current.increase()
        })
        expect(result.current.count).toBe(2)
        act(() => {
            result.current.reset()
        })
        expect(result.current.count).toBe(0)
    })
})
