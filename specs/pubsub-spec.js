'use strict'

let pubsub = require('../src/pubsub')

describe('pubsub', () => {
  describe('#publish', () => {
    it('triggers the callback of a subscribed message', () => {
      let cb = jasmine.createSpy('cb')

      pubsub.subscribe('test', cb)
      pubsub.publish('test')
      expect(cb).toHaveBeenCalled()
    })
  })

  describe('#subscribe', () => {
    it('returns a handle to the subscribed method', () => {
      let cb = jasmine.createSpy('cb')
      let sub = pubsub.subscribe('test', cb)

      expect(sub).toEqual({
        message: 'test',
        func: cb,
      })
    })

    it('calls the function with the specified arguments', () => {
      let cb = jasmine.createSpy('cb')

      pubsub.subscribe('test', cb)
      pubsub.publish('test', 'a', 'b', 'c')

      expect(cb).toHaveBeenCalledWith('a', 'b', 'c')
    })
  })

  describe('#unsubscribe', () => {
    it('removes a subscribed message', () => {
      let cb = jasmine.createSpy('cb')
      let sub = pubsub.subscribe('test', cb)

      pubsub.unsubscribe('test')
      pubsub.publish('test')

      expect(cb).not.toHaveBeenCalled()
    })
  })
})
